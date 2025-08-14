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
  const magicLink = await storage.getMagicLink(token);
  
  if (!magicLink) {
    return null;
  }

  // Mark as used
  await storage.markMagicLinkUsed(token);

  // Check if user exists
  const existingUser = await storage.getUserByEmail(magicLink.email);
  const isNewUser = !existingUser;

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
    
    // Create initial progress record with smart start day
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Convert to business day (1-5, Mon-Fri)
    let currentBusinessDay;
    if (dayOfWeek === 0) currentBusinessDay = 1; // Sunday -> Monday
    else if (dayOfWeek === 6) currentBusinessDay = 1; // Saturday -> Monday  
    else currentBusinessDay = dayOfWeek; // Mon-Fri: 1-5

    await storage.createUserProgress({
      userId: user.id,
      startDate: now,
      currentDay: currentBusinessDay,
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
