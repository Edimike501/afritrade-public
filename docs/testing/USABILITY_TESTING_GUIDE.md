# AfriTrade Connect — Usability Testing Protocol & Evaluation Guide

## 1. Executive Summary & Capstone Success Criteria

As defined in the AfriTrade Connect capstone proposal and `SCOPE.md`, the platform must achieve:
- **Testing with 30 target users** across representative trade personas.
- **At least 80% positive usability score** measured via the industry-standard **System Usability Scale (SUS)** (target score $\ge 80/100$, qualifying as "Grade A / Excellent").

This guide establishes the standardized testing methodology, task-oriented test scripts, quantitative scoring mechanics, and observation templates required to execute and document this evaluation.

---

## 2. Participant Cohort Demographics (30 Users)

The 30-participant cohort is partitioned into three key user groups reflecting the three-sided MVP architecture:

| Persona Group | Sample Size ($N$) | Profile & Qualifications | Primary Focus Areas |
| :--- | :--- | :--- | :--- |
| **Wholesale Buyers** | 12 | Importers, retailers, and FMCG procurement leads in Nigeria, South Africa, and Ghana. | Marketplace discovery, currency filtering, multi-currency cart isolation, instant simulated payment, horizontal order tracker. |
| **Commodity Suppliers** | 12 | Agricultural exporters, cooperative managers, and regional commodity producers. | Onboarding & KYB profile submission, catalog lot creation, read-only order monitoring, revenue dashboard per currency. |
| **Platform Administrators** | 6 | Trade facilitators, operations managers, and compliance officers. | Operations Control Tower, KYB approval/rejection queue, logistics partner assignment, shipment status state transitions. |

---

## 3. Test Session Protocol & Environment Setup

### 3.1 Pre-Session Checklist
1. **Environment**: Local Docker stack or staging preview deployed with simulated mode enabled (`PAYMENTS_MODE=simulated`).
2. **Database State**: Seeded database containing $\ge 100$ authentic cross-border commodity lots across Nigeria (NGN), South Africa (ZAR), and Ghana (GHS).
3. **Hardware / Browser**: Desktop or laptop running Chrome, Safari, or Firefox with screen recording and audio transcription enabled (with participant consent).
4. **Moderator Role**: Non-leading facilitation; observe think-aloud verbal feedback without assisting unless the participant encounters a blocking issue.

---

## 4. Scenario Task Scripts

### Task 1: Buyer Discovery & Checkout Flow (Participants: 12 Buyers)
- **Objective**: Discover a regional product lot, place an order, execute simulated checkout, and monitor shipment progress.
- **Action Steps**:
  1. Navigate to the `/marketplace` directory.
  2. Use filter controls to filter by Country (e.g., Nigeria) and Category (e.g., Agriculture).
  3. Select a product lot (e.g., *Sorghum Grain Lot*) and review the unit price, minimum order quantity, and supplier credentials.
  4. Initiate checkout for 5 units in the listing's native currency (e.g., NGN).
  5. Complete simulated payment and verify that payment is immediately marked as confirmed.
  6. Navigate to `/orders/[id]` and review the horizontal order tracker status.
- **Success Metrics**:
  - Task Completion Rate ($\ge 95\%$).
  - Time on Task ($< 3$ minutes).
  - Subjective difficulty rating on a 1–5 scale.

### Task 2: Supplier Onboarding & Catalog Listing (Participants: 12 Suppliers)
- **Objective**: Complete KYB business verification details, list a new wholesale lot, and inspect incoming order status.
- **Action Steps**:
  1. Register a new account under the `SUPPLIER` role.
  2. Navigate to `/kyb` and submit company registration number, tax ID, and business country.
  3. Await simulated admin approval, then navigate to `/products/new`.
  4. Create a wholesale lot specifying title, description, category, unit price in minor units, and minimum order quantity.
  5. Visit the Supplier Dashboard (`/dashboard`) and inspect active lots and incoming order history (verifying orders are read-only).
- **Success Metrics**:
  - Task Completion Rate ($\ge 90\%$).
  - Zero accidental attempt to mutate order status directly (enforcing the supplier read-only order principle).

### Task 3: Admin Operations & Fulfillment Oversight (Participants: 6 Administrators)
- **Objective**: Review pending KYB compliance, assign logistics partners, and advance shipment milestones.
- **Action Steps**:
  1. Log into the Operations Control Tower (`apps/admin`).
  2. Open the KYB Verification Queue (`/kyb`), review pending submission details, and approve the supplier.
  3. Navigate to Orders Oversight (`/orders`), select an order in `PAYMENT_CONFIRMED` status.
  4. Assign an active logistics partner from the curated partner directory.
  5. Progress the shipment milestone sequentially from `LOGISTICS_ASSIGNED` $\to$ `PICKED_UP` $\to$ `IN_TRANSIT` $\to$ `CUSTOMS` $\to$ `DELIVERED`.
  6. Return to `/` and inspect the Order Lifecycle Pipeline bar and status breakdown.
- **Success Metrics**:
  - 100% compliance with valid transition states (no illegal state jumps).
  - Task Completion Rate ($100\%$).

---

## 5. System Usability Scale (SUS) Standard Instrument

Following task completion, every participant completes the standard 10-item System Usability Scale (Brooke, 1996) using a 5-point Likert scale (1 = Strongly Disagree, 5 = Strongly Agree).

### Questionnaire Items
1. *I think that I would like to use this platform frequently.*
2. *I found the platform unnecessarily complex.*
3. *I thought the platform was easy to use.*
4. *I think that I would need the support of a technical person to be able to use this platform.*
5. *I found the various functions in this platform were well integrated.*
6. *I thought there was too much inconsistency in this platform.*
7. *I would imagine that most people would learn to use this platform very quickly.*
8. *I found the platform very cumbersome to use.*
9. *I felt very confident using the platform.*
10. *I needed to learn a lot of things before I could get going with this platform.*

---

## 6. SUS Scoring Methodology & Interpretation

### Mathematical Calculation
For each participant response $R_i \in \{1, 2, 3, 4, 5\}$:
- For **odd-numbered items** ($1, 3, 5, 7, 9$): Score contribution $S_i = R_i - 1$.
- For **even-numbered items** ($2, 4, 6, 8, 10$): Score contribution $S_i = 5 - R_i$.
- **Composite Participant Score**:
  $$SUS = \left(\sum_{i=1}^{10} S_i\right) \times 2.5$$

### Grading & Benchmark Scale
- **Target Capstone Benchmark**: $\ge 80.0$ (Grade A / Excellent).
- **Industry Average Benchmark**: $68.0$ (Grade C / Acceptable).

| SUS Range | Grade | Adjective Rating | Usability Status |
| :--- | :--- | :--- | :--- |
| **80.3 – 100** | **A+ / A** | **Excellent** | **Exceeds Capstone Target** |
| 68.0 – 80.2 | B / C | Good / Average | Below target; minor refactoring required |
| 51.0 – 67.9 | D | Poor / Marginal | High user friction; action required |
| 0.0 – 50.9 | F | Unacceptable | Critical workflow failures |

---

## 7. Usability Evaluation Reporting Template

```markdown
### Session ID: USAB-[01..30]
- **Participant Persona**: [Buyer | Supplier | Admin]
- **Operating System / Browser**: [macOS / Chrome 124]
- **Task 1 Completion**: [Pass | Fail] (Duration: mm:ss)
- **Task 2 Completion**: [Pass | Fail] (Duration: mm:ss)
- **Task 3 Completion**: [Pass | Fail] (Duration: mm:ss)

#### SUS Responses:
| Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 | Q9 | Q10 | Computed SUS |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:---:|:------------:|
| 5  | 1  | 5  | 1  | 4  | 1  | 5  | 1  | 5  | 1   | 95.0         |

#### Qualitative Notes & Feedback:
- What worked well:
- Friction points encountered:
- Direct participant quotes:
```
