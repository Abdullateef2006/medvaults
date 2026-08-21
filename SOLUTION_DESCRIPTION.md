# Solution Description (Copy-paste this into the form field)

MedVault+ is an AI-powered mobile health platform that solves a fundamental tension: the more personalized a health AI becomes, the more sensitive data it requires — and the more dangerous a breach becomes.

Our solution is a unified consent-and-personalization layer where users control exactly what data the AI can use for personalization versus what's exposed during emergencies — making privacy and personalization two sides of the same coin, not competing priorities.

Key features:
• AI Food Allergy Scanner — Users scan meals by photo or name. Our ML model detects allergens and calculates a personalized risk score based on each user's specific allergy severity (not a generic threshold).
• Adaptive Health Tips — OpenAI generates personalized health tips that evolve over time based on user engagement (what they found helpful vs. dismissed), creating a true learning loop, not one-shot responses.
• Shake-to-Alert Emergency System — Shaking the phone triggers an automated SMS + voice call to emergency contacts with GPS location and the 5 nearest hospitals matched to the user's specific medical conditions (e.g., cardiac patient → hospitals with cardiology), not just raw distance.
• Tiered Visibility Controls — Users toggle exactly which medical fields are visible via QR scan (for first responders) vs. used internally by the AI, with a full audit log of every data access.
• Health Savings Wallet — Paystack-powered deposits with PIN lockout after failed attempts and rule-based anomaly detection on withdrawals (flagging unusual amounts or frequency).
• Field-level encryption on sensitive medical data at rest, with comprehensive audit logging for full transparency.

Tech Stack: React Native (Expo) mobile app + Django REST Framework backend, integrating Nyckel ML, OpenAI GPT-4o-mini, Twilio (SMS/voice), Paystack, and Cloudinary.

MedVault+ targets Healthcare, Fintech, Fraud Prevention, and Identity & Privacy — demonstrating that AI personalization and cybersecurity are not opposing forces but the same system built on user consent.
