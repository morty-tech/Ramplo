import OpenAI from "openai";
import type { UserProfile } from "@shared/schema";
import { FOUNDATION_ROADMAP } from "./foundationRoadmap";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Base roadmap data structure
export interface RoadmapSprint {
  id: string;
  name: string;
  focus: string; // 'purchase', 'refi', 'heloc', 'investor-dscr', 'non-qm'
  experienceLevel: string; // 'new', '<1y', '1-3y', '3+'
  timeCommitment: string; // '30', '60', '90+' minutes
  description: string;
  weeklyTasks: {
    week: number;
    theme: string;
    dailyTasks: Array<{
      day: number;
      title: string;
      description: string;
      category: string;
      estimatedMinutes: number;
      detailedDescription?: string;
      externalLinks?: Array<{title: string, url: string}>;
      internalLinks?: Array<{title: string, route: string}>;
    }>;
  }[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: string; // 'prospecting', 'follow-up', 'nurture', 'referral'
  focus: string[]; // Which loan types this works for
  borrowerTypes: string[]; // Which borrower types this targets
  subject: string;
  content: string;
  tone: string; // 'professional', 'friendly', 'direct'
  description: string;
}

// Comprehensive foundation roadmap data - single source of truth
export const ROADMAP_SPRINTS: RoadmapSprint[] = [
  FOUNDATION_ROADMAP as RoadmapSprint
  // Additional roadmap sprints can be added here for different user profiles
  // e.g., HELOC specialists, refinance experts, investor specialists, etc.
];

// This would be populated with your actual email templates
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  // Example structure - you would replace with your actual data
  {
    id: "heloc-homeowner-intro",
    name: "HELOC Introduction for Homeowners",
    category: "prospecting",
    focus: ["heloc"],
    borrowerTypes: ["move-up", "cash-out"],
    subject: "Unlock Your Home's Hidden Value with a HELOC",
    content: `Hi [FIRST_NAME],

With home values at historic highs, your property might be sitting on untapped equity that could fund your next big project or investment.

A Home Equity Line of Credit (HELOC) gives you flexible access to funds when you need them, with competitive rates and tax advantages.

Would you like to explore how much equity you could access? I'd be happy to run a quick analysis for your property.

Best regards,
[YOUR_NAME]
[YOUR_CONTACT]`,
    tone: "friendly",
    description: "Introduces HELOC benefits to homeowners with established equity"
  }
  // More email templates would be added here
];

export async function selectOptimalRoadmap(userProfile: UserProfile): Promise<{
  selectedRoadmap: RoadmapSprint;
  reasoning: string;
  alternativeOptions: RoadmapSprint[];
}> {
  try {
    // Build context about the user
    const profileContext = buildUserProfileContext(userProfile);
    
    // Create roadmap options summary for AI analysis
    const roadmapOptions = ROADMAP_SPRINTS.map(roadmap => ({
      id: roadmap.id,
      name: roadmap.name,
      focus: roadmap.focus,
      experienceLevel: roadmap.experienceLevel,
      timeCommitment: roadmap.timeCommitment,
      description: roadmap.description
    }));

    const prompt = `You are an expert mortgage industry consultant. Analyze this loan officer's profile and select the most appropriate 90-day roadmap.

User Profile:
${profileContext}

Available Roadmaps:
${JSON.stringify(roadmapOptions, null, 2)}

Select the best roadmap match and provide your reasoning. Respond in JSON format:
{
  "selectedRoadmapId": "roadmap-id",
  "reasoning": "Detailed explanation of why this roadmap fits best",
  "alternativeIds": ["alt1", "alt2"],
  "confidenceScore": 0.85
}

Consider:
- Experience level alignment
- Focus area match (primary and secondary)
- Time availability realistic expectations
- Market opportunity in their area
- Borrower type alignment`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 500
    });

    const analysis = JSON.parse(response.choices[0].message.content!);
    
    const selectedRoadmap = ROADMAP_SPRINTS.find(r => r.id === analysis.selectedRoadmapId);
    if (!selectedRoadmap) {
      throw new Error("Selected roadmap not found");
    }

    const alternativeOptions = ROADMAP_SPRINTS.filter(r => 
      analysis.alternativeIds?.includes(r.id)
    );

    return {
      selectedRoadmap,
      reasoning: analysis.reasoning,
      alternativeOptions
    };

  } catch (error) {
    console.error("Roadmap selection error:", error);
    
    // Fallback: Use rule-based selection
    return fallbackRoadmapSelection(userProfile);
  }
}

export async function selectRelevantEmailTemplates(
  userProfile: UserProfile,
  limit: number = 5
): Promise<{
  selectedTemplates: EmailTemplate[];
  reasoning: string;
}> {
  try {
    const profileContext = buildUserProfileContext(userProfile);
    
    const templateOptions = EMAIL_TEMPLATES.map(template => ({
      id: template.id,
      name: template.name,
      category: template.category,
      focus: template.focus,
      borrowerTypes: template.borrowerTypes,
      tone: template.tone,
      description: template.description
    }));

    const prompt = `You are an expert mortgage marketing consultant. Select the most relevant email templates for this loan officer's profile and goals.

User Profile:
${profileContext}

Available Email Templates:
${JSON.stringify(templateOptions, null, 2)}

Select up to ${limit} most relevant templates. Respond in JSON format:
{
  "selectedTemplateIds": ["template1", "template2"],
  "reasoning": "Why these templates match their profile and goals"
}

Consider:
- Focus area alignment (primary and secondary interests)
- Borrower type targeting
- Communication tone preference
- Experience level appropriateness
- Market opportunity`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 400
    });

    const analysis = JSON.parse(response.choices[0].message.content!);
    
    const selectedTemplates = EMAIL_TEMPLATES.filter(template => 
      analysis.selectedTemplateIds?.includes(template.id)
    );

    return {
      selectedTemplates,
      reasoning: analysis.reasoning
    };

  } catch (error) {
    console.error("Template selection error:", error);
    
    // Fallback: Use rule-based selection
    return fallbackTemplateSelection(userProfile, limit);
  }
}

function buildUserProfileContext(profile: UserProfile): string {
  const context = [];
  
  if (profile.firstName) {
    context.push(`Name: ${profile.firstName}`);
  }
  
  if (profile.experienceLevel) {
    context.push(`Experience: ${profile.experienceLevel}`);
  }
  
  if (profile.focus && profile.focus.length > 0) {
    context.push(`Primary Focus: ${profile.focus[0]}`);
    if (profile.focus.length > 1) {
      context.push(`Secondary Focus: ${profile.focus.slice(1).join(", ")}`);
    }
  }
  
  if (profile.borrowerTypes && profile.borrowerTypes.length > 0) {
    context.push(`Target Borrowers: ${profile.borrowerTypes.join(", ")}`);
  }
  
  if (profile.timeAvailableWeekday) {
    context.push(`Daily Time Available: ${profile.timeAvailableWeekday} minutes`);
  }
  
  if (profile.outreachComfort) {
    context.push(`Outreach Comfort: ${profile.outreachComfort}`);
  }
  
  if (profile.tonePreference) {
    context.push(`Communication Style: ${profile.tonePreference}`);
  }
  
  if (profile.markets && profile.markets.length > 0) {
    context.push(`Markets: ${profile.markets.join(", ")}`);
  }
  
  if (profile.goals) {
    context.push(`90-Day Goals: ${profile.goals}`);
  }
  
  return context.join("\n");
}

function fallbackRoadmapSelection(userProfile: UserProfile): {
  selectedRoadmap: RoadmapSprint;
  reasoning: string;
  alternativeOptions: RoadmapSprint[];
} {
  // Simple rule-based fallback
  const primaryFocus = userProfile.focus?.[0] || "purchase";
  const experience = userProfile.experienceLevel || "new";
  const timeAvailable = userProfile.timeAvailableWeekday || "30";
  
  // Find best match based on focus, experience, and time
  const matchedRoadmap = ROADMAP_SPRINTS.find(roadmap => 
    roadmap.focus === primaryFocus &&
    roadmap.experienceLevel === experience &&
    roadmap.timeCommitment === timeAvailable
  ) || ROADMAP_SPRINTS[0]; // Default to first roadmap

  const alternatives = ROADMAP_SPRINTS
    .filter(r => r.id !== matchedRoadmap.id)
    .slice(0, 2);

  return {
    selectedRoadmap: matchedRoadmap,
    reasoning: `Selected based on focus area (${primaryFocus}), experience level (${experience}), and time availability (${timeAvailable} minutes/day)`,
    alternativeOptions: alternatives
  };
}

function fallbackTemplateSelection(userProfile: UserProfile, limit: number): {
  selectedTemplates: EmailTemplate[];
  reasoning: string;
} {
  // Simple rule-based fallback
  const primaryFocus = userProfile.focus?.[0] || "purchase";
  const borrowerTypes = userProfile.borrowerTypes || [];
  const tone = userProfile.tonePreference || "professional";
  
  const matchedTemplates = EMAIL_TEMPLATES
    .filter(template => 
      template.focus.includes(primaryFocus) ||
      template.borrowerTypes.some(type => borrowerTypes.includes(type)) ||
      template.tone === tone
    )
    .slice(0, limit);

  return {
    selectedTemplates: matchedTemplates,
    reasoning: `Selected templates matching focus area (${primaryFocus}), tone (${tone}), and target borrower types`
  };
}