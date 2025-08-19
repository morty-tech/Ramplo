# RampLO - AI-Powered Mortgage Loan Officer Ramp Plan

## Overview

RampLO is an AI-powered 90-day ramp plan designed to help mortgage loan officers secure their first 1-3 deals. It provides personalized daily tasks, progress tracking, outreach templates, and deal coaching tools. Access is free for Morty users and subscription-based for others. The platform uses a 9-step onboarding questionnaire to gather detailed industry-specific information, enabling highly personalized AI task generation and coaching.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript (Vite)
- **UI Library**: Shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: Magic link authentication

### Data Storage
- **Database**: PostgreSQL (Neon serverless driver)
- **Schema Management**: Drizzle Kit
- **Migration Script**: `migrate.js` provides convenient database management commands
- **Tables**: Users, enhanced user profiles (15+ industry-specific fields), tasks, progress tracking, magic links, marketing templates, deal coach sessions, and session storage.

### Authentication & Authorization
- **Method**: Passwordless magic link system
- **User Types**: Morty users (free access), others (subscription required)
- **Session Storage**: Server-side, PostgreSQL

### Payment Integration
- **Processor**: Stripe for subscription management
- **Pricing**: $49/month for non-Morty users
- **UI**: Stripe Elements with React Stripe.js
- **Features**: Subscription tracking, 90-day auto-cancellation configured via `cancel_at` parameter.

### Core Features
- **Personalized Daily Tasks**: AI-generated based on user profile.
- **Progress Tracking**: Automatic week/day progression based on business days elapsed since start date.
- **Outreach Templates**: Editable email templates with real-time auto-save.
- **Deal Coaching Tools**: AI-driven coaching sessions.
- **Onboarding**: Comprehensive 9-step questionnaire for detailed user profiling.
- **Branding**: Vibrant color palette (Aura, Eclipse, Electric, Frost, Carbon) for consistent UI.

## Development Tools

### Database Migration
The project includes a custom migration script for managing database schema changes:

```bash
# Push schema changes directly to database (recommended for development)
node migrate.js push

# Generate migration files from schema changes
node migrate.js generate

# Apply migration files to database
node migrate.js migrate
```

Alternative using npm scripts:
```bash
npm run db:push  # Equivalent to migrate.js push
```

The migration script automatically detects schema changes from `shared/schema.ts` and applies them to the connected PostgreSQL database.

### Environment Configuration
The project uses environment-aware configuration that automatically switches between development and production settings:

**Development Environment** (workspace):
- Uses `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLIC_KEY`, `STRIPE_PRICE_ID`
- Uses `DATABASE_URL` (development database)
- Email sending disabled (logs only)
- Detected by absence of `REPLIT_DEPLOYMENT=1`

**Production Environment** (deployment):
- Uses `STRIPE_SECRET_KEY_PROD`, `VITE_STRIPE_PUBLIC_KEY_PROD`, `STRIPE_PRICE_ID_PROD`
- Uses `DATABASE_URL_PROD` (production database)
- Email sending enabled via SendGrid
- Detected by `REPLIT_DEPLOYMENT=1` or `.replit.app` hostname

Configuration files:
- `server/config.ts` - Backend environment configuration
- `client/src/lib/config.ts` - Frontend environment configuration

## External Dependencies

- **Database**: Neon PostgreSQL
- **Email Service**: SendGrid (for magic link delivery)
- **Payment Processing**: Stripe
- **UI Components**: Radix UI