export type Category = "desired" | "undesired";
export type Tag = "Desired" | "Action Required" | "Promotional" | "Spam Alert" | "Newsletter";

export interface Email {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  body: string;
  time: string;
  category: Category;
  tags: Tag[];
  unread: boolean;
  starred: boolean;
  priority: boolean;
  reason: string;
  attachments?: { name: string; size: string }[];
  replies?: { label: string; text: string }[];
}

export const seedEmails: Email[] = [
  {
    id: "1", from: "Elena Ruiz", fromEmail: "elena@northwind.co", to: "you@mailflow.ai",
    subject: "Kickoff meeting for the Q4 redesign", time: "09:24",
    category: "desired", tags: ["Desired", "Action Required"], unread: true, starred: true, priority: true,
    reason: "High Priority / Desired Email — Client Inquiry",
    body: "Hi,\n\nThanks again for the proposal. Our team loved the direction and we'd like to schedule a kickoff meeting for the Q4 redesign.\n\nWould Thursday at 10am work for you? We can also do Friday afternoon if that's easier. I've attached the brief and our brand guidelines.\n\nBest,\nElena",
    attachments: [{ name: "Q4-brief.pdf", size: "2.4 MB" }, { name: "brand-guidelines.zip", size: "18 MB" }],
    replies: [
      { label: "Acknowledge & Confirm Meeting", text: "Hi Elena,\n\nThanks for the update! Thursday at 10am works perfectly. I'll send a calendar invite shortly.\n\nBest," },
      { label: "Politely Decline", text: "Hi Elena,\n\nThanks for reaching out. Unfortunately Thursday and Friday don't work for me this week — could we look at early next week instead?\n\nBest," },
      { label: "Request More Details", text: "Hi Elena,\n\nGreat to hear! Before we lock in a time, could you share who'll be attending and the main goals for the kickoff?\n\nThanks," },
    ],
  },
  {
    id: "2", from: "Marcus Lee", fromEmail: "marcus@finchpay.io", to: "you@mailflow.ai",
    subject: "Invoice #2031 approved — payment scheduled", time: "08:02",
    category: "desired", tags: ["Desired"], unread: true, starred: false, priority: true,
    reason: "Desired Email — Billing from a known contact",
    body: "Hello,\n\nInvoice #2031 has been approved by finance and payment is scheduled for Monday. Let me know if you need a remittance copy.\n\nCheers,\nMarcus",
    attachments: [{ name: "remittance-2031.pdf", size: "180 KB" }],
    replies: [
      { label: "Thank & Confirm", text: "Hi Marcus,\n\nThank you — Monday works great. No remittance copy needed.\n\nBest," },
      { label: "Ask for Remittance", text: "Hi Marcus,\n\nThanks! Could you send the remittance copy when it's ready?\n\nBest," },
      { label: "Request More Details", text: "Hi Marcus,\n\nThanks for the update. Could you confirm the payment amount and method?\n\nBest," },
    ],
  },
  {
    id: "3", from: "Design Weekly", fromEmail: "hello@designweekly.com", to: "you@mailflow.ai",
    subject: "10 interface trends shaping 2027", time: "Yesterday",
    category: "desired", tags: ["Newsletter"], unread: false, starred: false, priority: false,
    reason: "Newsletter — Subscribed, low urgency",
    body: "This week: spatial interfaces, calm tech, and why typography is making a comeback in product design. Read the full issue on our site.",
  },
  {
    id: "4", from: "MegaDeals", fromEmail: "promo@megadeals.shop", to: "you@mailflow.ai",
    subject: "🔥 72% OFF everything — today only!", time: "Yesterday",
    category: "undesired", tags: ["Promotional"], unread: true, starred: false, priority: false,
    reason: "Undesired: Promotional / Marketing",
    body: "Don't miss our biggest sale of the year! Everything is 72% off for the next 12 hours. Shop now before it's gone.",
  },
  {
    id: "5", from: "Account Security", fromEmail: "verify@paypa1-support.net", to: "you@mailflow.ai",
    subject: "Urgent: your account will be suspended", time: "Oct 19",
    category: "undesired", tags: ["Spam Alert"], unread: true, starred: false, priority: false,
    reason: "Undesired: Suspected phishing — spoofed sender domain",
    body: "We detected unusual activity. Click the link below within 24 hours to verify your identity or your account will be permanently suspended.",
  },
  {
    id: "6", from: "Priya Shah", fromEmail: "priya@studio.dev", to: "you@mailflow.ai",
    subject: "Feedback on the prototype", time: "Oct 18",
    category: "desired", tags: ["Desired", "Action Required"], unread: false, starred: true, priority: true,
    reason: "High Priority / Desired Email — Teammate awaiting response",
    body: "Hey!\n\nI went through the prototype — the onboarding flow feels great. Two small notes on the settings screen. Can we sync for 15 minutes tomorrow?\n\nPriya",
    replies: [
      { label: "Confirm a Quick Sync", text: "Hey Priya,\n\nThanks for the notes! Tomorrow works — how about 11am?\n\n" },
      { label: "Politely Decline", text: "Hey Priya,\n\nTomorrow is packed for me. Could you drop the notes in the doc and I'll review async?\n\n" },
      { label: "Request More Details", text: "Hey Priya,\n\nThanks! Could you share the two notes ahead of time so I can prep?\n\n" },
    ],
  },
  {
    id: "7", from: "CryptoBoost", fromEmail: "win@cryptoboost.biz", to: "you@mailflow.ai",
    subject: "You've been selected to earn $5,000/week", time: "Oct 17",
    category: "undesired", tags: ["Spam Alert"], unread: false, starred: false, priority: false,
    reason: "Undesired: Spam — unsolicited financial offer",
    body: "Congratulations! You've been hand-picked for an exclusive opportunity. Reply now to claim your spot.",
  },
];
