# 🏥 MedVault Plus - Emergency & Health Management Platform

A comprehensive Django-based platform that provides **emergency response**, **AI-powered health safety**, and **secure healthcare wallet** functionalities. MedVault Plus integrates real-time alerts, food allergy detection, payment processing, and hospital network management for users, hospitals, and admins.  

---

## 🌟 Key Features

### 🚨 Emergency Response System
- **Smart QR Codes** – Time-limited access to emergency medical profiles  
- **Instant Alert System** – Automated SMS/voice alerts to emergency contacts  
- **Hospital Locator** – GPS-based nearest verified hospital detection  
- **Real-time Communication** – Twilio-powered notifications  

### 🤖 AI-Powered Health Safety
- **Food Allergy Scanner** – AI detection using image uploads or manual input  
- **Risk Assessment Engine** – Real-time allergy risk analysis  
- **Health Tips Generator** – Personalized recommendations using OpenAI GPT  
- **Multi-input Support** – Images and manual data entries  

### 💰 Healthcare Wallet
- **Secure Digital Wallet** – PIN-protected fund management  
- **Paystack Integration** – Secure deposits and payments  
- **Transaction Management** – Full financial history tracking  
- **Withdrawal System** – Bank transfer capability  

### 🏥 Hospital Network
- **Verified Hospital System** – Admin-approved healthcare providers  
- **Geolocation Services** – Locate hospitals nearby  
- **Emergency Service Coordination** – Streamlined patient-hospital communication  
- **Document Verification** – Secure hospital credential management  

### 🔐 Security & Privacy
- **JWT Authentication** – Token-based secure sessions  
- **Time-limited Access** – Auto-expiring QR codes  
- **PIN Protection** – Multi-layer transaction security  
- **Role-based Permissions** – Users, hospitals, and admins  

---

## 🛠️ Technology Stack

**Backend Framework**
- Django 4.2+  
- Django REST Framework  
- Simple JWT for authentication  
- PostgreSQL  

**AI & External Services**
- Nyckel AI – Food allergen detection  
- OpenAI GPT-4 – Health recommendations  
- Paystack – Payment processing  
- Twilio – SMS and voice communication  
- Cloudinary – Cloud media management  

**Security & Infrastructure**
- JWT tokens  
- CORS protection  
- Environment variable management  
- Redis for caching and session storage  

---

## 📦 Installation

### Prerequisites
- Python 3.8+  
- PostgreSQL 12+  
- Redis server  
- Cloudinary account  
- Paystack account  
- Twilio account  

### Step-by-Step Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Abdullateef2006/medvault.git
cd medvault
