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
  
  if (profile.statesLicensedIn && profile.statesLicensedIn.length > 0) {
    context.push(`Licensed in: ${profile.statesLicensedIn.join(", ")}`);
  }
  
  if (profile.nmlsLicenseId) {
    context.push(`NMLS ID: ${profile.nmlsLicenseId}`);
  }
  
  if (profile.experienceLevel) {
    context.push(`Experience Level: ${profile.experienceLevel}`);
  }
  
  if (profile.focusAreasSelected && profile.focusAreasSelected.length > 0) {
    context.push(`Specializes in: ${profile.focusAreasSelected.join(", ")}`);
  }
  
  if (profile.borrowerTypesWorkedWith && profile.borrowerTypesWorkedWith.length > 0) {
    context.push(`Works with: ${profile.borrowerTypesWorkedWith.join(", ")} buyers`);
  }
  
  if (profile.dailyTimeAvailable) {
    context.push(`Time availability: ${profile.dailyTimeAvailable} minutes daily`);
  }
  
  if (profile.outreachComfortLevel) {
    context.push(`Outreach comfort level: ${profile.outreachComfortLevel}`);
  }
  
  if (profile.networkAssets && profile.networkAssets.length > 0) {
    context.push(`Network: ${profile.networkAssets.join(", ")}`);
  }
  
  if (profile.socialChannelsUsed && profile.socialChannelsUsed.length > 0) {
    context.push(`Social presence: ${profile.socialChannelsUsed.join(", ")}`);
  }
  
  if (profile.tonePreference) {
    context.push(`Preferred communication tone: ${profile.tonePreference}`);
  }
  
  if (profile.goalDescription) {
    context.push(`90-day goal: ${profile.goalDescription}`);
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
    '[NMLS_ID]': userProfile.nmlsLicenseId || '[NMLS_ID]',
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
  const profileContext = buildProfileContext(userProfile);
  
  const prompt = `You are an expert mortgage loan officer coach with 20+ years of experience helping loan officers overcome challenges and close deals successfully.

LOAN OFFICER PROFILE:
${profileContext}

DEAL SITUATION:
${dealDetails}

SPECIFIC CHALLENGE:
${challenge}

INSTRUCTIONS:
1. Provide specific, actionable advice based on the loan officer's experience level and market
2. Consider their specialization areas and borrower types they work with
3. Give practical steps they can take immediately
4. Include relevant mortgage industry best practices
5. Suggest communication strategies that match their tone preference
6. Be encouraging but realistic about the situation
7. If applicable, mention relevant compliance considerations (TRID, QM rules, etc.)
8. Keep advice focused and implementable within their available time

Provide your coaching advice in a helpful, professional tone. Focus on practical solutions and next steps.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 800,
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
    credit: `For credit-related challenges, consider these steps:
• Review the borrower's credit report for any errors that can be disputed
• Suggest credit repair strategies like paying down balances or removing old inquiries
• Explore alternative loan programs that may have more flexible credit requirements
• Consider a co-signer if the borrower has family support
• Document any compensating factors like stable employment or large down payment`,
    
    income: `For income verification issues:
• Request additional documentation like tax returns, pay stubs, or bank statements
• Consider alternative income documentation if self-employed
• Explore stated income loan programs if available in your market
• Calculate debt-to-income ratio with and without certain debts
• Look into programs that allow for gift funds or down payment assistance`,
    
    appraisal: `For appraisal concerns:
• Review the appraisal for any factual errors or missing comparable sales
• Consider requesting a reconsideration of value with additional comps
• Explore whether a second appraisal might be beneficial
• Discuss options like increasing down payment to meet loan-to-value requirements
• Look into different loan programs that may have more flexible appraisal standards`,
    
    default: `Here are some general strategies for deal challenges:
• Communicate regularly with all parties to keep the deal moving
• Document everything and maintain detailed notes for your file
• Consider alternative loan programs or lenders if current path isn't working
• Set realistic expectations with all parties about timing and potential issues
• Don't hesitate to escalate to your manager or underwriting team for guidance`
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

  // Personalize based on experience level
  if (userProfile.experienceLevel === 'new' || userProfile.experienceLevel === '<1y') {
    advice += "\n\nAs a newer loan officer, don't hesitate to lean on your manager and more experienced colleagues for guidance. This is a learning opportunity that will make you stronger for future deals.";
  }

  return advice;
}