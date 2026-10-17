# Stitch MCP Tools Specification & Generation Constraints

> **Authority & Source**: Tool JSON schemas located at `~/.gemini/antigravity/mcp/stitch/*.json` and `design/stitch/ANSWERS.md`.  
> **Status**: Read-only reference pack for Google Stitch orchestration. No design decisions invented.

---

## 1. Overview of Stitch MCP Tools

The Stitch MCP server exposes **15 lazy-loaded tools** designed to create and manage UI design projects, design systems, individual screens, screen variations, and direct design markdown specifications.

| Tool Name | Primary Purpose | Required Parameters | Constraints / Notes |
| :--- | :--- | :--- | :--- |
| `create_project` | Creates a new Stitch container project | *None* (`title` optional) | Returns project ID and resource name |
| `get_project` | Retrieves project details & screen instances | `name` (`projects/{project}`) | Fetches screen instance IDs needed for editing |
| `delete_project` | Permanently deletes a Stitch project | `name` (`projects/{project}`) | Destructive; requires explicit user confirmation |
| `list_projects` | Lists all accessible Stitch projects | *None* (`filter` optional) | Supports AIP-160 filter (`view=owned`, `view=shared`) |
| `list_screens` | Lists all screens within a project | `projectId` | Returns screen IDs and basic metadata |
| `get_screen` | Retrieves screen details, code & screenshot | `name` (`projects/{p}/screens/{s}`) | Used to poll when generations time out |
| `generate_screen_from_text` | Generates a single screen from a text prompt | `projectId`, `prompt` | **1 screen per call**. Takes 1–3 min. Do not retry |
| `edit_screens` | Modifies existing screens via prompt | `projectId`, `selectedScreenIds`, `prompt` | Takes array of screen IDs; modifies in place |
| `generate_variants` | Generates 1–5 design variations of screen(s) | `projectId`, `selectedScreenIds`, `prompt`, `variantOptions` | Requires existing screen IDs. Explores aspects |
| `upload_design_md` | Uploads raw base64 `DESIGN.md` | `projectId`, `designMdBase64` | Must be valid UTF-8; followed by create DS |
| `create_design_system_from_design_md` | Creates design system from uploaded markdown | `projectId`, `selectedScreenInstance` | Links uploaded markdown to project styling |
| `create_design_system` | Defines programmatic design tokens | `designSystem` (`displayName`, `theme`) | Sets colors, typography, roundness, spacing |
| `update_design_system` | Updates existing design system tokens | `name`, `projectId`, `designSystem` | Modifies theme and re-applies tokens |
| `list_design_systems` | Lists design systems for a project or global | *None* (`projectId` optional) | If empty, returns global assets |
| `apply_design_system` | Applies design system tokens to screens | `projectId`, `selectedScreenInstances`, `assetId` | Maps design system tokens onto existing screens |

---

## 2. Exhaustive Tool Schemas & Parameter Limits

### 2.1 `create_project`
- **Description**: Creates a new Stitch container for UI designs and frontend code.
- **Parameters**:
  - `title` (*string, optional*): Display title for the project (e.g., `"AfriTrade Connect - MVP Design System"`).
- **Output**: Project resource object with `name` format `projects/{projectId}`.

### 2.2 `get_project`
- **Description**: Retrieves full metadata of a specific Stitch project, including all active screen instances.
- **Parameters**:
  - `name` (*string, required*): Resource name format: `projects/{project}` (e.g., `projects/4044680601076201931`).
- **Output**: Project details, screen list, and `screenInstances` (each with `id` and `sourceScreen`).

### 2.3 `delete_project`
- **Description**: Deletes a project. Irreversible.
- **Parameters**:
  - `name` (*string, required*): Resource name format: `projects/{project}`.
- **Safety**: Schema instructions mandate manual confirmation ("yes"/"no") before invocation.

### 2.4 `list_projects`
- **Description**: Lists Stitch projects accessible to the user.
- **Parameters**:
  - `filter` (*string, optional*): AIP-160 filter. Supports `view=owned` (default) and `view=shared`.

### 2.5 `list_screens`
- **Description**: Lists all screens contained within a specific project.
- **Parameters**:
  - `projectId` (*string, required*): The numerical/alphanumeric project ID without `projects/` prefix.

### 2.6 `get_screen`
- **Description**: Retrieves screen details (HTML/CSS code, component breakdown, image URLs).
- **Parameters**:
  - `name` (*string, required*): Format: `projects/{project}/screens/{screen}`.
- **Key Operational Role**: Primary polling target when `generate_screen_from_text` exceeds gateway timeout thresholds.

### 2.7 `generate_screen_from_text`
- **Description**: Generates a new UI screen within a project from a natural language prompt.
- **Parameters**:
  - `projectId` (*string, required*): Project ID without prefix.
  - `prompt` (*string, required*): Detailed text prompt describing the screen, layout, components, data, and visual tone.
  - `deviceType` (*string, optional*): Supported enums:
    - `DEVICE_TYPE_UNSPECIFIED`
    - `MOBILE` (Phone viewport, ~375–412px width)
    - `DESKTOP` (Laptop/desktop viewport, ~1280–1440px width)
    - `TABLET` (Tablet viewport, ~768–1024px width)
    - `AGNOSTIC` (Fluid layout not tied to device)
  - `modelId` (*string, optional*):
    - `MODEL_ID_UNSPECIFIED`
    - `GEMINI_3_8_FLASH`
    - `GEMINI_3_5_FLASH_LITE`
  - `designSystem` (*string, optional*): Asset resource ID (e.g., `assets/15996705518239280238`). If omitted on the first screen, Stitch auto-generates a design system. For subsequent screens, setting this enforces visual consistency.
- **Output**:
  - Screen object containing rendered HTML/CSS, screenshots, and `output_components` suggestions.
- **Operational Rules from Schema**:
  - "This action can take a few minutes to complete. Please be patient. DO NOT RETRY."
  - "If the tool fails with a timeout, don't retry. Instead, try to get the screen with `get_screen` method every 30 seconds for up to 10 times before giving up."
  - "If the tool call fails due to connection error, the generation process may still succeed."

### 2.8 `edit_screens`
- **Description**: Edits existing screens within a project using an instruction prompt.
- **Parameters**:
  - `projectId` (*string, required*): Project ID.
  - `selectedScreenIds` (*array of strings, required*): Array of screen IDs to modify (without `screens/` prefix).
  - `prompt` (*string, required*): Natural language instructions specifying modifications.
  - `deviceType` (*string, optional*): Same enums as generation.
  - `modelId` (*string, optional*): Generation model.

### 2.9 `generate_variants`
- **Description**: Generates alternate design directions for existing screens.
- **Parameters**:
  - `projectId` (*string, required*): Project ID.
  - `selectedScreenIds` (*array of strings, required*): Target screen IDs to branch from.
  - `prompt` (*string, required*): Creative direction for the variations.
  - `variantOptions` (*object, required*):
    - `variantCount` (*integer, optional*): Range `1` to `5`. Default: `3`.
    - `creativeRange` (*string, optional*):
      - `REFINE`: Subtle refinements closely adhering to original.
      - `EXPLORE`: Balanced exploration (default).
      - `REIMAGINE`: Radical explorations fundamentally challenging the original layout.
    - `aspects` (*array of strings, optional*): Specific focus areas:
      - `LAYOUT`: Arrangement of elements on the screen.
      - `COLOR_SCHEME`: Color palette and contrast.
      - `IMAGES`: Photography and graphic mood.
      - `TEXT_FONT`: Typography and pairings.
      - `TEXT_CONTENT`: Copy, labels, and hierarchy.
  - `deviceType` (*string, optional*): Viewport profile.
  - `modelId` (*string, optional*): Target model.

### 2.10 `upload_design_md` & `create_design_system_from_design_md`
- **Description**: Ingests an existing markdown specification (`DESIGN.md`) into Stitch to construct a unified design system.
- **Parameters**:
  - `upload_design_md`:
    - `projectId` (*string, required*)
    - `designMdBase64` (*string, required*): Base64-encoded UTF-8 markdown (`base64 -w 0 DESIGN.md`).
  - `create_design_system_from_design_md`:
    - `projectId` (*string, required*)
    - `selectedScreenInstance` (*object, required*): `{ id: string, sourceScreen: string }`
    - `deviceType` (*string, optional*)

### 2.11 `create_design_system` & `update_design_system`
- **Description**: Programmatically creates or updates design system tokens.
- **Parameters**:
  - `displayName` (*string, required*): Name of design system.
  - `theme` (*object, required*):
    - `headlineFont` (*enum, required*): Supported Google Fonts include `BRICOLAGE_GROTESQUE`, `NOTO_SANS`, `INTER`, `MANROPE`, `PLUS_JAKARTA_SANS`, `SPACE_GROTESK`, `OUTFIT`, `RUBIK`, `DM_SANS`, etc.
    - `bodyFont` (*enum, required*): Supported Google Fonts include `NOTO_SANS`, `INTER`, `PUBLIC_SANS`, `ROBOTO_FLEX`, etc.
    - `labelFont` (*enum, optional*): Font for tags, badges, and metadata.
    - `colorMode` (*enum, required*): `LIGHT`, `DARK`, or `COLOR_MODE_UNSPECIFIED`.
    - `customColor` (*string, required*): Hex primary/seed color (e.g. `"#0f6b4f"`).
    - `overridePrimaryColor`, `overrideSecondaryColor`, `overrideTertiaryColor`, `overrideNeutralColor` (*string, optional*): Hex overrides.
    - `colorVariant` (*enum, optional*): `MONOCHROME`, `NEUTRAL`, `TONAL_SPOT`, `VIBRANT`, `EXPRESSIVE`, `FIDELITY`, `CONTENT`.
    - `roundness` (*enum, required*): `ROUND_FOUR`, `ROUND_EIGHT`, `ROUND_TWELVE`, `ROUND_FULL`.
    - `spacing` (*map of string to string, optional*): Spacing scale units.
    - `typography` (*map of string to Typography object, optional*): Scale levels (`fontSize`, `lineHeight`, `letterSpacing`, `fontWeight`).
    - `designMd` (*string, optional*): Free-form markdown instructions.

### 2.12 `apply_design_system`
- **Description**: Applies an existing design system asset to selected screen instances.
- **Parameters**:
  - `projectId` (*string, required*)
  - `assetId` (*string, required*): Design system asset ID.
  - `selectedScreenInstances` (*array of `{ id, sourceScreen }`, required*)

---

## 3. Tool Constraints & Operational Impact on AfriTrade Connect

### 3.1 Strict "One Screen Per Call" API Limitation
- **Finding**: Neither `generate_screen_from_text` nor any other Stitch tool supports batch or multi-screen generation in a single RPC payload.
- **Conflict with `ANSWERS.md` Q39 ("Generate ALL screens in one pass")**:
  - While the project owner requested generating all screens in "one pass", this cannot mean a single API call because the API accepts exactly **one screen prompt per call**.
  - **Resolution**: "One pass" must be implemented as an **orchestrated pipeline** that iterates through the prioritized screen inventory, calling `generate_screen_from_text` once for each screen in order, sharing the same `projectId` and `designSystem` asset ID.

### 3.2 Latency, Gateway Timeouts & Polling
- **Finding**: Single screen generation takes between **60 and 180 seconds**.
- **Constraint**: MCP client wrappers often impose 120-second connection timeouts. If a call returns a timeout or dropped socket, **Stitch explicitly forbids retrying the generation**.
- **Execution Rule**: If a tool call times out, do NOT call `generate_screen_from_text` again. Call `get_screen` with the project screen identifier or `list_screens` on a 30-second polling interval (up to 10 attempts) to retrieve the finished screen artifact.

### 3.3 Variant Generation Dependency
- **Finding**: `generate_variants` requires pre-existing `selectedScreenIds`.
- **Impact on `ANSWERS.md` Q38 (2 variants for Hero screens, 1 for others)**:
  - Base screens (Landing, Onboarding, Marketplace, Order Tracker) must be successfully generated **first**.
  - Once their screen IDs are returned, call `generate_variants` with `variantCount = 2` (or generate 1 alternate variant) targeting those specific IDs.
  - All other secondary screens require only the single base generation (`variantCount = 1`).

### 3.4 Device Viewport Segmentation
- **Finding**: `deviceType` is an enum (`MOBILE`, `DESKTOP`, `TABLET`, `AGNOSTIC`).
- **Impact on `ANSWERS.md` Q3 & Q7**:
  - Buyer screens (Landing, Marketplace, Product Detail, Buyer Orders, Mobile Cart/Checkout) should explicitly declare `deviceType: "MOBILE"`.
  - Supplier & Admin screens (Supplier Dashboard, Product CRUD, Admin KYB Queue, Admin Order Oversight, Logistics CRUD) should declare `deviceType: "DESKTOP"`.
  - Stitch generates responsive HTML/CSS, but the initial viewport canvas matches the requested `deviceType`.

### 3.5 Design System Asset Chaining
- **Finding**: Stitch generates a design system asset ID upon the first screen generation or via `create_design_system`.
- **Constraint**: To prevent visual drift across subsequent screens (e.g., mismatched typography, different greens, irregular border radii), the `assetId` produced from the initial design system creation or first screen MUST be captured and explicitly passed via `designSystem: "assets/{assetId}"` in every subsequent `generate_screen_from_text` call.
