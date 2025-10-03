# 🎯 EmailJS Setup Guide for soubhiksamanta25@gmail.com

## Quick 5-Minute Setup for Automated Emails

### Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up with your email: **soubhiksamanta25@gmail.com**
3. Verify your email account

### Step 2: Add Gmail Service
1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Select **Gmail**
4. Connect your Gmail account (soubhiksamanta25@gmail.com)
5. Note the **Service ID** (looks like: `service_abc123`)

### Step 3: Create Email Template
1. Go to "Email Templates" 
2. Click "Create New Template"
3. Use this **exact template**:

**Template Settings:**
- Template Name: `Certificate Email`
- Subject: `{{subject}}`
- To Email: `{{to_email}}`
- From Name: `{{from_name}}`
- Reply To: `{{reply_to}}`

**Email Content:**
```
Dear {{to_name}},

Congratulations on completing {{event_name}}!

Your certificate details:
• Certificate ID: {{certificate_id}}
• Verification URL: {{verification_url}}

Best regards,
{{from_name}}
```

4. Save template and note the **Template ID** (looks like: `template_xyz456`)

### Step 4: Get Public Key
1. Go to "Account" → "General"
2. Copy your **Public Key** (looks like: `12345abcdef`)

### Step 5: Update Configuration
Replace these values in your `.env.local` file:

```env
VITE_EMAILJS_SERVICE_ID=your_actual_service_id
VITE_EMAILJS_TEMPLATE_ID=your_actual_template_id  
VITE_EMAILJS_PUBLIC_KEY=your_actual_public_key
```

### Step 6: Test It!
1. Restart your dev server: `npm run dev`
2. Go to your app and try the "Test EmailJS Configuration" button
3. If successful, all emails will be sent automatically!

---

**Free Plan Limits:**
- 200 emails per month
- Perfect for testing and small events
- Can upgrade later for more emails

**Your Gmail Integration:**
- Emails will be sent from: soubhiksamanta25@gmail.com
- Recipients will see your Gmail address as sender
- Professional and trustworthy for participants