import sgMail from '@sendgrid/mail';

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY not found, falling back to console logging');
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

async function sendEmail(emailData: EmailData): Promise<void> {
  // Use a domain that works with SendGrid - either configured domain or default
  const fromDomain = process.env.SENDGRID_FROM_EMAIL || 'hello@ramplo.app';
  
  const email = {
    ...emailData,
    from: emailData.from || fromDomain
  };

  if (process.env.SENDGRID_API_KEY) {
    try {
      await sgMail.send(email);
      console.log(`Email sent to ${email.to}: ${email.subject}`);
    } catch (error) {
      console.error('SendGrid error:', error);
      console.log(`[EMAIL FALLBACK] To: ${email.to}, Subject: ${email.subject}`);
    }
  } else {
    console.log(`[EMAIL FALLBACK] To: ${email.to}, Subject: ${email.subject}`);
  }
}

export async function sendWelcomeEmail(email: string, userName: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Welcome to RampLO - Your 90-Day Journey Begins',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Welcome to RampLO, ${userName}!</h2>
        <p>You've taken the first step toward mortgage success. Your personalized 90-day roadmap is ready!</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">What's Next?</h3>
          <ul style="color: #6b7280;">
            <li>Complete your profile setup for personalized tasks</li>
            <li>Review your daily action items</li>
            <li>Start building your mortgage business systematically</li>
          </ul>
        </div>
        
        <p style="color: #6b7280;">Ready to get started? Log in to RampLO and begin your journey to your first 1-3 deals!</p>
      </div>
    `
  });
}

export async function sendMagicLinkEmail(email: string, token: string): Promise<void> {
  // Use the correct domain for production vs development
  const isProduction = process.env.REPLIT_DEPLOYMENT === '1' || process.env.NODE_ENV === 'production';
  const baseUrl = isProduction 
    ? `https://${process.env.REPL_SLUG}.${process.env.REPLIT_CLUSTER}.replit.app`
    : `https://${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.${process.env.REPLIT_CLUSTER}.replit.dev`;
  
  const magicLinkUrl = `${baseUrl}/api/auth/verify?token=${token}`;

  // Always log the magic link URL for development
  console.log(`🔗 MAGIC LINK for ${email}: ${magicLinkUrl}`);

  await sendEmail({
    to: email,
    subject: 'Your RampLO Login Link',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Welcome to RampLO</h2>
        <p>Click the button below to securely log in to your RampLO account:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${magicLinkUrl}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Log In to RampLO
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${magicLinkUrl}">${magicLinkUrl}</a>
        </p>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          This link will expire in 30 minutes for security reasons.
        </p>
      </div>
    `
  });
}
