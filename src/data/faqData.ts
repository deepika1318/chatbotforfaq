/**
 * FAQ dataset for an online shopping / e-commerce product support service.
 * Each entry is a question-answer pair with a category, so the dataset can be
 * extended simply by appending new objects to the array below.
 */

export interface FaqEntry {
  id: number;
  question: string;
  answer: string;
  category: FaqCategory;
}

export type FaqCategory =
  | "Orders & Shipping"
  | "Returns & Refunds"
  | "Account & Security"
  | "Payments & Invoices"
  | "Product & Stock"
  | "Customer Support";

export const FAQ_CATEGORIES: FaqCategory[] = [
  "Orders & Shipping",
  "Returns & Refunds",
  "Account & Security",
  "Payments & Invoices",
  "Product & Stock",
  "Customer Support",
];

export const faqData: FaqEntry[] = [
  // ---------------------------------------------------------------- Orders
  {
    id: 1,
    question: "Where is my package? How can I track my order?",
    answer:
      "Open your account and go to Orders → Track shipment. Every dispatched order also gets a tracking link by email and SMS. Tracking updates usually appear within 12 hours of dispatch.",
    category: "Orders & Shipping",
  },
  {
    id: 2,
    question: "How long does delivery usually take?",
    answer:
      "Standard delivery takes 3–6 business days, express delivery 1–2 business days. Remote postal codes may add 1–2 extra days.",
    category: "Orders & Shipping",
  },
  {
    id: 3,
    question: "How do I cancel my order?",
    answer:
      "You can cancel from Orders → Cancel order any time before the parcel is dispatched. After dispatch, refuse the delivery or start a return once it arrives.",
    category: "Orders & Shipping",
  },
  {
    id: 4,
    question: "Can I change the delivery address after placing an order?",
    answer:
      "Yes, as long as the order has not been packed. Go to Orders → Edit delivery address. Once the parcel is handed to the courier the address is locked.",
    category: "Orders & Shipping",
  },
  {
    id: 5,
    question: "Do you offer free shipping?",
    answer:
      "Shipping is free on all orders above $49. Below that, standard shipping costs $4.99 and express shipping $9.99.",
    category: "Orders & Shipping",
  },
  {
    id: 6,
    question: "Do you ship internationally?",
    answer:
      "We ship to 40 countries. International delivery takes 7–14 business days; customs duties, if any, are payable by the recipient.",
    category: "Orders & Shipping",
  },
  {
    id: 7,
    question: "My order is delayed, what should I do?",
    answer:
      "If your parcel has not moved for 5 days, raise a delay ticket from Orders → Report a problem. We investigate with the courier and respond within 48 hours.",
    category: "Orders & Shipping",
  },
  {
    id: 8,
    question: "My package arrived damaged or with missing items",
    answer:
      "Report it within 7 days via Orders → Report a problem and upload photos of the parcel and items. We send a free replacement or a full refund once verified.",
    category: "Orders & Shipping",
  },
  {
    id: 9,
    question: "Can I schedule a delivery date or time slot?",
    answer:
      "Yes. At checkout choose Scheduled delivery and pick an available date. You can also reschedule once from the courier tracking page.",
    category: "Orders & Shipping",
  },

  // --------------------------------------------------------------- Returns
  {
    id: 10,
    question: "Can I get a refund for my purchase?",
    answer:
      "Yes. Items returned within 30 days in original condition qualify for a full refund. Refunds are issued to the original payment method after the item passes inspection.",
    category: "Returns & Refunds",
  },
  {
    id: 11,
    question: "How do I return a product I bought?",
    answer:
      "Go to Orders → Return item, pick a reason, and print the prepaid return label. Drop the parcel at any partner pickup point within 7 days.",
    category: "Returns & Refunds",
  },
  {
    id: 12,
    question: "How long does a refund take to reach my bank account?",
    answer:
      "Refunds are approved within 3 business days of the returned item arriving, and the money reaches your bank or card in a further 3–7 business days.",
    category: "Returns & Refunds",
  },
  {
    id: 13,
    question: "What is your return policy window?",
    answer:
      "Most products can be returned within 30 days of delivery. Electronics have a 15-day window, and personal care or intimate items are non-returnable for hygiene reasons.",
    category: "Returns & Refunds",
  },
  {
    id: 14,
    question: "Can I exchange an item for a different size or colour?",
    answer:
      "Yes. Choose Exchange instead of Return in Orders → Return item and select the size or colour you want. The replacement ships as soon as we receive the original.",
    category: "Returns & Refunds",
  },
  {
    id: 15,
    question: "Do I have to pay for return shipping?",
    answer:
      "Return shipping is free for damaged, defective, or wrongly shipped items. For change-of-mind returns a $3.99 pickup fee is deducted from the refund.",
    category: "Returns & Refunds",
  },
  {
    id: 16,
    question: "My refund has not arrived yet, what can I do?",
    answer:
      "Check the refund status under Orders → Refunds. If it shows Completed but the money is missing after 7 business days, share the reference number with support and we will trace it with the bank.",
    category: "Returns & Refunds",
  },

  // --------------------------------------------------------------- Account
  {
    id: 17,
    question: "I forgot my password, how do I reset it?",
    answer:
      "Click Forgot password on the sign-in screen, enter your registered email, and follow the reset link we send you. The link expires after 30 minutes.",
    category: "Account & Security",
  },
  {
    id: 18,
    question: "How do I change my email address or phone number?",
    answer:
      "Open Account → Profile settings, edit the field, and confirm the verification code sent to the new email or phone number.",
    category: "Account & Security",
  },
  {
    id: 19,
    question: "How do I delete my account permanently?",
    answer:
      "Go to Account → Privacy → Delete account. Deletion is final after a 14-day grace period, during which signing in cancels the request.",
    category: "Account & Security",
  },
  {
    id: 20,
    question: "How do I enable two factor authentication?",
    answer:
      "In Account → Security, turn on two-factor authentication and scan the QR code with an authenticator app. Store the backup codes somewhere safe.",
    category: "Account & Security",
  },
  {
    id: 21,
    question: "I think my account has been hacked, what should I do?",
    answer:
      "Immediately reset your password, sign out all devices from Account → Security → Active sessions, and enable two-factor authentication. Contact support if you see unknown orders.",
    category: "Account & Security",
  },
  {
    id: 22,
    question: "How do I update my saved delivery addresses?",
    answer:
      "Manage all saved addresses under Account → Address book, where you can add, edit, delete, or set a default address.",
    category: "Account & Security",
  },

  // -------------------------------------------------------------- Payments
  {
    id: 23,
    question: "What payment methods do you accept?",
    answer:
      "We accept Visa, Mastercard, American Express, UPI, net banking, major digital wallets, and cash on delivery for eligible postal codes.",
    category: "Payments & Invoices",
  },
  {
    id: 24,
    question: "My payment failed but money was deducted",
    answer:
      "Failed transactions are auto-reversed by your bank within 5–7 business days. If the order did not confirm, no charge is captured on our side.",
    category: "Payments & Invoices",
  },
  {
    id: 25,
    question: "How do I download my invoice or receipt?",
    answer:
      "Open Orders → select the order → Download invoice. The PDF invoice includes tax details and is also emailed after dispatch.",
    category: "Payments & Invoices",
  },
  {
    id: 26,
    question: "How do I apply a coupon or discount code?",
    answer:
      "Enter the code in the Apply coupon box on the checkout page. Only one code can be used per order and codes cannot be added after payment.",
    category: "Payments & Invoices",
  },
  {
    id: 27,
    question: "Is it safe to save my card details on your site?",
    answer:
      "Card data is tokenised by our PCI-DSS certified payment partner, so we never store raw card numbers. You can remove saved cards from Account → Payments.",
    category: "Payments & Invoices",
  },
  {
    id: 28,
    question: "Do you offer cash on delivery or pay later options?",
    answer:
      "Cash on delivery is available on orders under $300 in supported postal codes. Pay-later instalments are offered at checkout for eligible accounts.",
    category: "Payments & Invoices",
  },

  // --------------------------------------------------------------- Product
  {
    id: 29,
    question: "An item is out of stock, when will it be available again?",
    answer:
      "Tap Notify me on the product page and we will email you the moment it is restocked. Popular items are usually replenished within 2–3 weeks.",
    category: "Product & Stock",
  },
  {
    id: 30,
    question: "How do I know which size to order?",
    answer:
      "Every product page has a Size guide link with measurements in cm and inches, plus fit feedback from verified buyers.",
    category: "Product & Stock",
  },
  {
    id: 31,
    question: "Is the product covered by a warranty?",
    answer:
      "Electronics carry a 12-month manufacturer warranty, appliances 24 months. The exact warranty period is listed in the product specifications tab.",
    category: "Product & Stock",
  },
  {
    id: 32,
    question: "Are the products original and authentic?",
    answer:
      "All items are sourced from brand-authorised distributors and shipped with original invoices, serial numbers, and warranty cards.",
    category: "Product & Stock",
  },
  {
    id: 33,
    question: "Can I pre-order an upcoming product?",
    answer:
      "Yes, products marked Pre-order can be reserved with full payment. They ship on the launch date shown on the product page and can be cancelled free before shipping.",
    category: "Product & Stock",
  },

  // --------------------------------------------------------------- Support
  {
    id: 34,
    question: "How can I contact customer support?",
    answer:
      "Reach us via live chat inside the app, email support@shopdesk.example, or phone 1800-123-456 between 9 AM and 9 PM, seven days a week.",
    category: "Customer Support",
  },
  {
    id: 35,
    question: "What are your customer service working hours?",
    answer:
      "Live chat and phone support run 9 AM to 9 PM local time every day. Email tickets are answered within 24 hours, including weekends.",
    category: "Customer Support",
  },
  {
    id: 36,
    question: "How do I file a complaint or escalate an issue?",
    answer:
      "Reply to your existing ticket with the word Escalate, or use Help → Raise a complaint. A senior specialist responds within one business day.",
    category: "Customer Support",
  },
  {
    id: 37,
    question: "How do I leave a review or give feedback on a product?",
    answer:
      "Open Orders → select a delivered item → Write a review. Ratings, text, and photos can be added up to 90 days after delivery.",
    category: "Customer Support",
  },
];
