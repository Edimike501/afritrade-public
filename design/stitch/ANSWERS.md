# AfriTrade Connect - Design Answers (FINAL, owner-approved)

Legend: [OWNER] = stated by owner. [DELEGATED] = owner delegated the call, editable. No open items remain.

## A. Scope

1. [OWNER] Redesign BOTH apps fully. STANDING PROCESS RULE: any new screen goes through Stitch for design FIRST; no implementation code before an approved Stitch design.
2. [OWNER] ONE branded family across apps/web and apps/admin. packages/ui (shared components) is IN SCOPE of the design system and of every md file.
3. [OWNER] Mobile-first but equal. Buyers = mostly mobile. Suppliers and admin = mostly laptops (laptop-primary layouts, still fully responsive).
4. [OWNER] Light AND dark. Default = follow device setting; an icon toggle overrides it.
5. [OWNER] Admin sidebar has a "Users" group with children: Buyers, Suppliers, KYB, KYC. KYC is a PLACEHOLDER only (clearly marked "Coming soon", no flow). These admin Users screens are design-only until SCOPE.md is updated.

## B. Brand & feeling

6. [OWNER] Name stays "AfriTrade Connect". Agent must locate the existing logo and brand assets in the codebase and inventory them.
7. [OWNER] Must feel: trustworthy, bold, warm, industrial, agriculture, UX-inclined, standard, African-feel.
8. [OWNER] Must NOT feel: defense-project, mock, side-project, generic, AI-generated.
9. [OWNER] Audience: defense panel, testers, future investors, owner. Must feel: not over-engineered, suited to African users, top-notch design principles, NOT vibe-coded, production-ready design flow.
10. [OWNER] A logo exists (agent finds it; see 6).

## C. Inspiration

11. [OWNER] Reference platform: https://www.globalbuyersonline.com/ . Use for STRUCTURE and TRUST PATTERNS only (dual buyer/supplier entry, how-it-works steps, Trust Center + Verification Process in nav, browse by category/country, quick-filter chips, role-split footer, supplier inbox). See 11_REFERENCE_ANALYSIS.md. Do NOT copy its visual look, copy, images, or layout. [Owner approved the borrow/avoid split]
12. [OWNER] Disliked references: none stated. Agent-proposed AVOID list from the reference: auto-rotating hero carousel, dense link walls, tiny flag-icon grids, text-only list rows with no photo/price/status. [Owner approved to avoid]
13. [OWNER] User-flow and journey references exist; owner will provide them later. The reference site does not replace them.
14. [OWNER] Nothing racist or offensive; avoid stereotyped African imagery (safari/tribal clichés).

## D. Visual language

15. [OWNER] Audit existing colour tokens and theming. Change ONLY what is necessary; each change justified and approved by owner.
16. [DELEGATED] Headings: Bricolage Grotesque. Body/UI: Noto Sans (broad Latin-extended coverage for Yoruba/Hausa/Twi/Afrikaans diacritics). Money/IDs use tabular figures. Max 2 families, limited weights. Agent verifies glyph coverage of ọ ẹ ṣ ɛ ɔ in renders.
17. [OWNER] Softly rounded, "best where needed". [DELEGATED] Radius scale 8 / 12 / 16 px; pills only for badges and chips.
18. [OWNER] Balanced density.
19. [OWNER] Subtle shadows. [DELEGATED] 1px low-contrast borders plus at most two soft elevation levels.
20. [OWNER] Product photos (authentic, non-stock-corporate mood). Need a designed placeholder for products without photos.
21. [OWNER] Duotone icons. [DELEGATED] Phosphor Icons, duotone weight (free, MIT). Must be configured as shadcn's icon library in place of the default.
22. [OWNER] Slightly subtle motion. [DELEGATED] 150-250ms ease-out; honour prefers-reduced-motion.
23. [OWNER] Data display simple, not complex.

## E. Layout & navigation

24. [OWNER] Web dashboards: left sidebar; well-designed hamburger/drawer on mobile.
25. [OWNER] Admin: left sidebar; hamburger/drawer on mobile.
26. [OWNER + DELEGATED] Landing explains and converts, but is CTA-led (product not launched, built for pitching, easy navigation). Hero CTAs: Register as Buyer, Register as Supplier, Browse Marketplace. Slim explainer below.
27. [OWNER] Marketplace grid/list switchable via a very prominent icon toggle.
28. [OWNER] Order tracker: HORIZONTAL now. RULE: becomes MAP-LIKE at the first major launch (recorded in DESIGN.md and RULES section 22).

## F. Content & tone

29. [OWNER] Confident voice.
30. [OWNER] Simulated-payment label: balanced prominence (visible, not alarming).
31. [DELEGATED] Primary price (supplier currency) bold. Converted line smaller and muted: "≈ NGN 15,000 (indicative)" with an info tooltip/tap-sheet: "Billed in supplier currency. Converted price is indicative only."
32. [DELEGATED to agent] Agent drafts all UI copy, taglines, empty states and microcopy in the confident voice. Mark every drafted line [AGENT DRAFT] for owner review. No fake statistics, testimonials, partner logos, or claims beyond what the product does (manual KYB, simulated payments, curated logistics).

## G. Priorities (generation and review order)

33. [OWNER] Landing, onboarding (register/login), marketplace, orders, admin Users section screens (Buyers, Suppliers, KYB, KYC placeholder). Then everything else.
34. [OWNER] Hero components: order tracker, KYB review, onboarding.

## H. Technical

35. [OWNER] CHANGE to Tailwind + shadcn/ui (tokens as CSS variables mapped into the Tailwind theme; rule updates per RULES block).
36. [OWNER] Google Fonts and free icon sets only.
37. [DELEGATED] WCAG 2.2 AA; 44px touch targets; min 16px body text; visible focus; status never by colour alone (icon + label); contrast verified in light AND dark; built for low-end Android and slow networks (skeleton loaders, light imagery).

## I. Stitch workflow

38. [OWNER undecided -> DELEGATED] 2 variants for landing, onboarding, marketplace, order tracker; 1 variant for everything else.
39. [OWNER] Generate ALL screens in one pass, then owner modifies.
40. [OWNER] Output HTML/CSS for easy manual editing.
41. [OWNER] Wants the port-to-code prompt (Prompt 3).

## J. Extra

42. [OWNER] None for now.
