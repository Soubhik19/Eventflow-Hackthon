-- Complete database schema for Digital Certificate System
-- Run this in Supabase SQL Editor

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'organizer', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  organization TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  
  -- Add default organizer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'organizer');
  
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS policies for events
CREATE POLICY "Organizers can view their own events"
ON public.events
FOR SELECT
TO authenticated
USING (organizer_id = auth.uid());

CREATE POLICY "Organizers can create events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Organizers can update their own events"
ON public.events
FOR UPDATE
TO authenticated
USING (organizer_id = auth.uid());

CREATE POLICY "Organizers can delete their own events"
ON public.events
FOR DELETE
TO authenticated
USING (organizer_id = auth.uid());

-- Create participants table
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, email)
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for participants
CREATE POLICY "Organizers can view participants for their events"
ON public.participants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = participants.event_id
    AND events.organizer_id = auth.uid()
  )
);

CREATE POLICY "Organizers can insert participants for their events"
ON public.participants
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = participants.event_id
    AND events.organizer_id = auth.uid()
  )
);

CREATE POLICY "Organizers can update participants for their events"
ON public.participants
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = participants.event_id
    AND events.organizer_id = auth.uid()
  )
);

CREATE POLICY "Organizers can delete participants for their events"
ON public.participants
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = participants.event_id
    AND events.organizer_id = auth.uid()
  )
);

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  certificate_hash TEXT NOT NULL UNIQUE,
  qr_code_data TEXT,
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'verified')),
  verified_count INTEGER DEFAULT 0,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  last_verified_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS policies for certificates
CREATE POLICY "Organizers can view certificates for their events"
ON public.certificates
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = certificates.event_id
    AND events.organizer_id = auth.uid()
  )
);

-- THIS IS THE IMPORTANT POLICY THAT WAS MISSING!
CREATE POLICY "Organizers can insert certificates for their events"
ON public.certificates
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = certificates.event_id
    AND events.organizer_id = auth.uid()
  )
);

CREATE POLICY "Organizers can update certificates for their events"
ON public.certificates
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = certificates.event_id
    AND events.organizer_id = auth.uid()
  )
);

-- Public policy for verification portal
CREATE POLICY "Anyone can verify certificates"
ON public.certificates
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Verified count can be incremented"
ON public.certificates
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Success message
SELECT 'Database schema created successfully! ✅' as result;