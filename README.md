# Eventflow Hackathon Project

## Project Overview
**Eventflow** is a hackathon project designed to automate certificate generation and distribution for events. It allows organizers to manage participants, generate certificates with unique QR codes, and send them efficiently via email.

website="https://digital-seal-ai-main-pygvovicd-soubhik19s-projects.vercel.app/"

## Features
- Upload participant data via CSV.
- Generate certificates automatically.
- Add unique QR codes to each certificate.
- Send certificates via email in bulk.
- User-friendly interface with real-time previews.

## Tech Stack
- Frontend: HTML, TailwindCSS, JavaScript
- Backend: Node.js
- Database: Supabase
- Others: EmailJS for email automation

## Getting Started

### Prerequisites
- Node.js & npm installed
- Supabase account and project set up
- EmailJS account configured

### Installation
```bash
# Clone the repository
git clone https://github.com/Soubhik19/Eventflow-Hackthon.git

# Navigate to project directory
cd Eventflow-Hackthon

# Install dependencies
npm install

# Start development server
npm run dev
Configuration

Rename .env.example to .env.

Add your Supabase and EmailJS credentials in the .env file.

Workflow

Upload a CSV file containing participant names and emails.

Certificates are generated automatically with QR codes.

Organizers can review certificates in the dashboard.

Send certificates via email to all participants in bulk.

Database updates are made automatically for tracking.

Contributing

Fork the repository.

Create a new branch: git checkout -b feature/your-feature.

Commit your changes: git commit -m 'Add some feature'.

Push to the branch: git push origin feature/your-feature.

Open a Pull Request.
