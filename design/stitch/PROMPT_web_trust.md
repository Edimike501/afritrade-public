# Stitch Generation Prompt — Screen 02: Trust Center & How Verification Works

- **App & Route**: `apps/web` ➔ `/trust`
- **Device Target**: Responsive (`DESKTOP` & `MOBILE`)
- **Variant Target**: 1 Variant (Comprehensive informational page)
- **Role**: Public Visitor, Prospective Buyer, Prospective Supplier, Capstone Evaluator
- **Status**: DESIGN-ONLY (Informational, per approved scope)

---

## 1. Screen Purpose & Design Direction
An educational, confidence-inspiring Trust Center and Verification Guide explaining how AfriTrade Connect guarantees safe wholesale commerce across Nigeria, South Africa, and Ghana. 

The tone is honest, straightforward, and professional. It uses everyday, accessible English with ZERO jargon (no "arteries", no "corridors", no "parity", no "exporter" — use "supplier" or "local business"). It strictly avoids inflated claims: it accurately describes manual KYB verification, safe simulated payments, and curated delivery tracking.

---

## 2. Core Structure & Sections

### 2.1 Responsive Header (56px–72px)
- **Brand**: AfriTrade Connect logo mark (green emblem + leaf/grain icon) + bold title.
- **Navigation Links**:
  - "Browse Products" (`/marketplace`)
  - "How Verification Works" (`/trust`, active state)
  - "About" (`/about`)
- **Actions**:
  - Currency switcher pill (`USD ($)`, `NGN (₦)`, `ZAR (R)`, `GHS (GH₵)`)
  - "Log In" link
  - "Sign Up Free" button (Pine green `#00513a`, rounded)
  - Mobile hamburger menu button ($\ge 44$px touch target) opening a slide-in drawer on mobile.

### 2.2 Trust Center Hero Section
- **Badge**: `Safe Wholesale Trade Across Nigeria · South Africa · Ghana`
- **Headline**: `Trust Center: How Verification and Trade Safety Work`
- **Subtitle**: `We make intra-African wholesale trading straightforward, transparent, and reliable. Learn how we verify suppliers, handle pricing, and track bulk deliveries.`
- **Quick Links / Anchor Pills**:
  - `1. Supplier Verification (KYB)`
  - `2. Safe Payments & Pricing`
  - `3. Curated Delivery Tracking`
- **Demo Mode Notice**: `[Demo Mode: All orders and payments use test simulation with zero real money]`

### 2.3 Pillar 1: Verified Businesses (The KYB Process)
Explains the 3-step manual verification process required before any supplier can list products:
1. **Document Submission**: Suppliers provide legal registration documents — Corporate Affairs Commission (CAC) for Nigeria, Companies and Intellectual Property Commission (CIPC) for South Africa, or Registrar General's Department (RGD) for Ghana, plus official tax ID and business address.
2. **Manual Admin Review**: Our team checks each record against national registries. If information is incomplete, the application is rejected with a clear explanation.
3. **Verified Supplier Badge**: Only approved businesses receive the "Verified Supplier" badge and gain permission to publish wholesale products on the marketplace. Unverified accounts cannot create listings.

### 2.4 Pillar 2: Transparent Pricing & Safe Simulation
- **Native Currency Pricing**: Suppliers price products in their local currency (NGN, ZAR, GHS, or USD).
- **Indicative Local Estimates**: Buyers always see real-time estimated equivalents in their selected currency, clearly labelled with no hidden surprises.
- **Zero Real Money Risk (MVP Phase)**: Every transaction runs through an append-only simulated payment system. Safe testing with full financial tracking without risking real funds.

### 2.5 Pillar 3: Curated Delivery Partners & Tracking
- **Curated Transport Network**: We partner with hand-picked regional transport and freight handlers.
- **Step-by-Step Delivery Tracking**: Every order includes a visual tracker covering supplier packaging, departure, customs processing, and final delivery arrival.

### 2.6 Frequently Asked Questions (Accordion)
- **Q1: Can any business list products immediately?**  
  *No. Every supplier must complete our manual business verification (KYB) and receive admin approval before publishing any product.*
- **Q2: Which countries are currently supported?**  
  *Nigeria, South Africa, and Ghana. We verify businesses registered in these three nations under the AfCFTA trade framework.*
- **Q3: How do currency conversions work?**  
  *The supplier sets the price in their chosen currency. Converted prices shown to buyers are indicative estimates for convenience.*
- **Q4: Is real money required to place orders during this demo?**  
  *No. AfriTrade Connect runs in a safe simulated demo mode. All payments are test transactions.*

### 2.7 Bottom Call to Action
- **Headline**: `Ready to trade with verified suppliers?`
- **Subtitle**: `Join wholesale buyers and suppliers connecting across Nigeria, South Africa, and Ghana.`
- **Buttons**:
  - `Create Free Account` (Gold `#feb62f`, text dark pine, rounded-full)
  - `Browse Verified Catalog` (Outlined)

### 2.8 Clean Responsive Footer
- Standard 4-column footer (For Buyers, For Suppliers, Countries, Help & Safety)
- Copyright 2025 AfriTrade Connect Ltd. All systems normal.

---

## 3. Styling Tokens (Per DESIGN.md)
- **Primary Color**: Deep Pine Green (`#00513a`)
- **Secondary Color**: Warm Gold (`#feb62f`)
- **Surface**: Mint White (`#f2fcf5`) / Card White (`#ffffff`)
- **Borders**: Soft Neutral (`#bec9c2`)
- **Typography**: `Bricolage Grotesque` (Headlines) & `Noto Sans` (Body)
- **Touch Targets**: Minimum 44px on all buttons and interactive elements.
