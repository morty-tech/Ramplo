import {
  users,
  userProfiles,
  tasks,
  userProgress,
  marketingTemplates,
  dealCoachSessions,
  magicLinks,
  dailyConnections,
  type User,
  type InsertUser,
  type UserProfile,
  type InsertUserProfile,
  type Task,
  type InsertTask,
  type UserProgress,
  type InsertUserProgress,
  type MarketingTemplate,
  type DealCoachSession,
  type InsertDealCoachSession,
  type MagicLink,
  type DailyConnections,
  type InsertDailyConnections,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Magic link operations
  createMagicLink(email: string, token: string, expiresAt: Date): Promise<void>;
  getMagicLink(token: string): Promise<MagicLink | undefined>;
  markMagicLinkUsed(token: string): Promise<void>;

  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile>;

  // Task operations
  getUserTasks(userId: string, week?: number, day?: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  markTaskComplete(id: string): Promise<Task>;

  // Progress operations
  getUserProgress(userId: string): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(userId: string, updates: Partial<UserProgress>): Promise<UserProgress>;

  // Template operations
  getMarketingTemplates(): Promise<MarketingTemplate[]>;
  getMarketingTemplate(id: string): Promise<MarketingTemplate | undefined>;

  // Deal coach operations
  createDealCoachSession(session: InsertDealCoachSession): Promise<DealCoachSession>;
  getUserDealCoachSessions(userId: string): Promise<DealCoachSession[]>;

  // Daily connections operations
  createDailyConnections(connections: InsertDailyConnections): Promise<DailyConnections>;
  getTodayConnections(userId: string): Promise<DailyConnections | undefined>;
  updateDailyConnections(userId: string, date: Date, updates: Partial<DailyConnections>): Promise<DailyConnections>;

  // Daily loan actions operations (stub methods for now)
  getTodayLoanActions(userId: string): Promise<any>;
  createDailyLoanActions(actions: any): Promise<any>;
  updateDailyLoanActions(userId: string, date: Date, updates: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createMagicLink(email: string, token: string, expiresAt: Date): Promise<void> {
    await db.insert(magicLinks).values({
      email,
      token,
      expiresAt,
    });
  }

  async getMagicLink(token: string): Promise<MagicLink | undefined> {
    const [link] = await db
      .select()
      .from(magicLinks)
      .where(and(eq(magicLinks.token, token), eq(magicLinks.used, false), gte(magicLinks.expiresAt, new Date())));
    return link;
  }

  async markMagicLinkUsed(token: string): Promise<void> {
    await db.update(magicLinks).set({ used: true }).where(eq(magicLinks.token, token));
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(profileData: InsertUserProfile): Promise<UserProfile> {
    const [profile] = await db.insert(userProfiles).values([profileData]).returning();
    return profile;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const [profile] = await db
      .update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile;
  }

  async getUserTasks(userId: string, week?: number, day?: number): Promise<Task[]> {
    let whereConditions = [eq(tasks.userId, userId)];
    
    if (week !== undefined) {
      whereConditions.push(eq(tasks.week, week));
    }
    
    if (day !== undefined) {
      whereConditions.push(eq(tasks.day, day));
    }
    
    return await db.select().from(tasks).where(and(...whereConditions));
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values([taskData]).returning();
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const [task] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return task;
  }

  async markTaskComplete(id: string): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ completed: true, completedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async getUserProgress(userId: string): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    return progress;
  }

  async createUserProgress(progressData: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db.insert(userProgress).values(progressData).returning();
    return progress;
  }

  async updateUserProgress(userId: string, updates: Partial<UserProgress>): Promise<UserProgress> {
    const [progress] = await db
      .update(userProgress)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProgress.userId, userId))
      .returning();
    return progress;
  }

  async getMarketingTemplates(): Promise<MarketingTemplate[]> {
    return await db.select().from(marketingTemplates).where(eq(marketingTemplates.isDefault, true));
  }

  async getMarketingTemplate(id: string): Promise<MarketingTemplate | undefined> {
    const [template] = await db.select().from(marketingTemplates).where(eq(marketingTemplates.id, id));
    return template;
  }

  async createDealCoachSession(sessionData: InsertDealCoachSession): Promise<DealCoachSession> {
    const [session] = await db.insert(dealCoachSessions).values(sessionData).returning();
    return session;
  }

  async getUserDealCoachSessions(userId: string): Promise<DealCoachSession[]> {
    return await db
      .select()
      .from(dealCoachSessions)
      .where(eq(dealCoachSessions.userId, userId))
      .orderBy(desc(dealCoachSessions.createdAt));
  }

  async createDailyConnections(connectionsData: InsertDailyConnections): Promise<DailyConnections> {
    const [connections] = await db.insert(dailyConnections).values(connectionsData).returning();
    return connections;
  }

  async getTodayConnections(userId: string): Promise<DailyConnections | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [connections] = await db
      .select()
      .from(dailyConnections)
      .where(
        and(
          eq(dailyConnections.userId, userId),
          gte(dailyConnections.date, today)
        )
      )
      .orderBy(desc(dailyConnections.createdAt))
      .limit(1);
    
    return connections;
  }

  async updateDailyConnections(userId: string, date: Date, updates: Partial<DailyConnections>): Promise<DailyConnections> {
    const existing = await this.getTodayConnections(userId);
    
    if (existing) {
      const [connections] = await db
        .update(dailyConnections)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(dailyConnections.id, existing.id))
        .returning();
      return connections;
    } else {
      return await this.createDailyConnections({
        userId,
        date,
        ...updates,
      } as InsertDailyConnections);
    }
  }

  // Daily loan actions operations (stub methods for now - table doesn't exist yet)
  async getTodayLoanActions(userId: string): Promise<any> {
    // Return default values since table doesn't exist
    return { preapprovals: 0, applications: 0, closings: 0 };
  }

  async createDailyLoanActions(actions: any): Promise<any> {
    // Return default values since table doesn't exist
    return { preapprovals: 0, applications: 0, closings: 0 };
  }

  async updateDailyLoanActions(userId: string, date: Date, updates: any): Promise<any> {
    // Return default values since table doesn't exist
    return { preapprovals: 0, applications: 0, closings: 0 };
  }
}

export const storage = new DatabaseStorage();
