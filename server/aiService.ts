import OpenAI from "openai";
import type { UserProfile } from "@shared/schema";

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
  } catch (error) {
    console.error("AI customization error:", error);
    throw new Error("Failed to customize template with AI");
  }
}

function buildProfileContext(profile: UserProfile): string {
  const context = [];
  
  if (profile.fullName) {
    context.push(`Name: ${profile.fullName}`);
  }
  
  if (profile.email) {
    context.push(`Email: ${profile.email}`);
  }
  
  if (profile.market) {
    context.push(`Market/City: ${profile.market}`);
  }
  
  if (profile.statesLicensed) {
    context.push(`Licensed in: ${profile.statesLicensed.join(", ")}`);
  }
  
  if (profile.nmlsId) {
    context.push(`NMLS ID: ${profile.nmlsId}`);
  }
  
  if (profile.experienceLevel) {
    context.push(`Experience Level: ${profile.experienceLevel}`);
  }
  
  if (profile.focusAreas && profile.focusAreas.length > 0) {
    context.push(`Specializes in: ${profile.focusAreas.join(", ")}`);
  }
  
  if (profile.borrowerTypes && profile.borrowerTypes.length > 0) {
    context.push(`Works with: ${profile.borrowerTypes.join(", ")} buyers`);
  }
  
  if (profile.timeAvailability) {
    context.push(`Time availability: ${profile.timeAvailability} minutes daily`);
  }
  
  if (profile.outreachComfort) {
    context.push(`Outreach comfort level: ${profile.outreachComfort}`);
  }
  
  if (profile.networkAssets && profile.networkAssets.length > 0) {
    context.push(`Network: ${profile.networkAssets.join(", ")}`);
  }
  
  if (profile.socialChannels && profile.socialChannels.length > 0) {
    context.push(`Social presence: ${profile.socialChannels.join(", ")}`);
  }
  
  if (profile.tonePreference) {
    context.push(`Preferred communication tone: ${profile.tonePreference}`);
  }
  
  if (profile.goals90Day) {
    context.push(`90-day goal: ${profile.goals90Day}`);
  }
  
  return context.join("\n");
}