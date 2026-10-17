# AfriTrade Connect — Anti-Generic UI/UX Rubric & Acceptance Standards

> **Authority & Compliance**: Grounded strictly in `design/stitch/ANSWERS.md` (Q7, Q8, Q9), `06_ANTI_GENERIC_RUBRIC.md`, `11_REFERENCE_ANALYSIS.md`, and master architecture decisions.  
> **Purpose**: Testable pass/fail evaluation framework for Google Stitch generation output and subsequent frontend implementation.

---

## 1. The Owner's Direct Acceptance Criteria (Verbatim Words)

Per **`ANSWERS.md` Q7, Q8, Q9**:
- **"It must look like serious infrastructure, not a weekend toy or a hackathon mockup."** `[ANSWERS Q7]`
- **"Clear, high-density, authoritative. When an African exporter or international buyer lands on the page, they must instantly see real commodities, real corridors (Nigeria, South Africa, Ghana), verified legal entities, and concrete logistics pipelines."** `[ANSWERS Q8]`
- **"No cartoonish illustrations, no fake venture-backed SaaS gradients, and no generic template fluff. It must feel like an operational trade portal built for real commerce under AfCFTA."** `[ANSWERS Q9]`

---

## 2. Testable Pass / Fail Evaluation Matrix

Every generated screen must be scored against this rubric. A single "FAIL" rating requires immediate prompt refinement and regeneration.

| Evaluation Criterion | PASS Criteria (Authoritative Standard) | FAIL Criteria (Default AI Rejection) | Verification Method |
| :--- | :--- | :--- | :--- |
| **1. Domain Specificity** | Explicitly renders AfCFTA corridors (`NG`, `ZA`, `GH`), legal enterprise identifiers, ISO currencies (`NGN`, `ZAR`, `GHS`, `USD`), and commodity metrics (MT, 50kg bags). | Generic placeholders ("Product Title", "$100", "Feature 1", "Lorem ipsum"). | Visual inspection of text content. |
| **2. Banned AI Smells** | Clean solid surfaces, 1px structural borders, purposeful layout geometry, duotone Phosphor icons. | Gradient blobs, pastel rounded cards, 3-icon feature blocks, emoji as icons, glowing neon shadows. | Visual inspection of styling. |
| **3. Typography & Hierarchy** | Bricolage Grotesque (Bold/ExtraBold) for titles; Noto Sans with Tabular Figures for labels and numbers. | Default Inter/Roboto with zero personality, centered body text, inconsistent line heights. | CSS font stack audit. |
| **4. Color & Contrast** | Deep Forest Emerald (`#0f6b4f`), Harvest Gold (`#e8a317`), Night Slate (`#0a0f0d`). Minimum 4.5:1 WCAG contrast. | Washed-out grays, purple/blue generic SaaS accents, low-contrast text on colored cards. | WCAG 2.2 AA contrast check. |
| **5. Layout & Density** | Information-rich, professional B2B density. Asymmetric, functional splits, high-data tables. | Over-spaced mobile cards floating in desktop whitespace, centered-everything heroes. | Layout scannability audit. |
| **6. Reference Distinction** | Modern, high-contrast, clean whitespace, dual-price cards, structured order pipeline. | Resembles GlobalBuyersOnline's dated 2003 aesthetic (link walls, tiny flag grids, text-only leads). | Visual comparison check. |

---

## 3. The Explicit BANNED LIST (Default-AI & Reference Smells)

Any screen exhibiting any of the following items fails immediately:

1. **Auto-Rotating Hero Carousels**: Distracting, low-conversion, banned by owner `[11_REFERENCE_ANALYSIS.md]`.
2. **Dense Link Walls**: Massive unformatted lists of category links filling columns `[11_REFERENCE_ANALYSIS.md]`.
3. **Tiny Country Flag Icon Grids**: Cluttered, dated, unreadable on mobile screens `[11_REFERENCE_ANALYSIS.md]`.
4. **Text-Only Listing Rows**: Bare text inquiries lacking photos, dual-currency pricing, and MOQ `[11_REFERENCE_ANALYSIS.md]`.
5. **Gradient Hero Blobs**: Blurry purple/pink/blue radial gradients floating in backgrounds.
6. **The "Three Feature Cards" Cliché**: Three centered rounded cards with icons explaining basic software features.
7. **Emoji Used as System Icons**: 🚀, 📦, 💰 in place of crisp Phosphor Duotone vectors.
8. **Centered-Everything Hero**: Centered H1, centered paragraph, and centered buttons with vast empty margins.
9. **Generic Stock Photography Mood**: Unrelated corporate handshakes or stereotypical safari/tribal imagery `[ANSWERS Q14]`.
10. **Fake Testimonials & Logos**: Fabricated client reviews, fake enterprise logos, or unverified volume counters.

---

## 4. Pan-African B2B Trade Authenticity Markers

To pass review, screens must prominently feature domain-specific markers:

- **Active Corridors**: Clear corridor badges (e.g. `Lagos (NG) ➔ Tema (GH)`, `Durban (ZA) ➔ Apapa (NG)`).
- **Physical Commodities**: Agricultural commodities (Yellow Maize, Raw Cashew Nuts, Sesame Seeds, Cocoa Beans), solid minerals, and textiles.
- **Packaging Units**: Metric Tonnes (MT), 50kg Jute Bags, 20ft FCL Containers.
- **Dual-Price Currency Pairs**: Listed supplier currency with indicative conversion (e.g. `GHS 150.00 / bag ≈ NGN 15,000 (indicative)`).
- **Governance & Verification Signals**: `Verified Exporter` seal, CAC / CIPC / Registrar-General corporate filing status, and `Mock Payment [Simulated Mode]` disclosure.
