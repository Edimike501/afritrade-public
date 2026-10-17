# Stitch Generation Prompt — Screen 04: User Login

- **App & Route**: `apps/web` ➔ `/login`
- **Device Target**: Responsive (`DESKTOP` & `MOBILE`)
- **Variant Target**: 1 Variant (Clean authentication layout with evaluator demo pills)
- **Role**: Registered Buyer, Supplier, Evaluator

---

## 1. Screen Purpose & Design Direction
A clean, secure, and user-friendly login screen for AfriTrade Connect. It provides easy sign-in for registered commercial buyers and suppliers, while featuring convenient demo quick-fill shortcuts so capstone defense evaluators can test role sessions with one tap.

Tone is professional, welcoming, and straightforward. Everyday plain English only (no banned jargon).

---

## 2. Core Structure & Form Elements

### 2.1 Clean Header
- AfriTrade Connect brand mark + title, with a right-aligned link: "Don't have an account? Sign Up".

### 2.2 Centered Login Card (Max width ~460px - 500px, responsive)
- **Headline**: `Welcome Back`
- **Subtitle**: `Sign in to manage your wholesale orders and verified supplier products.`
- **Security Indicator**: Subtle green security chip: `Encrypted Session · In-Memory Token Security`
- **Form Inputs**:
  1. **Work / Business Email** (`email`): Input with placeholder `e.g. amara@lagoswholesale.ng`
  2. **Password** (`password`): Input with eye show/hide toggle and placeholder `Enter your password`
  3. **Row with Remember Me & Forgot Password**:
     - Checkbox: `Remember this device`
     - Text link: `Forgot password?`
  4. **Primary Submit Button**:
     - Full-width `Sign In` button (Deep Pine Green `#00513a`, min 48px height, bold white text)
- **Demo Quick-Fill Evaluator Shortcuts**:
  - Box titled: `Evaluation Shortcuts (Demo Sandbox):`
  - Two quick-fill pills:
    - `[⚡ Log in as Buyer (NG)]`
    - `[⚡ Log in as Supplier (GH)]`
- **Footer Link**:
  - `New to AfriTrade? Create an Account`

### 2.3 Interactive Error Demonstration
- A toggle or notification illustrating the typed domain error `AUTH_INVALID_CREDENTIALS` ("Invalid email or password. Please verify your credentials and try again.")

---

## 3. Design Tokens & Styling
- **Primary**: Deep Pine Green (`#00513a`)
- **Secondary**: Warm Gold (`#feb62f`)
- **Surface**: Mint White (`#f2fcf5`) and Card White (`#ffffff`)
- **Borders**: Soft Neutral (`#bec9c2`)
- **Typography**: `Bricolage Grotesque` (Headlines) & `Noto Sans` (Form inputs/labels)
- **Touch Targets**: Minimum 44px–48px on all interactive elements.
