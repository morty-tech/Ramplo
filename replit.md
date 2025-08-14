# RampLO - AI-Powered Mortgage Loan Officer Ramp Plan

## Overview

RampLO is a 90-day AI-powered ramp plan designed to help mortgage loan officers secure their first 1-3 deals. The application provides personalized daily tasks, progress tracking, outreach templates, and deal coaching tools. Morty users get free access while non-Morty users pay $49/month.

The platform features a comprehensive 9-step onboarding questionnaire that captures detailed industry-specific information: personal details (name, email, market, state licensing, NMLS), experience level (new/<1y/1-3y/3+), focus areas (purchase/refi/HELOC/investor/non-QM), borrower types (FTHB/move-up/cash-out/investor), time availability (30/60/90+ minutes), outreach comfort level (low/medium/high), network assets (realtor relationships, past clients, social channels), communication preferences (professional/friendly/direct tone), and 90-day goals. This rich data enables highly personalized AI task generation and coaching.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)
- **Authentication**: Magic link authentication system with email-based login
- **Development**: Hot module replacement via Vite in development mode

### Data Storage
- **Database**: PostgreSQL with Neon serverless driver (@neondatabase/serverless)
- **Schema Management**: Drizzle Kit for migrations and schema definitions
- **Tables**: Users, enhanced user profiles (with 15+ industry-specific fields), tasks, progress tracking, magic links, marketing templates, deal coach sessions, and session storage
- **Enhanced Profile Fields**: Full name, email, market/city, states licensed, NMLS ID, experience level, focus areas, borrower types, time availability, outreach comfort, network assets, social channels, tone preference, communication channels, and goals

### Authentication & Authorization
- **Magic Link System**: Passwordless authentication using secure tokens
- **User Types**: Morty users (identified by email domain) get free access, others require subscription
- **Session Storage**: Server-side sessions stored in PostgreSQL
- **Token Security**: 32-byte random tokens with 30-minute expiration

### Payment Integration
- **Payment Processor**: Stripe for subscription management
- **Pricing Model**: $49/month for non-Morty users
- **Payment UI**: Stripe Elements with React Stripe.js integration
- **Customer Management**: Stripe customer and subscription tracking

## External Dependencies

- **Database**: Neon PostgreSQL serverless database
- **Email Service**: SendGrid for magic link email delivery (configured but using console logging in development)
- **Payment Processing**: Stripe for subscription billing and payment processing
- **UI Components**: Radix UI primitives for accessible component foundation
- **Deployment**: Replit-specific configuration with development banner and cartographer integration
- **Development Tools**: Vite with runtime error overlay and hot module replacement