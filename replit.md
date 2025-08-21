# RampLO - AI-Powered 90-Day Loan Officer Training Platform

## Overview

RampLO is an AI-powered 90-day training platform designed to help mortgage loan officers secure their first 1-3 deals. The application provides personalized daily tasks, progress tracking, outreach templates, and deal coaching to guide new loan officers through a structured ramp-up process. Morty users receive free access, while other users pay $49/month for the service.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom brand colors (aura, eclipse, electric, frost themes)
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: Express sessions with PostgreSQL store for server-side session persistence
- **Authentication**: Passwordless magic link authentication system
- **Development**: Hot reload with nodemon and tsx for TypeScript execution

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless driver
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **Tables**: Users, enhanced user profiles (15+ industry-specific fields), tasks, progress tracking, magic links, marketing templates, deal coach sessions, daily connections/loan actions tracking, and session storage
- **Migration Strategy**: Custom migration script (`migrate.js`) with push, generate, and migrate commands

### Authentication & Authorization
- **Method**: Magic link authentication (passwordless)
- **User Segmentation**: Morty users (free access) vs. paid users ($49/month)
- **Session Storage**: Server-side PostgreSQL sessions
- **Access Control**: Route-based protection with paywall overlay for non-subscribed users

### Core Business Features
- **Personalized Roadmap**: AI-generated 90-day plans based on comprehensive user profiles
- **Daily Task System**: Structured tasks with categories, time estimates, and completion tracking
- **Progress Tracking**: Week/day progression based on business days since start date
- **Outreach Templates**: Editable email templates with real-time auto-save functionality
- **Deal Coaching**: AI-driven coaching sessions for loan guidance
- **Connection Tracking**: Daily tracking of phone calls, texts, emails, and loan actions
- **Onboarding Flow**: 9-step questionnaire capturing detailed user profiles

### Payment Integration
- **Processor**: Stripe for subscription management
- **Pricing Model**: $49/month for non-Morty users
- **Implementation**: Stripe Elements with React Stripe.js
- **Features**: Subscription tracking, automatic 90-day cancellation via `cancel_at` parameter

### AI Integration
- **Provider**: OpenAI API for content generation and personalization
- **Use Cases**: Roadmap generation, template customization, deal coaching
- **Context Building**: Comprehensive user profile analysis for personalized AI responses

### Deployment Architecture
- **Platform**: Vercel with Node.js 20.x runtime
- **Build Process**: Vite for client assets, Express server for API
- **Environment Management**: Standard environment variables across all environments
- **Static Assets**: Served from `/public` directory in production

## External Dependencies

### Core Services
- **Database**: Neon PostgreSQL (serverless)
- **Email Service**: SendGrid for magic link delivery
- **Payment Processing**: Stripe for subscriptions and billing
- **AI Services**: OpenAI API for content generation

### Development Tools
- **Build Tool**: Vite with React plugin
- **Database Toolkit**: Drizzle Kit for schema management
- **File Processing**: AdmZip for template extraction
- **Session Store**: connect-pg-simple for PostgreSQL session storage

### UI Dependencies
- **Component Library**: Radix UI primitives with Shadcn/ui components
- **Icons**: Heroicons and Lucide React
- **Styling**: Tailwind CSS with PostCSS
- **Fonts**: Google Fonts (DM Sans, Plus Jakarta Sans, Fira Code)

### Deployment Dependencies
- **Hosting**: Vercel platform
- **Runtime**: Node.js 20.x
- **Process Management**: tsx for TypeScript execution
- **Environment**: Standard environment variables for configuration