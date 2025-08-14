import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Wand2, Edit, Plus, Download, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const templates = {
  realtor: {
    name: "Realtor Introduction Email",
    description: "Perfect for introducing yourself to new real estate agents",
    subject: "Partnership Opportunity - Mortgage Solutions for Your Clients",
    content: `Hi [REALTOR_NAME],

I hope this email finds you well. My name is [YOUR_NAME], and I'm a mortgage loan officer with [COMPANY_NAME]. I specialize in helping first-time homebuyers and move-up buyers secure financing quickly and efficiently.

I noticed you've been quite active in the [LOCAL_AREA] market, and I'd love to explore how we might work together to better serve your clients. Here's what I can offer:

• Pre-approval letters within 24 hours
• Competitive rates and flexible loan programs
• Clear communication throughout the entire process
• Quick response times to keep deals on track

I'd appreciate the opportunity to grab coffee and discuss how I can support your business. Are you available for a brief 15-minute call this week?

Best regards,
[YOUR_NAME]
[YOUR_PHONE]
[YOUR_EMAIL]`
  },
  heloc: {
    name: "HELOC Warm Check-in",
    description: "Reach out to existing clients about HELOC opportunities",
    subject: "Unlock Your Home's Equity - HELOC Options Available",
    content: `Hi [CLIENT_NAME],

I hope you and your family are doing well in your home! With property values rising in our area, I wanted to reach out about a potential opportunity.

Your home has likely increased in value since you purchased it, which means you may have significant equity available. A Home Equity Line of Credit (HELOC) could help you:

• Access funds for home improvements
• Consolidate higher-interest debt
• Cover education expenses
• Create an emergency fund

I'd be happy to provide a no-obligation analysis to see what options might be available to you. The process is straightforward, and rates are still competitive.

Would you be interested in a quick 10-minute call to discuss your options?

Best regards,
[YOUR_NAME]`
  },
  fthb: {
    name: "First-Time Home Buyer Consultation",
    description: "Nurture and educate first-time home buyers",
    subject: "Your Home Buying Journey Starts Here",
    content: `Hi [BUYER_NAME],

Congratulations on taking the first step toward homeownership! I understand this can feel overwhelming, but I'm here to guide you through every step of the process.

As a first-time home buyer, you have access to several special programs and benefits:

• First-time buyer grants and down payment assistance
• FHA loans with as little as 3.5% down
• Conventional loans with 3% down options
• VA loans (if you're a veteran)

I'd love to schedule a free consultation to:
✓ Review your financial readiness
✓ Explain your loan options
✓ Get you pre-approved
✓ Connect you with trusted real estate agents

This consultation typically takes 30 minutes and will give you a clear roadmap for your home buying journey.

Are you available this week for a call?

Best regards,
[YOUR_NAME]`
  },
  preapproval: {
    name: "Pre-Approval Process",
    description: "Explain the pre-approval process to prospects",
    subject: "Get Pre-Approved Today - Strengthen Your Offer",
    content: `Hi [PROSPECT_NAME],

In today's competitive market, having a pre-approval letter is essential. It shows sellers you're a serious buyer and can often be the difference between getting your offer accepted or losing out to another buyer.

The pre-approval process is simple:

1. Complete a brief application (10 minutes)
2. Provide basic financial documents
3. Receive your pre-approval letter within 24 hours

Benefits of getting pre-approved:
• Know your exact budget before house hunting
• Shop with confidence
• Strengthen your offers
• Speed up the closing process

I can get you started today with a quick phone call or we can handle everything digitally if you prefer.

What works better for your schedule - a call this afternoon or tomorrow morning?

Best regards,
[YOUR_NAME]`
  },
  referral: {
    name: "Referral Partner Introduction",
    description: "Build relationships with potential referral partners",
    subject: "Partnership Opportunity - Mutual Referrals",
    content: `Hi [PARTNER_NAME],

I hope this message finds you well. My name is [YOUR_NAME], and I'm a mortgage loan officer specializing in [YOUR_SPECIALTY].

I've been following your work in [THEIR_INDUSTRY] and I'm impressed with your commitment to client service. I believe there might be an opportunity for us to work together and provide mutual referrals.

Here's how we could help each other:

For your clients:
• Fast, reliable mortgage processing
• Competitive rates and terms
• White-glove service experience
• Regular status updates

For your business:
• Referral fees for qualified leads
• Co-marketing opportunities
• Professional development resources

I'd love to explore how we might work together to better serve our respective clients. Would you be open to a brief coffee meeting next week?

Looking forward to hearing from you.

Best regards,
[YOUR_NAME]`
  }
};

export default function Outreach() {
  const [selectedTemplate, setSelectedTemplate] = useState("realtor");
  const [customizationForm, setCustomizationForm] = useState({
    recipientType: "realtor",
    tone: "professional",
    keyPoints: ""
  });
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Template copied to clipboard.",
    });
  };

  const handleCustomize = () => {
    toast({
      title: "AI Customization",
      description: "Template customization feature coming soon!",
    });
  };

  const currentTemplate = templates[selectedTemplate as keyof typeof templates];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Outreach Templates</h1>
        <p className="text-gray-600">Professional templates to help you connect with prospects and partners.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Template Library */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle>Email Templates</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Select a template to customize and use</p>
                </div>
                <div className="w-64">
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose template type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtor">Realtor Introduction</SelectItem>
                      <SelectItem value="heloc">HELOC Check-in</SelectItem>
                      <SelectItem value="fthb">First-Time Home Buyer</SelectItem>
                      <SelectItem value="preapproval">Pre-Approval Process</SelectItem>
                      <SelectItem value="referral">Referral Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{currentTemplate.name}</h3>
                  <p className="text-sm text-gray-600">{currentTemplate.description}</p>
                </div>
                <Button 
                  onClick={() => copyToClipboard(`Subject: ${currentTemplate.subject}\n\n${currentTemplate.content}`)}
                  className="bg-primary hover:bg-blue-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Template
                </Button>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="text-sm font-medium text-gray-900 mb-2">Subject Line:</div>
                <div className="text-sm text-gray-700 mb-4 italic">{currentTemplate.subject}</div>
                
                <div className="text-sm font-medium text-gray-900 mb-2">Email Body:</div>
                <div className="text-sm text-gray-900 whitespace-pre-wrap font-mono bg-white p-4 rounded border">
                  {currentTemplate.content}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleCustomize}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Customize with AI
                </Button>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* AI Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Wand2 className="w-5 h-5 text-orange-600 mr-2" />
                AI Customization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipient-type">Recipient Type</Label>
                  <Select 
                    value={customizationForm.recipientType}
                    onValueChange={(value) => setCustomizationForm(prev => ({ ...prev, recipientType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtor">Real Estate Agent</SelectItem>
                      <SelectItem value="past-client">Past Client</SelectItem>
                      <SelectItem value="prospect">New Prospect</SelectItem>
                      <SelectItem value="referral">Referral Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select
                    value={customizationForm.tone}
                    onValueChange={(value) => setCustomizationForm(prev => ({ ...prev, tone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="key-points">Key Points to Include</Label>
                  <Textarea
                    id="key-points"
                    value={customizationForm.keyPoints}
                    onChange={(e) => setCustomizationForm(prev => ({ ...prev, keyPoints: e.target.value }))}
                    placeholder="e.g., Quick turnaround times, competitive rates, local market expertise..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
                
                <Button 
                  onClick={handleCustomize}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Customize Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Template Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(templates).map(([key, template]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{template.name}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {Math.floor(Math.random() * 40 + 50)}% Response Rate
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.floor(Math.random() * 30 + 10)} sent this month
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-3" />
                  Create New Template
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-3" />
                  Export All Templates
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-3" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
