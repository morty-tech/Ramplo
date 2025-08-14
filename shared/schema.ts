import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
  uuid,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  isActive: boolean("is_active").default(true),
  isMortyUser: boolean("is_morty_user").default(false),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Magic links table
export const magicLinks = pgTable("magic_links", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User onboarding data
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  experienceLevel: varchar("experience_level"), // beginner, intermediate, experienced
  market: varchar("market"), // first-time-buyers, refinance, luxury, investment, mixed
  networkSize: varchar("network_size"), // small, medium, large, starting
  preferredChannels: jsonb("preferred_channels").$type<string[]>(), // email, phone, social, inperson
  goals: text("goals"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily tasks
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category"), // networking, follow-up, social-media, organization
  estimatedMinutes: integer("estimated_minutes"),
  week: integer("week").notNull(), // 1-13
  day: integer("day").notNull(), // 1-5 (weekdays)
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User progress tracking
export const userProgress = pgTable("user_progress", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  currentWeek: integer("current_week").default(1),
  currentDay: integer("current_day").default(1),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  applicationsSubmitted: integer("applications_submitted").default(0),
  loansClosed: integer("loans_closed").default(0),
  tasksCompleted: integer("tasks_completed").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketing templates
export const marketingTemplates = pgTable("marketing_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // realtor, heloc, fthb, preapproval, referral
  subject: varchar("subject"),
  content: text("content").notNull(),
  isDefault: boolean("is_default").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Deal coach conversations
export const dealCoachSessions = pgTable("deal_coach_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  loanStage: varchar("loan_stage"),
  loanType: varchar("loan_type"),
  borrowerScenario: text("borrower_scenario"),
  challenges: text("challenges"),
  urgencyLevel: varchar("urgency_level"), // low, medium, high
  aiResponse: text("ai_response"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema exports
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDealCoachSessionSchema = createInsertSchema(dealCoachSessions).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type MarketingTemplate = typeof marketingTemplates.$inferSelect;
export type DealCoachSession = typeof dealCoachSessions.$inferSelect;
export type InsertDealCoachSession = z.infer<typeof insertDealCoachSessionSchema>;
export type MagicLink = typeof magicLinks.$inferSelect;
