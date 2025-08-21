import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import session from "express-session";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import { config } from "./config";
import { storage } from "./storage";
import { sendMagicLink, verifyMagicLink, createOrGetUser, requireAuth, isMortyEmail } from "./auth";
import { insertUserProfileSchema, insertDealCoachSessionSchema } from "@shared/schema";
import { FOUNDATION_ROADMAP } from "./foundationRoadmap";
import OpenAI from "openai";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { imageService } from "./imageService";
import multer from "multer";
import { ZipProcessingService } from "./zipProcessingService";

const openai = config.openai.apiKey ? new OpenAI({ apiKey: config.openai.apiKey }) : null;

// Helper function to build user profile context for AI
function buildUserContext(profile: any): string {
  const context = [];
  
  if (profile?.firstName) {
    context.push(`Name: ${profile.firstName}`);
  }
  
  if (profile?.experienceLevel) {
    context.push(`Experience: ${profile.experienceLevel}`);
  }
  
  if (profile?.focus && profile.focus.length > 0) {
    context.push(`Primary Focus: ${profile.focus[0]}`);
    if (profile.focus.length > 1) {
      context.push(`Secondary Focus: ${profile.focus.slice(1).join(", ")}`);
    }
  }
  
  if (profile?.borrowerTypes && profile.borrowerTypes.length > 0) {
    context.push(`Target Borrowers: ${profile.borrowerTypes.join(", ")}`);
  }
  
  if (profile?.timeAvailableWeekday) {
    context.push(`Daily Time Available: ${profile.timeAvailableWeekday} minutes`);
  }
  
  if (profile?.outreachComfort) {
    context.push(`Outreach Comfort: ${profile.outreachComfort}`);
  }
  
  if (profile?.tonePreference) {
    context.push(`Communication Style: ${profile.tonePreference}`);
  }
  
  if (profile?.markets && profile.markets.length > 0) {
    context.push(`Markets: ${profile.markets.join(", ")}`);
  }
  
  if (profile?.goals) {
    context.push(`90-Day Goals: ${profile.goals}`);
  }
  
  return context.join("\n");
}

// Extend session data
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      isMortyUser: boolean;
    };
  }
}

interface AuthenticatedRequest extends Request {
  session: session.Session & {
    user: {
      id: string;
      email: string;
      isMortyUser: boolean;
    };
  };
}

const pgStore = connectPg(session);

const stripe = config.stripe.secretKey ? new Stripe(config.stripe.secretKey) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration - using memory store temporarily to fix auth
  const memoryStore = MemoryStore(session);
  app.use(session({
    store: new memoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'development-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  }));

  // Auth routes
  app.post("/api/auth/send-magic-link", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || !email.includes('@')) {
        return res.status(400).json({ message: "Valid email is required" });
      }

      await sendMagicLink(email);
      res.json({ message: "Magic link sent" });
    } catch (error) {
      console.error("Error sending magic link:", error);
      res.status(500).json({ message: "Failed to send magic link" });
    }
  });

  app.get("/api/auth/verify", async (req, res) => {
    try {
      const { token } = req.query;
      
      console.log(`🔍 MAGIC LINK VERIFICATION - Token: ${token?.toString().substring(0, 20)}...`);
      console.log(`Environment: ${process.env.NODE_ENV}, Production: ${process.env.NODE_ENV === 'production'}`);

      
      if (!token || typeof token !== 'string') {
        console.log("❌ No token provided");
        return res.status(400).json({ message: "Token is required" });
      }

      console.log(`🔍 Verifying token with storage...`);
      const result = await verifyMagicLink(token);
      
      if (!result) {
        console.log("❌ Token verification failed - invalid or expired");
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      console.log(`✅ Token verified for email: ${result.email}, isNewUser: ${result.isNewUser}`);
      const { user, isNew } = await createOrGetUser(result.email);
      
      console.log(`👤 User created/retrieved: ${user.id} (${user.email})`);
      req.session.user = user;
      
      // Check if user has completed onboarding by looking for profile
      const profile = await storage.getUserProfile(user.id);
      const hasCompletedOnboarding = profile && profile.onboardingCompleted;
      
      console.log(`📝 Profile check - exists: ${!!profile}, completed: ${hasCompletedOnboarding}`);
      
      // Redirect based on onboarding status
      const redirectUrl = !hasCompletedOnboarding ? '/onboarding' : '/';
      console.log(`🔄 Redirecting to: ${redirectUrl}`);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("❌ Error verifying magic link:", error);
      res.status(500).json({ message: "Failed to verify token" });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const profile = await storage.getUserProfile(user.id);
      const progress = await storage.getUserProgress(user.id);

      // Check subscription status for non-Morty users
      let hasActiveSubscription = false;
      console.log(`[AUTH DEBUG] User ${user.id} (${user.email}) - isMortyUser: ${user.isMortyUser}, stripeSubscriptionId: ${user.stripeSubscriptionId}, stripe: ${!!stripe}`);
      
      // For development, let's temporarily treat all non-Morty users with subscription IDs as having active subscriptions
      if (!user.isMortyUser && user.stripeSubscriptionId) {
        if (process.env.NODE_ENV === 'development') {
          hasActiveSubscription = true;
          console.log(`[AUTH DEBUG] Development mode: treating user ${user.id} with subscription ${user.stripeSubscriptionId} as active`);
        } else if (stripe) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          // In test mode, incomplete subscriptions should be treated as active for development
          // In production, only 'active' status should be accepted
          const isDevelopment = process.env.NODE_ENV === 'development';
          hasActiveSubscription = subscription.status === 'active' || 
                                (isDevelopment && subscription.status === 'incomplete');
          
          console.log(`Subscription ${user.stripeSubscriptionId} status: ${subscription.status}, hasActiveSubscription: ${hasActiveSubscription}`);
        } catch (error) {
          console.error("Error checking subscription status:", error);
          hasActiveSubscription = false;
        }
        }
      }

      console.log(`[AUTH DEBUG] Final hasActiveSubscription: ${hasActiveSubscription} for user ${user.email}`);
      
      res.json({
        user: {
          ...user,
          hasActiveSubscription
        },
        profile,
        progress,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  // Onboarding route - handle enhanced multi-step onboarding
  app.post("/api/onboarding", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.user.id;
      const profileData = insertUserProfileSchema.parse({
        ...req.body,
        userId,
        onboardingCompleted: true,
      });

      const userProfile = await storage.createUserProfile(profileData);
      
      // Generate AI-powered roadmap and tasks based on profile
      console.log("Starting AI roadmap selection for user:", userId);
      await generatePersonalizedRoadmap(userId, userProfile);
      console.log("AI roadmap selection and task generation completed for user:", userId);

      res.json({ message: "Onboarding completed" });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Tasks - now automatically calculates current week/day based on user's start date
  app.get("/api/tasks", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.user.id;
      
      // Allow manual week/day override via query params, otherwise auto-calculate
      let week: number, day: number;
      
      if (req.query.week && req.query.day) {
        week = parseInt(req.query.week as string);
        day = parseInt(req.query.day as string);
        console.log("Fetching tasks for user:", userId, "manual week:", week, "day:", day);
      } else {
        const currentProgress = await getUserCurrentWeekAndDay(userId);
        week = currentProgress.week;
        day = currentProgress.day;
        console.log("Fetching tasks for user:", userId, "calculated week:", week, "day:", day);
      }
      
      const tasks = await storage.getUserTasks(userId, week, day);
      
      console.log("Found tasks:", tasks.length);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.patch("/api/tasks/:id/complete", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).session.user.id;
      
      const task = await storage.markTaskComplete(id);
      
      // Update user progress
      const progress = await storage.getUserProgress(userId);
      if (progress && progress.tasksCompleted !== null) {
        await storage.updateUserProgress(userId, {
          tasksCompleted: progress.tasksCompleted + 1,
          lastActivityDate: new Date(),
        });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  // Templates - enhanced for multiple template types
  app.get("/api/templates", requireAuth, async (req, res) => {
    try {
      const { templateType } = req.query;
      const templates = await storage.getMarketingTemplates(templateType as string);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.put("/api/templates/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const template = await storage.updateMarketingTemplate(id, updates);
      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.post("/api/templates", requireAuth, async (req, res) => {
    try {
      const template = await storage.createMarketingTemplate(req.body);
      res.json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.post("/api/templates/:id/customize", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { recipientType, tone, keyPoints } = req.body;
      const userId = (req as any).session.user.id;
      
      // Get template and user profile
      const template = await storage.getMarketingTemplate(id);
      const userProfile = await storage.getUserProfile(userId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      if (!userProfile) {
        return res.status(400).json({ message: "User profile required for customization" });
      }
      
      // Import AI service dynamically to handle missing API key gracefully
      const { customizeTemplate } = await import("./aiService");
      
      const customizedTemplate = await customizeTemplate({
        template: {
          id: template.id || '',
          name: template.name,
          templateType: template.templateType,
          subject: template.subject || '',
          content: template.content || '',
          platform: template.platform || ''
        },
        userProfile,
        customization: { recipientType, tone, keyPoints }
      });
      
      res.json(customizedTemplate);
    } catch (error: any) {
      console.error("Error customizing template:", error);
      if (error?.message?.includes("API key")) {
        return res.status(500).json({ message: "AI service not configured" });
      }
      if (error?.message?.includes("quota")) {
        return res.status(500).json({ message: "AI service temporarily unavailable - please try again later" });
      }
      res.status(500).json({ message: "Failed to customize template" });
    }
  });

  // Template Zip Processing
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/zip' || file.originalname.toLowerCase().endsWith('.zip')) {
        cb(null, true);
      } else {
        cb(new Error('Only ZIP files are allowed'));
      }
    }
  });

  app.post("/api/templates/extract-zip", requireAuth, upload.single('zipFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No ZIP file uploaded' });
      }

      console.log(`Processing ZIP file: ${req.file.originalname} (${req.file.size} bytes)`);
      
      const result = await ZipProcessingService.processZipFile(req.file.buffer);
      
      console.log(`Extraction complete: ${result.extractedFiles} files extracted, ${result.skippedFiles} files skipped`);
      
      res.json(result);
    } catch (error: any) {
      console.error('ZIP processing error:', error);
      
      if (error.message === 'Only ZIP files are allowed') {
        return res.status(400).json({ error: 'Please upload a valid ZIP file' });
      }
      
      res.status(500).json({ 
        error: 'Failed to process ZIP file',
        details: error.message 
      });
    }
  });

  // Deal Coach
  app.post("/api/deal-coach", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.user.id;
      const sessionData = insertDealCoachSessionSchema.parse({
        ...req.body,
        userId,
      });

      // Get user profile for personalized coaching
      const userProfile = await storage.getUserProfile(userId);
      
      if (!userProfile) {
        return res.status(400).json({ message: "User profile required for deal coaching" });
      }

      // Generate AI response using OpenAI
      const { generateDealCoachAdvice } = await import("./aiService");
      const aiResponse = await generateDealCoachAdvice({
        dealDetails: sessionData.loanStage || '',
        challenge: sessionData.challenges || '',
        userProfile
      });
      
      sessionData.aiResponse = aiResponse;

      const session = await storage.createDealCoachSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating deal coach session:", error);
      res.status(500).json({ message: "Failed to get deal advice" });
    }
  });

  app.get("/api/deal-coach/sessions", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.user.id;
      const sessions = await storage.getUserDealCoachSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching deal coach sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // Test email functionality (development only)
  if (process.env.NODE_ENV === 'development') {
    app.post("/api/test-email", async (req, res) => {
      try {
        const { email, type } = req.body;
        
        if (!email) {
          return res.status(400).json({ message: "Email is required" });
        }

        if (type === 'welcome') {
          const { sendWelcomeEmail } = await import('./emailService');
          await sendWelcomeEmail(email, 'Test User');
          res.json({ message: "Welcome email sent" });
        } else {
          const { sendMagicLinkEmail } = await import('./emailService');
          await sendMagicLinkEmail(email, 'test-token-123');
          res.json({ message: "Magic link email sent" });
        }
      } catch (error) {
        console.error("Test email error:", error);
        res.status(500).json({ message: "Failed to send test email" });
      }
    });

    // Clear Stripe test data (development only)
    app.post("/api/clear-stripe-data", requireAuth, async (req, res) => {
      if (!stripe) {
        return res.status(400).json({ message: "Stripe not configured" });
      }

      try {
        const userId = (req as any).session.user.id;
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        let cleared = [];

        // Cancel any active subscriptions
        if (user.stripeSubscriptionId) {
          try {
            await stripe.subscriptions.cancel(user.stripeSubscriptionId);
            cleared.push("subscription");
          } catch (error) {
            console.log("Error canceling subscription:", error);
          }
        }

        // Remove payment methods if customer exists
        if (user.stripeCustomerId) {
          try {
            const paymentMethods = await stripe.paymentMethods.list({
              customer: user.stripeCustomerId,
              type: 'card',
            });
            
            for (const pm of paymentMethods.data) {
              await stripe.paymentMethods.detach(pm.id);
            }
            if (paymentMethods.data.length > 0) {
              cleared.push(`${paymentMethods.data.length} payment methods`);
            }
          } catch (error) {
            console.log("Error clearing payment methods:", error);
          }
        }

        // Clear user's Stripe IDs
        await storage.updateUser(userId, { 
          stripeCustomerId: null, 
          stripeSubscriptionId: null 
        });
        cleared.push("user stripe data");

        res.json({ 
          message: "Stripe test data cleared", 
          cleared: cleared 
        });
      } catch (error) {
        console.error("Error clearing Stripe data:", error);
        res.status(500).json({ message: "Failed to clear Stripe data" });
      }
    });
  }

  // Stripe billing - NOW SAFE WITH TEST KEYS
  if (stripe) {
    app.post("/api/create-subscription", requireAuth, async (req, res) => {
      try {
        const userId = (req as any).session.user.id;
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        if (user.isMortyUser) {
          return res.status(400).json({ message: "Morty users don't need subscriptions" });
        }

        console.log("DEBUG: User Stripe data:", {
          userId: user.id,
          email: user.email,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId
        });

        if (user.stripeSubscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          console.log("Existing subscription status:", subscription.status);
          
          if (subscription.status === 'active') {
            return res.json({
              subscriptionId: subscription.id,
              clientSecret: null, // Already active, no payment needed
            });
          }
          
          if (subscription.status === 'incomplete') {
            const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string, {
              expand: ['payment_intent']
            });
            
            const paymentIntent = (invoice as any).payment_intent;
            console.log("Payment intent status:", paymentIntent?.status);
            console.log("Client secret exists:", !!paymentIntent?.client_secret);
            
            if (paymentIntent?.client_secret) {
              return res.json({
                subscriptionId: subscription.id,
                clientSecret: paymentIntent.client_secret,
              });
            }
          }
          
          // If we get here, something is wrong with the subscription - create a new one
          console.log("Subscription in unexpected state, creating new one");
          await storage.updateUser(userId, { stripeSubscriptionId: null });
        }

        // Create customer if needed
        let customerId = user.stripeCustomerId;
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          });
          customerId = customer.id;
          await storage.updateUser(userId, { stripeCustomerId: customerId });
          console.log("Created new Stripe customer:", customerId);
        } else {
          // Debug: Check existing customer payment methods
          const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
          });
          console.log("Existing payment methods for customer:", paymentMethods.data.length);
        }

        // Create subscription with 3-month auto-cancellation
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{
            price: config.stripe.priceId,
          }],
          payment_behavior: 'default_incomplete',
          payment_settings: {
            payment_method_types: ['card'],
            save_default_payment_method: 'on_subscription'
          },
          expand: ['latest_invoice.payment_intent'],
          cancel_at: Math.floor((Date.now() + (3 * 30 * 24 * 60 * 60 * 1000)) / 1000), // Cancel after 3 months
          metadata: {
            plan_duration: '3_months',
            created_for: 'ramplo_professional'
          }
        });

        await storage.updateUser(userId, { stripeSubscriptionId: subscription.id });

        res.json({
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        });
      } catch (error) {
        console.error("Error creating subscription:", error);
        res.status(500).json({ message: "Failed to create subscription" });
      }
    });

    // Cancel subscription endpoint
    app.post("/api/cancel-subscription", requireAuth, async (req, res) => {
      try {
        const userId = (req as any).session.user.id;
        const user = await storage.getUser(userId);
        
        if (!user || !user.stripeSubscriptionId) {
          return res.status(404).json({ message: "No active subscription found" });
        }

        // Cancel the subscription in Stripe
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
        
        // Update user record
        await storage.updateUser(userId, { 
          stripeSubscriptionId: null 
        });

        console.log(`Subscription ${user.stripeSubscriptionId} canceled for user ${userId}`);
        res.json({ message: "Subscription canceled successfully" });
      } catch (error) {
        console.error("Error canceling subscription:", error);
        res.status(500).json({ message: "Failed to cancel subscription" });
      }
    });
  }

  // Account deletion endpoint
  app.post("/api/delete-account", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Cancel subscription if exists
      if (stripe && user.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(user.stripeSubscriptionId);
          console.log(`Subscription canceled for user ${userId} during account deletion`);
        } catch (stripeError) {
          console.error("Error canceling subscription during deletion:", stripeError);
        }
      }

      // Delete user account and all related data
      await storage.deleteUser(userId);
      
      // Clear session
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
      });

      console.log(`Account deleted for user ${userId}`);
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Stripe webhook for subscription events
  if (stripe) {
    app.post("/api/stripe/webhook", async (req, res) => {
      try {
        const event = req.body;

        // Handle subscription cancellation
        if (event.type === 'customer.subscription.deleted') {
          const subscription = event.data.object;
          
          // Find user by subscription ID and remove access
          const user = await storage.getUserByStripeSubscriptionId(subscription.id);
          if (user) {
            await storage.updateUser(user.id, { 
              stripeSubscriptionId: null 
            });
            console.log(`Subscription ${subscription.id} canceled for user ${user.id}`);
          }
        }

        res.json({ received: true });
      } catch (error) {
        console.error("Error handling webhook:", error);
        res.status(500).json({ message: "Webhook error" });
      }
    });
  }

  // Progress updates
  app.patch("/api/progress", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const updates = req.body;
      
      const progress = await storage.updateUserProgress(userId, updates);
      res.json(progress);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Daily connections tracking
  app.get("/api/connections/today", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const connections = await storage.getTodayConnections(userId);
      res.json(connections || { phoneCalls: 0, textMessages: 0, emails: 0 });
    } catch (error) {
      console.error("Error fetching today's connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.post("/api/connections", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const { phoneCalls, textMessages, emails } = req.body;
      
      const today = new Date();
      const existing = await storage.getTodayConnections(userId);
      
      if (existing) {
        // Add to existing counts
        const connections = await storage.updateDailyConnections(userId, today, {
          phoneCalls: (existing.phoneCalls || 0) + (phoneCalls || 0),
          textMessages: (existing.textMessages || 0) + (textMessages || 0),
          emails: (existing.emails || 0) + (emails || 0),
        });
        res.json(connections);
      } else {
        // Create new entry for today
        const connections = await storage.createDailyConnections({
          userId,
          date: today,
          phoneCalls: phoneCalls || 0,
          textMessages: textMessages || 0,
          emails: emails || 0,
        });
        res.json(connections);
      }
    } catch (error) {
      console.error("Error saving connections:", error);
      res.status(500).json({ message: "Failed to save connections" });
    }
  });

  // Loan Actions Routes
  app.get("/api/loan-actions/today", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const loanActions = await storage.getTodayLoanActions(userId);
      res.json(loanActions || { preapprovals: 0, applications: 0, closings: 0 });
    } catch (error) {
      console.error("Error fetching today's loan actions:", error);
      res.status(500).json({ message: "Failed to fetch loan actions" });
    }
  });

  app.post("/api/loan-actions", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const { preapprovals, applications, closings } = req.body;
      
      console.log("Loan actions request:", { userId, preapprovals, applications, closings });
      
      const today = new Date();
      const existing = await storage.getTodayLoanActions(userId);
      
      console.log("Existing loan actions:", existing);
      
      if (existing && existing.id) {
        // Add to existing counts
        const updateData = {
          preapprovals: (existing.preapprovals || 0) + (preapprovals || 0),
          applications: (existing.applications || 0) + (applications || 0),
          closings: (existing.closings || 0) + (closings || 0),
        };
        console.log("Updating with:", updateData);
        const loanActions = await storage.updateDailyLoanActions(userId, today, updateData);
        
        // Update user progress if closings were added
        if (closings && closings > 0) {
          const progress = await storage.getUserProgress(userId);
          if (progress) {
            await storage.updateUserProgress(userId, {
              loansClosed: (progress.loansClosed || 0) + closings,
              lastActivityDate: new Date(),
            });
          }
        }
        
        res.json(loanActions);
      } else {
        // Create new entry for today
        const createData = {
          userId,
          date: today,
          preapprovals: preapprovals || 0,
          applications: applications || 0,
          closings: closings || 0,
        };
        console.log("Creating with:", createData);
        const loanActions = await storage.createDailyLoanActions(createData);
        
        // Update user progress if closings were added
        if (createData.closings && createData.closings > 0) {
          const progress = await storage.getUserProgress(userId);
          if (progress) {
            await storage.updateUserProgress(userId, {
              loansClosed: (progress.loansClosed || 0) + createData.closings,
              lastActivityDate: new Date(),
            });
          }
        }
        
        res.json(loanActions);
      }
    } catch (error) {
      console.error("Error saving loan actions:", error);
      res.status(500).json({ message: "Failed to save loan actions" });
    }
  });

  // AI-powered roadmap selection
  app.post("/api/roadmap/select", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const userProfile = await storage.getUserProfile(userId);
      
      if (!userProfile) {
        return res.status(400).json({ message: "User profile required for roadmap selection" });
      }
      
      // Import roadmap service dynamically
      const { selectOptimalRoadmap } = await import("./roadmapService");
      
      const roadmapSelection = await selectOptimalRoadmap(userProfile);
      
      res.json(roadmapSelection);
    } catch (error: any) {
      console.error("Error selecting roadmap:", error);
      if (error?.message?.includes("API key")) {
        return res.status(500).json({ message: "AI service not configured" });
      }
      res.status(500).json({ message: "Failed to select optimal roadmap" });
    }
  });

  // Temporary endpoint to regenerate roadmap
  app.post("/api/regenerate-roadmap", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const userProfile = await storage.getUserProfile(userId);
      
      if (!userProfile) {
        return res.status(400).json({ message: "User profile not found" });
      }
      
      // Generate personalized roadmap
      await generatePersonalizedRoadmap(userId, userProfile);
      
      res.json({ message: "Roadmap regenerated successfully" });
    } catch (error) {
      console.error("Error regenerating roadmap:", error);
      res.status(500).json({ message: "Failed to regenerate roadmap" });
    }
  });

  // AI-powered email template selection
  app.post("/api/templates/select", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const { limit = 5 } = req.body;
      const userProfile = await storage.getUserProfile(userId);
      
      if (!userProfile) {
        return res.status(400).json({ message: "User profile required for template selection" });
      }
      
      // Import roadmap service dynamically
      const { selectRelevantEmailTemplates } = await import("./roadmapService");
      
      const templateSelection = await selectRelevantEmailTemplates(userProfile, limit);
      
      res.json(templateSelection);
    } catch (error: any) {
      console.error("Error selecting email templates:", error);
      if (error?.message?.includes("API key")) {
        return res.status(500).json({ message: "AI service not configured" });
      }
      res.status(500).json({ message: "Failed to select relevant templates" });
    }
  });

  // Template Images
  app.get("/api/template-images", requireAuth, async (req, res) => {
    try {
      const { category } = req.query;
      const images = await storage.getTemplateImages(category as string);
      res.json(images);
    } catch (error) {
      console.error("Error fetching template images:", error);
      res.status(500).json({ message: "Failed to fetch template images" });
    }
  });

  // Dynamic Image Search (with fallback to database)
  app.get("/api/images/search", requireAuth, async (req, res) => {
    try {
      const { query, count = "6" } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Query parameter is required" });
      }
      
      const images = await imageService.searchImages(query, parseInt(count as string));
      res.json({
        images,
        source: images[0]?.source || 'database',
        dynamicEnabled: imageService.isDynamicEnabled()
      });
    } catch (error) {
      console.error("Error searching for images:", error);
      res.status(500).json({ message: "Failed to search for images" });
    }
  });

  // Get random images for a category
  app.get("/api/images/random/:category", requireAuth, async (req, res) => {
    try {
      const { category } = req.params;
      const { count = "6" } = req.query;
      
      const images = await imageService.getRandomImages(category, parseInt(count as string));
      res.json({
        images,
        source: images[0]?.source || 'database',
        dynamicEnabled: imageService.isDynamicEnabled()
      });
    } catch (error) {
      console.error("Error fetching random images:", error);
      res.status(500).json({ message: "Failed to fetch random images" });
    }
  });

  // Object Storage Routes
  app.get("/public-objects/:filePath+", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/objects/:objectPath+", requireAuth, async (req, res) => {
    const userId = (req as any).session.user.id;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  app.put("/api/template-images", requireAuth, async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    const userId = (req as any).session.user.id;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId,
          visibility: "public",
        },
      );

      const templateImage = await storage.createTemplateImage({
        name: req.body.name || "User Upload",
        imageUrl: objectPath,
        imageAlt: req.body.imageAlt || "",
        category: req.body.category || "general",
        tags: req.body.tags || [],
        isDefault: false,
      });

      res.status(200).json({
        templateImage,
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting template image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
async function generatePersonalizedRoadmap(userId: string, profile: any) {
  try {
    // Import and use AI roadmap selection service
    const { selectOptimalRoadmap } = await import("./roadmapService");
    
    // Get AI-selected roadmap based on user profile
    const roadmapSelection = await selectOptimalRoadmap(profile);
    
    if (!roadmapSelection?.selectedRoadmap) {
      console.log("No roadmap selected by AI, falling back to default tasks");
      await generateDefaultTasks(userId, profile);
      return;
    }
    
    console.log(`AI selected roadmap: ${roadmapSelection.selectedRoadmap.name}`);
    
    // Generate tasks from the AI-selected roadmap
    await generateTasksFromRoadmap(userId, roadmapSelection.selectedRoadmap);
    
  } catch (error) {
    console.error("Error in AI roadmap generation:", error);
    // Fallback to default tasks if AI fails
    await generateDefaultTasks(userId, profile);
  }
}

async function generateTasksFromRoadmap(userId: string, roadmap: any) {
  // Get user profile for personalization
  const userProfile = await storage.getUserProfile(userId);
  
  // Extract tasks from the foundation roadmap and personalize them
  const baseTasks = [];
  
  for (const weekData of roadmap.weeklyTasks || []) {
    // Check if we have the new 'days' structure with objectives
    if (weekData.days && weekData.days.length > 0) {
      // Use new structure with daily objectives
      for (const dayData of weekData.days) {
        for (const task of dayData.tasks || []) {
          baseTasks.push({
            title: task.title,
            description: task.description,
            category: task.category,
            estimatedMinutes: task.estimatedMinutes,
            week: weekData.week,
            day: dayData.day,
            theme: weekData.theme,
            objective: dayData.objective,
            extraTimeActivity: dayData.extraTimeActivity,
            detailedDescription: null,
            externalLinks: [],
            internalLinks: []
          });
        }
      }
    } else {
      // Fallback to old structure
      for (const dailyTask of weekData.dailyTasks || []) {
        baseTasks.push({
          title: dailyTask.title,
          description: dailyTask.description,
          category: dailyTask.category,
          estimatedMinutes: dailyTask.estimatedMinutes,
          week: weekData.week,
          day: dailyTask.day,
          theme: weekData.theme,
          detailedDescription: dailyTask.detailedDescription || null,
          externalLinks: dailyTask.externalLinks || [],
          internalLinks: dailyTask.internalLinks || []
        });
      }
    }
  }
  
  console.log(`Creating ${baseTasks.length} foundation tasks (skipping AI personalization for faster loading)`);
  
  // Skip AI personalization for faster initial loading - use base tasks directly
  // TODO: Consider adding background personalization later
  const tasksToCreate = baseTasks.map(task => ({
    userId,
    title: task.title,
    description: task.description,
    detailedDescription: task.detailedDescription || null,
    externalLinks: task.externalLinks || null,
    internalLinks: task.internalLinks || null,
    category: task.category,
    estimatedMinutes: task.estimatedMinutes,
    week: task.week,
    day: task.day,
    completed: false,
  }));
  
  for (const taskData of tasksToCreate) {
    await storage.createTask(taskData);
  }
  
  console.log(`Created ${tasksToCreate.length} personalized tasks from foundation roadmap`);
}

// Helper function to calculate business days between two dates
function getBusinessDaysBetween(startDate: Date, endDate: Date): number {
  let businessDays = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday = 1, Friday = 5
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
}

// Helper function to calculate current week and day based on elapsed business days
function calculateCurrentWeekAndDay(businessDaysElapsed: number): { week: number; day: number } {
  if (businessDaysElapsed <= 0) {
    return { week: 1, day: 1 };
  }
  
  const week = Math.ceil(businessDaysElapsed / 5);
  const day = ((businessDaysElapsed - 1) % 5) + 1;
  
  return { week: Math.min(week, 14), day: Math.min(day, 5) }; // Cap at week 14, day 5
}

// Helper function to get user's current week and day based on their start date
async function getUserCurrentWeekAndDay(userId: string): Promise<{ week: number; day: number }> {
  const progress = await storage.getUserProgress(userId);
  
  if (!progress || !progress.startDate) {
    // No start date set, default to week 1 day 1
    return { week: 1, day: 1 };
  }
  
  const now = new Date();
  const businessDaysElapsed = getBusinessDaysBetween(progress.startDate, now);
  const { week, day } = calculateCurrentWeekAndDay(businessDaysElapsed);
  
  // Update user progress if it's changed
  if (progress.currentWeek !== week || progress.currentDay !== day) {
    await storage.updateUserProgress(userId, {
      currentWeek: week,
      currentDay: day,
    });
    console.log(`Auto-updated user ${userId} progress to week ${week}, day ${day}`);
  }
  
  return { week, day };
}

async function generateDefaultTasks(userId: string, profile: any) {
  // Get user's start date from progress table
  const progress = await storage.getUserProgress(userId);
  let startDate = progress?.startDate;
  
  // If no start date exists, set it to today (first time setup)
  if (!startDate) {
    startDate = new Date();
    await storage.updateUserProgress(userId, {
      startDate: startDate,
      currentWeek: 1,
      currentDay: 1
    });
  }
  
  // Calculate current week and day based on business days elapsed
  const now = new Date();
  const businessDaysElapsed = getBusinessDaysBetween(startDate, now);
  const { week: currentWeek, day: currentDay } = calculateCurrentWeekAndDay(businessDaysElapsed);
  
  console.log(`User started on: ${startDate.toDateString()}, Business days elapsed: ${businessDaysElapsed}, Current week: ${currentWeek}, Current day: ${currentDay}`);

  // Use first 13 weeks from foundation roadmap as default tasks
  const foundationWeeks = FOUNDATION_ROADMAP.weeklyTasks.slice(0, 13);
  const allFoundationTasks = [];
  
  for (const weekData of foundationWeeks) {
    for (const dailyTask of weekData.dailyTasks) {
      allFoundationTasks.push({
        title: dailyTask.title,
        description: dailyTask.description,
        category: dailyTask.category,
        estimatedMinutes: dailyTask.estimatedMinutes,
        week: weekData.week,
        day: dailyTask.day,
      });
    }
  }

  // Use foundation tasks directly without hardcoded essential task logic
  const tasksToCreate = allFoundationTasks;

  // Create adjusted tasks
  console.log(`Creating ${tasksToCreate.length} default tasks from foundation roadmap for user ${userId}`);
  for (const taskData of tasksToCreate) {
    await storage.createTask({
      userId,
      title: taskData.title,
      description: taskData.description,
      detailedDescription: null,
      externalLinks: null,
      internalLinks: null,
      category: taskData.category,
      estimatedMinutes: taskData.estimatedMinutes,
      week: taskData.week,
      day: taskData.day,
      completed: false,
    });
  }
  console.log(`Successfully created ${tasksToCreate.length} default tasks from foundation roadmap`);

  // Update user progress to match calculated current week and day
  const userProgress = await storage.getUserProgress(userId);
  if (userProgress && (userProgress.currentWeek !== currentWeek || userProgress.currentDay !== currentDay)) {
    await storage.updateUserProgress(userId, {
      currentWeek: currentWeek,
      currentDay: currentDay,
    });
    console.log(`Updated user progress to week ${currentWeek}, day ${currentDay}`);
  }
}

// AI personalization function for foundation tasks
async function personalizeFoundationTasks(baseTasks: any[], userProfile: any): Promise<any[]> {
  if (!openai) {
    console.log('OpenAI not configured, returning base tasks without personalization');
    return baseTasks;
  }

  try {
    // Build user context for personalization
    const profileContext = buildUserContext(userProfile);
    
    // Group tasks by week for efficient processing
    const tasksByWeek = baseTasks.reduce((acc: Record<string, any[]>, task) => {
      if (!acc[task.week]) acc[task.week] = [];
      acc[task.week].push(task);
      return acc;
    }, {});
    
    const personalizedTasks: any[] = [];
    
    // Process each week's tasks
    for (const [week, weekTasks] of Object.entries(tasksByWeek)) {
      const weekTasksArray = weekTasks as any[];
      const taskSummary = weekTasksArray.map((task: any) => ({
        title: task.title,
        description: task.description,
        category: task.category
      }));
      
      const prompt = `You are an expert mortgage industry consultant. Personalize these foundation tasks for a loan officer based on their profile.

User Profile:
${profileContext}

Week ${week} Tasks to Personalize:
${JSON.stringify(taskSummary, null, 2)}

Personalize each task by:
1. Adapting descriptions to their focus areas (${userProfile?.focus?.join(', ') || 'general'})
2. Adjusting language for their experience level (${userProfile?.experienceLevel || 'new'})
3. Adding relevant context for their target borrowers (${userProfile?.borrowerTypes?.join(', ') || 'general'})
4. Keeping original structure and categories

Respond in JSON format:
{
  "personalizedTasks": [
    {
      "title": "personalized title",
      "description": "personalized description with specific focus",
      "category": "original category",
      "detailedDescription": "optional detailed guidance specific to their profile"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });

      const result = JSON.parse(response.choices[0].message.content!);
      
      // Merge personalized content with original task structure
      weekTasksArray.forEach((originalTask: any, index: number) => {
        const personalizedTask = result.personalizedTasks[index];
        if (personalizedTask) {
          personalizedTasks.push({
            ...originalTask,
            title: personalizedTask.title || originalTask.title,
            description: personalizedTask.description || originalTask.description,
            detailedDescription: personalizedTask.detailedDescription || null
          });
        } else {
          personalizedTasks.push(originalTask);
        }
      });
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Successfully personalized ${personalizedTasks.length} tasks`);
    return personalizedTasks;
    
  } catch (error) {
    console.error('Error personalizing tasks:', error);
    console.log('Falling back to base tasks');
    return baseTasks;
  }
}



