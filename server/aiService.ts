import OpenAI from "openai";
import type { UserProfile, DealCoachSession } from "@shared/schema";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface CustomizationRequest {
  template: {
    name: string;
    subject: string;
    content: string;
  };
  userProfile: UserProfile;
  customization: {
    recipientType: string;
    tone: string;
    keyPoints: string;
  };
}

export async function customizeTemplate(request: CustomizationRequest): Promise<{
  subject: string;
  content: string;
}> {
  const { template, userProfile, customization } = request;
  
  // Build personalization context from user profile
  const profileContext = buildProfileContext(userProfile);
  
  const prompt = `You are an AI assistant helping a mortgage loan officer customize an email template.

LOAN OFFICER PROFILE:
${profileContext}

ORIGINAL TEMPLATE:
Subject: ${template.subject}
Content: ${template.content}

CUSTOMIZATION REQUIREMENTS:
- Recipient Type: ${customization.recipientType}
- Tone: ${customization.tone}
- Key Points to Include: ${customization.keyPoints}

INSTRUCTIONS:
1. Personalize the template using the loan officer's specific details and experience
2. Adjust the tone to match the requested style (${customization.tone})
3. Incorporate the key points naturally into the message
4. Keep the core structure and purpose of the original template
5. Replace placeholder variables like [YOUR_NAME] with actual profile information where available
6. Make the message sound authentic and professional
7. Ensure the subject line is compelling and relevant

Respond with JSON in this exact format:
{
  "subject": "customized subject line",
  "content": "customized email content"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      subject: result.subject || template.subject,
      content: result.content || template.content,
    };
  } catch (error: any) {
    console.error("AI customization error:", error);
    
    // If OpenAI is unavailable, provide fallback customization
    if (error?.status === 429 || error?.code === 'insufficient_quota') {
      return fallbackCustomization(request);
    }
    
    throw new Error("Failed to customize template with AI");
  }
}

function buildProfileContext(profile: UserProfile): string {
  const context = [];
  
  // Construct full name from firstName and lastName
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
  if (fullName) {
    context.push(`Name: ${fullName}`);
  }
  
  if (profile.email) {
    context.push(`Email: ${profile.email}`);
  }
  
  if (profile.markets && profile.markets.length > 0) {
    context.push(`Markets: ${profile.markets.join(", ")}`);
  }
  
  // Skip the detailed profile context for now since we simplified the prompt
  
  if (profile.experienceLevel) {
    context.push(`Experience Level: ${profile.experienceLevel}`);
  }
  
  if (profile.focus && profile.focus.length > 0) {
    context.push(`Specializes in: ${profile.focus.join(", ")}`);
  }
  
  if (profile.borrowerTypes && profile.borrowerTypes.length > 0) {
    context.push(`Works with: ${profile.borrowerTypes.join(", ")} buyers`);
  }
  
  if (profile.timeAvailableWeekday) {
    context.push(`Time availability: ${profile.timeAvailableWeekday} minutes daily`);
  }
  
  if (profile.outreachComfort) {
    context.push(`Outreach comfort level: ${profile.outreachComfort}`);
  }
  
  if (profile.socialChannelsUsed && profile.socialChannelsUsed.length > 0) {
    context.push(`Social presence: ${profile.socialChannelsUsed.join(", ")}`);
  }
  
  if (profile.tonePreference) {
    context.push(`Preferred communication tone: ${profile.tonePreference}`);
  }
  
  if (profile.goals) {
    context.push(`90-day goal: ${profile.goals}`);
  }
  
  return context.join("\n");
}

function fallbackCustomization(request: CustomizationRequest): {
  subject: string;
  content: string;
} {
  const { template, userProfile, customization } = request;
  
  // Simple template personalization without AI
  let customizedSubject = template.subject;
  let customizedContent = template.content;
  
  // Replace common placeholders with user data
  const fullName = [userProfile.firstName, userProfile.lastName].filter(Boolean).join(' ');
  const replacements: Record<string, string> = {
    '[YOUR_NAME]': fullName || '[YOUR_NAME]',
    '[YOUR_EMAIL]': userProfile.email || '[YOUR_EMAIL]',
    '[YOUR_CITY]': userProfile.markets?.[0] || '[YOUR_CITY]',
    '[NMLS_ID]': '[NMLS_ID]',
    '[YOUR_PHONE]': '[YOUR_PHONE]', // Would need to be added to profile
    '[COMPANY_NAME]': '[COMPANY_NAME]', // Would need to be added to profile
  };
  
  // Apply replacements
  Object.entries(replacements).forEach(([placeholder, value]) => {
    customizedSubject = customizedSubject.replace(new RegExp(placeholder, 'g'), value);
    customizedContent = customizedContent.replace(new RegExp(placeholder, 'g'), value);
  });
  
  // Add key points if provided
  if (customization.keyPoints.trim()) {
    const keyPointsSection = `\n\nKey highlights:\n• ${customization.keyPoints.split(',').map(point => point.trim()).join('\n• ')}\n`;
    
    // Insert before signature or at the end
    if (customizedContent.includes('Best regards') || customizedContent.includes('Sincerely')) {
      customizedContent = customizedContent.replace(
        /(Best regards|Sincerely)/,
        keyPointsSection + '$1'
      );
    } else {
      customizedContent += keyPointsSection;
    }
  }
  
  // Adjust tone in subject line
  if (customization.tone === 'friendly') {
    customizedSubject = customizedSubject.replace(/^(.*?)$/, "👋 $1");
  } else if (customization.tone === 'urgent') {
    customizedSubject = `⚡ ${customizedSubject}`;
  }
  
  return {
    subject: customizedSubject,
    content: customizedContent
  };
}

// Deal Coach AI Service
export async function generateDealCoachAdvice({
  dealDetails,
  challenge,
  userProfile
}: {
  dealDetails: string;
  challenge: string;
  userProfile: UserProfile;
}): Promise<string> {
  // Simplified prompt without detailed profile context
  
  const prompt = `You are an expert mortgage coach. Provide concise, actionable advice in bullet points.

SITUATION: ${dealDetails}
CHALLENGE: ${challenge}
EXPERIENCE: ${userProfile.experienceLevel || 'new'}

REQUIREMENTS:
- Maximum 4 bullet points
- Each bullet should be 1 concise sentence
- Focus on immediate, practical actions
- Be direct and helpful
- No personal commentary or encouragement

Format your response as bullet points starting with •`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 200,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate advice at this time. Please try rephrasing your question or providing more specific details about your challenge.";
  } catch (error: any) {
    console.error("AI deal coach error:", error);
    
    // If OpenAI is unavailable, provide fallback advice
    if (error?.status === 429 || error?.code === 'insufficient_quota') {
      return generateFallbackDealAdvice({ dealDetails, challenge, userProfile });
    }
    
    throw new Error("Failed to generate deal coaching advice");
  }
}

function generateFallbackDealAdvice({
  dealDetails,
  challenge,
  userProfile
}: {
  dealDetails: string;
  challenge: string;
  userProfile: UserProfile;
}): string {
  // Generate basic advice based on common scenarios
  const adviceTemplates = {
    credit: `• Review credit report for errors and disputes
• Suggest paying down balances to improve utilization
• Explore alternative loan programs with flexible requirements
• Consider adding a creditworthy co-borrower`,
    
    income: `• Request additional documentation like tax returns and bank statements
• Consider alternative income documentation if self-employed
• Calculate debt-to-income ratio excluding certain debts
• Look into programs allowing gift funds or down payment assistance`,
    
    appraisal: `• Review appraisal for factual errors or missing comparable sales
• Request reconsideration of value with additional comps
• Discuss increasing down payment to meet loan-to-value requirements
• Explore loan programs with more flexible appraisal standards`,
    
    default: `• Communicate regularly with all parties to keep deal moving
• Document everything and maintain detailed notes
• Consider alternative loan programs or lenders
• Set realistic expectations about timing and potential issues`
  };

  // Try to match challenge keywords to advice type
  const challengeLower = challenge.toLowerCase();
  let advice = adviceTemplates.default;
  
  if (challengeLower.includes('credit') || challengeLower.includes('score')) {
    advice = adviceTemplates.credit;
  } else if (challengeLower.includes('income') || challengeLower.includes('employment') || challengeLower.includes('dti')) {
    advice = adviceTemplates.income;
  } else if (challengeLower.includes('appraisal') || challengeLower.includes('value') || challengeLower.includes('ltv')) {
    advice = adviceTemplates.appraisal;
  }

  // Add experience-specific advice
  if (userProfile.experienceLevel === 'new' || userProfile.experienceLevel === '<1y') {
    advice += "\n• Consult with your manager or experienced colleagues for guidance";
  }

  return advice;
}