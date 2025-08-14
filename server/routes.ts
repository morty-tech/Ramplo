import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { sendMagicLink, verifyMagicLink, createOrGetUser, requireAuth, isMortyEmail } from "./auth";
import { insertUserProfileSchema, insertDealCoachSessionSchema } from "@shared/schema";

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

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not found, Stripe functionality will be disabled');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    store: new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: 7 * 24 * 60 * 60 * 1000, // 1 week
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
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Token is required" });
      }

      const result = await verifyMagicLink(token);
      
      if (!result) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const { user, isNew } = await createOrGetUser(result.email);
      
      req.session.user = user;
      
      // Redirect based on user state
      if (isNew) {
        res.redirect('/onboarding');
      } else {
        res.redirect('/');
      }
    } catch (error) {
      console.error("Error verifying magic link:", error);
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

      res.json({
        user,
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

  // Onboarding
  app.post("/api/onboarding", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.session.user.id;
      const profileData = insertUserProfileSchema.parse({
        ...req.body,
        userId,
        onboardingCompleted: true,
      });

      await storage.createUserProfile(profileData);
      
      // Generate initial tasks based on profile
      await generateInitialTasks(userId, profileData);

      res.json({ message: "Onboarding completed" });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Tasks
  app.get("/api/tasks", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.session.user.id;
      const { week, day } = req.query;
      
      const tasks = await storage.getUserTasks(
        userId,
        week ? parseInt(week as string) : undefined,
        day ? parseInt(day as string) : undefined
      );
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.patch("/api/tasks/:id/complete", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.user.id;
      
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

  // Templates
  app.get("/api/templates", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const templates = await storage.getMarketingTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Deal Coach
  app.post("/api/deal-coach", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.session.user.id;
      const sessionData = insertDealCoachSessionSchema.parse({
        ...req.body,
        userId,
      });

      // Generate AI response (mock for now)
      const aiResponse = generateDealCoachResponse(sessionData);
      sessionData.aiResponse = aiResponse;

      const session = await storage.createDealCoachSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating deal coach session:", error);
      res.status(500).json({ message: "Failed to get deal advice" });
    }
  });

  app.get("/api/deal-coach/sessions", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.session.user.id;
      const sessions = await storage.getUserDealCoachSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching deal coach sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // Stripe billing
  if (stripe) {
    app.post("/api/create-subscription", requireAuth, async (req: AuthenticatedRequest, res) => {
      try {
        const userId = req.session.user.id;
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        if (user.isMortyUser) {
          return res.status(400).json({ message: "Morty users don't need subscriptions" });
        }

        if (user.stripeSubscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string, {
            expand: ['payment_intent']
          });
          
          return res.json({
            subscriptionId: subscription.id,
            clientSecret: (invoice.payment_intent as any)?.client_secret,
          });
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
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{
            price: process.env.STRIPE_PRICE_ID || 'price_1234567890', // Set in environment
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
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
  }

  // Progress updates
  app.patch("/api/progress", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const updates = req.body;
      
      const progress = await storage.updateUserProgress(userId, updates);
      res.json(progress);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
async function generateInitialTasks(userId: string, profile: any) {
  // Generate personalized tasks based on profile data
  const baseTasks = [
    {
      title: "Complete CRM setup",
      description: "Set up your customer relationship management system",
      category: "organization",
      estimatedMinutes: 60,
      week: 1,
      day: 1,
    },
    {
      title: "Send 5 realtor introduction emails",
      description: "Use the realtor intro template to connect with new real estate agents in your area",
      category: "networking", 
      estimatedMinutes: 30,
      week: 1,
      day: 2,
    },
    // Add more tasks based on profile
  ];

  for (const taskData of baseTasks) {
    await storage.createTask({
      ...taskData,
      userId,
    });
  }
}

function generateDealCoachResponse(sessionData: any): string {
  // Mock AI response - in production, integrate with OpenAI or similar
  const responses = {
    credit: "For credit challenges, consider requesting a rapid rescore and explore alternative loan programs like FHA.",
    income: "For self-employed borrowers, ensure you have 2 years of tax returns and consider bank statement programs.",
    appraisal: "For low appraisals, options include renegotiating price, bringing additional funds, or requesting a second appraisal.",
    default: "Based on your situation, I recommend documenting all borrower information thoroughly and preparing alternative loan scenarios."
  };

  const challenges = sessionData.challenges?.toLowerCase() || '';
  
  if (challenges.includes('credit')) return responses.credit;
  if (challenges.includes('income') || challenges.includes('self-employed')) return responses.income;
  if (challenges.includes('appraisal')) return responses.appraisal;
  
  return responses.default;
}
