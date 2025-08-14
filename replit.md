# RampLO - AI-Powered Mortgage Loan Officer Ramp Plan

## Overview

RampLO is a 90-day AI-powered ramp plan designed to help mortgage loan officers secure their first 1-3 deals. The application provides personalized daily tasks, progress tracking, outreach templates, and deal coaching tools. Morty users get free access while non-Morty users pay $49/month.

The platform features a comprehensive onboarding questionnaire that gathers user information for AI personalization, including experience level, market, network size, preferred outreach channels, and goals. Users receive a structured 13-week program with daily tasks, streak tracking, and loan progress monitoring.

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
- **Tables**: Users, user profiles, tasks, progress tracking, magic links, marketing templates, deal coach sessions, and session storage

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