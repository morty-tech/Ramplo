# RampLO - AI-Powered Mortgage Loan Officer Training Platform

A comprehensive 90-day ramp plan designed to help mortgage loan officers secure their first 1-3 deals through personalized daily tasks, progress tracking, and AI-powered coaching.

## Features

- 📈 **Personalized Roadmaps**: AI-generated daily tasks based on user profile
- 📊 **Progress Tracking**: Automatic week/day progression with visual indicators
- 📝 **Email Templates**: Editable outreach templates with real-time auto-save
- 🤖 **AI Deal Coaching**: Contextual coaching sessions for deal progression
- 💳 **Subscription Management**: Stripe integration with 90-day auto-cancellation
- 🎯 **Performance Analytics**: Connection tracking and loan action monitoring

## Tech Stack

- **Frontend**: React + TypeScript, Vite, Tailwind CSS, Shadcn/ui
- **Backend**: Node.js + Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Payment**: Stripe for subscription management
- **Authentication**: Magic link authentication with SendGrid
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- SendGrid account (for magic links)

### Environment Variables

Create a `.env` file with:

```bash
# Database
DATABASE_URL="postgresql://..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
VITE_STRIPE_PUBLIC_KEY="pk_..."
STRIPE_PRICE_ID="price_..."

# SendGrid
SENDGRID_API_KEY="SG..."
```

### Installation

```bash
# Install dependencies
npm install

# Set up database
npm run db:push

# Start development server
npm run dev
```

### Deployment to Vercel

1. Push to GitHub
2. Connect GitHub repo to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── attached_assets/ # Static assets
└── vercel.json     # Vercel configuration
```

## Core Workflows

- **Onboarding**: 9-step questionnaire for user profiling
- **Daily Tasks**: AI-generated based on experience level and goals
- **Templates**: Customizable email templates for outreach
- **Deal Coaching**: AI-powered guidance for loan progression
- **Progress Tracking**: Business day calculations and streak monitoring

## Team Development

- Templates and action plans are easily configurable
- Database-driven content allows rapid iteration
- OpenAI integration points are clearly defined in the backend
- Full Git workflow with branch-based development