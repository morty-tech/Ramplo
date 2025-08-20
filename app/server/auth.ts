import { randomBytes } from "crypto";
import { storage } from "./storage";
import { sendMagicLinkEmail } from "./emailService";

const MORTY_DOMAINS = [
  "morty.com",
  "platform.morty.com",
  "getmorty.com"
];

export function isMortyEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return MORTY_DOMAINS.includes(domain);
}

export async function sendMagicLink(email: string): Promise<void> {
  // Generate secure token
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  // Store magic link
  await storage.createMagicLink(email, token, expiresAt);

  // Send email
  await sendMagicLinkEmail(email, token);
}

export async function verifyMagicLink(token: string): Promise<{ email: string; isNewUser: boolean } | null> {
  console.log(`🔍 Verifying magic link token: ${token.substring(0, 20)}...`);
  
  const magicLink = await storage.getMagicLink(token);
  
  if (!magicLink) {
    console.log("❌ Magic link not found in database");
    return null;
  }

  console.log(`✅ Magic link found for email: ${magicLink.email}`);
  
  // Check expiration
  if (magicLink.expiresAt && new Date() > magicLink.expiresAt) {
    console.log("❌ Magic link has expired");
    return null;
  }
  
  // Check if already used
  if (magicLink.used) {
    console.log("❌ Magic link already used");
    return null;
  }

  // Mark as used
  console.log("✅ Marking magic link as used");
  await storage.markMagicLinkUsed(token);

  // Check if user exists
  const existingUser = await storage.getUserByEmail(magicLink.email);
  const isNewUser = !existingUser;
  
  console.log(`👤 User check - exists: ${!!existingUser}, isNewUser: ${isNewUser}`);

  return {
    email: magicLink.email,
    isNewUser
  };
}

export async function createOrGetUser(email: string): Promise<{ user: any; isNew: boolean }> {
  let user = await storage.getUserByEmail(email);
  let isNew = false;

  if (!user) {
    const isMorty = isMortyEmail(email);
    user = await storage.createUser({
      email,
      isMortyUser: isMorty,
    });
    
    // Create initial progress record - all users start at day 1
    const now = new Date();

    await storage.createUserProgress({
      userId: user.id,
      startDate: now,
      currentDay: 1,
    });
    
    isNew = true;
  }

  return { user, isNew };
}

export function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}
