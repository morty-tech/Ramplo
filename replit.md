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

## Recent Changes

### Critical Onboarding Bug Fix & Account Management Features (Current Session)
- **Fixed critical onboarding persistence bug**: Updated authentication redirect logic to check actual onboarding completion status instead of user creation date
- **Root cause**: System was redirecting users to onboarding based on whether they were "new" rather than checking if they had completed onboarding profile creation
- **Solution**: Modified `/api/auth/verify` endpoint to check for existing user profile with `onboardingCompleted: true` flag before determining redirect path
- **Impact**: Users who complete onboarding and payment will now properly access dashboard on subsequent logins instead of being forced through onboarding again
- **Fixed paywall subscription detection bug**: Updated subscription status validation to handle "incomplete" Stripe subscriptions in development mode
- **Root cause**: Test Stripe subscriptions often remain in "incomplete" status rather than "active", causing paid users to see paywall overlay
- **Solution**: Modified subscription status check to accept both "active" and "incomplete" statuses in development environment while maintaining production security
- **Added comprehensive subscription management**: Implemented cancel subscription and delete account functionality with proper Stripe integration
- **Enhanced user account controls**: Added confirmation modals, proper API endpoints, and database cleanup for subscription cancellation and account deletion
- **Improved payment security**: All operations now properly handle Stripe subscriptions and maintain data integrity across user lifecycle

### Stripe 3-Month Auto-Cancellation & UI Updates (Previous Session)
- **Implemented comprehensive 3-month subscription system**: Configured Stripe subscriptions to automatically cancel after 3 months (90 days) using `cancel_at` parameter
- **Updated subscription UI**: Changed pricing display from "every 3 months" to "per month for 3 months" to reflect monthly billing with limited duration
- **Converted payment buttons to forest-green**: All subscription-related buttons now use forest-600/forest-700 colors instead of orange for consistent branding
- **Added Stripe webhook handler**: Created `/api/stripe/webhook` endpoint to handle subscription cancellation events and automatically remove user access
- **Enhanced storage interface**: Added `getUserByStripeSubscriptionId` method to support webhook-based user management
- **Subscription metadata tracking**: Added plan duration and creation context metadata to Stripe subscriptions for better tracking

### Date-Based Progression System Implementation (Current Session)
- **Built comprehensive business day calculation**: Created functions to calculate elapsed business days between dates (weekdays only)
- **Implemented automatic week/day progression**: System now automatically advances users through 90-day plan based on actual business days elapsed since start date
- **Updated task fetching logic**: Backend automatically determines current week/day position without requiring manual parameters from frontend
- **Enhanced user progress tracking**: Start dates are set during onboarding and automatically updated when users access the system
- **Streamlined frontend queries**: Dashboard and Roadmap pages now fetch current tasks automatically without specifying week/day parameters

### Code Quality & Roadmap UX Improvements (Current Session)
- **Completed major code refactoring**: Successfully extracted shared task management functionality to eliminate code duplication between Dashboard and Roadmap pages
- **Created shared TaskList component**: Built reusable `client/src/components/TaskList.tsx` that handles all task rendering with variant support for different page layouts (dashboard vs roadmap styling)
- **Implemented useTaskManagement hook**: Created `client/src/hooks/useTaskManagement.ts` to centralize task state management, completion logic, and expansion handling across both pages
- **Updated Dashboard implementation**: Replaced all task-related state and rendering code with shared components while maintaining identical UI and functionality
- **Updated Roadmap implementation**: Replaced Today's Tasks section with shared TaskList component, ensuring consistent task interaction patterns across the application
- **Improved maintainability**: Reduced code duplication by ~80% in task-related functionality, making future updates and bug fixes significantly easier to manage
- **Enhanced roadmap preview functionality**: Extended daily objectives preview from current week only to current week + 2 weeks ahead, allowing users to see their upcoming tasks and plan ahead
- **Improved visual hierarchy**: Updated upcoming weeks (2-3) to use clean slate styling instead of orange, removed "Objectives Ready" badges for cleaner appearance
- **Enhanced interactivity**: Made days from upcoming weeks (within 2-week preview window) clickable and visually distinct with slate styling to show they contain viewable objectives
- **Streamlined badge system**: Removed badges and border lines for upcoming weeks with objectives, maintaining badges only for completed, current, and "Coming Soon" weeks
- **Fixed data processing inconsistency**: Updated roadmap weeks processing to handle both new 'days' structure and legacy 'dailyTasks' format, ensuring all weeks display daily objectives correctly
- **Fixed JavaScript errors**: Resolved missing Button import in Roadmap component that was causing console errors

### Authentication UX Consolidation & Layout Fixes (Current Session)
- **Created shared AuthLayout component**: Consolidated duplicate gradient background code from Login page and EmailConfirmation component into reusable `client/src/components/AuthLayout.tsx`
- **Eliminated code duplication**: Removed 150+ lines of duplicate background styling code across authentication screens
- **Fixed white space layout issues**: Updated AuthLayout to use proper flexbox layout (`justify-between`) that eliminates white space gaps between content and footer
- **Streamlined EmailConfirmation component**: Reduced component from 80+ lines to focused 35 lines using shared layout
- **Enhanced maintainability**: Single source of truth for authentication page styling with consistent RampLO logo, gradients, and footer positioning

### Email Template UX & Footer Updates (Previous Session)
- **Implemented cohesive email template card format**: Updated email templates to use always-visible subject and body text areas with real-time auto-save functionality (500ms debounce)
- **Enhanced template editing experience**: Removed click-to-edit workflow - both subject line and email body are now immediately editable without modal interactions
- **Added unified actions bar**: Created comprehensive copy functionality with character/word count display and AI customization indicators
- **Standardized page margins**: Updated AI Deal Coach and Billing pages to use consistent margin formatting (p-6 mx-4 md:mx-8) matching Outreach page
- **Updated footer branding**: Changed all footer text from "© 2025 RampLO. All rights reserved." to "© 2025 RampLO powered by Morty" across TransparentFooter component and Landing page

### Foundation Roadmap Integration & UX Fixes (Previous Session)  
- **Implemented single source of truth for baseline tasks**: Created `server/foundationRoadmap.ts` containing comprehensive 14-week foundation roadmap data
- **Updated AI roadmap service**: Modified `server/roadmapService.ts` to use foundation roadmap data instead of minimal example data
- **Enhanced default task generation**: Updated `server/routes.ts` to pull default tasks from foundation roadmap, removed AI personalization for faster loading
- **Unified data source**: Both AI roadmap generation and fallback defaults now use the same comprehensive foundation data covering 14 weeks of progressive task themes from foundation setup through momentum building
- **UI Enhancements**: Improved user experience with slower loading screen transitions (4s vs 2.5s) and added ticker animations for daily task counts that count from 0 to actual numbers on dashboard load
- **Removed all hardcoded data**: Completely eliminated hardcoded fallback data from Dashboard and Roadmap pages per user request - both now only display real foundation roadmap data or show empty states
- **Fixed critical onboarding UX bug**: Resolved Enter key causing premature form submission during onboarding - form now only submits on final step when "Complete Setup" is explicitly clicked