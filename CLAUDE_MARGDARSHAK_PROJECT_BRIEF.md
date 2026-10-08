# MargDarshak: Claude Project Brief and UI Redesign Prompt

## How to use this file

Upload this file to Claude with the MargDarshak project ZIP, or paste its contents as the project context. Claude should read this document before changing code.

The goal is to redesign and improve the existing MargDarshak application without breaking its working backend, routes, authentication, API contracts, or user workflows.

---

# Master instruction for Claude

You are working on **MargDarshak**, an AI-powered resume analyzer and career guidance web application. First inspect the existing project structure and implementation. Then redesign the frontend UI and UX as an original, polished product experience while preserving the existing functionality and backend contracts.

Do not replace working functionality with static mockups. Do not rewrite the backend unless a change is strictly necessary. Reuse the existing React components, routes, API utilities, Supabase authentication, and analysis data structures wherever possible.

The redesign should be cohesive across the landing page, authentication screens, upload flow, analysis progress screen, dashboard, profile, skills, job roles, skill gaps, courses, live jobs, NLP pipeline, and chatbot.

---

# Product overview

MargDarshak helps students, job seekers, and career switchers understand what their resume says about them and decide what to do next.

The product:

1. Accepts a PDF resume.
2. Extracts text from the resume.
3. Preprocesses the text using NLP.
4. Extracts personal information and entities.
5. Identifies skills and groups them by category.
6. Classifies suitable job roles.
7. Analyzes missing required and preferred skills.
8. Recommends courses for priority skill gaps.
9. Finds relevant job listings.
10. Provides a contextual career chatbot.

Primary product promise:

> Turn your resume into a clear career direction.

Suggested main headline:

> Your next move, mapped clearly.

Suggested supporting message:

> Upload your resume to discover your strengths, suitable career paths, skill gaps, recommended courses, and relevant job opportunities.

The product must be honest: recommendations are guidance, not guarantees of employment.

---

# Existing technical architecture

## Frontend

- React 18
- Vite
- React Router
- CSS Modules plus global CSS
- Framer Motion is installed
- lucide-react is installed
- Axios is used for API requests
- Supabase is used for authentication

Frontend location:

```text
frontend/
  index.html
  package.json
  vite.config.js
  src/
    App.jsx
    index.css
    main.jsx
    components/
    lib/
    pages/
    utils/
```

## Backend

- Python
- FastAPI
- Uvicorn
- pdfminer.six
- NLTK
- spaCy
- scikit-learn
- NumPy
- Transformers and Torch
- Adzuna job API integration

Backend location:

```text
backend/
  main.py
  requirements.txt
  pipeline/
  chatbot/
  data/
```

Local ports:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

---

# Current routes and screens

The existing route structure must remain functional:

- `/` - public landing page
- `/login` - Supabase email/password login
- `/signup` - Supabase email/password signup
- `/dashboard` - protected analysis dashboard

Unauthenticated users should be redirected to `/login` when accessing `/dashboard`. Authenticated users should be able to reach the dashboard after login.

The dashboard currently contains these views:

- Profile
- Skills
- Job Roles
- Skill Gaps
- Courses
- Live Jobs
- NLP Pipeline
- Career Chatbot

Preserve these capabilities even if the visual layout and navigation are substantially improved.

---

# Existing frontend responsibilities

## `LandingPage.jsx`

Public marketing and product introduction page. It currently contains a hero, creator section, and about/pipeline explanation.

Redesign it into a product-focused, conversion-friendly landing page that lets a user understand the product and start resume analysis immediately.

## `UploadPage.jsx`

Current behavior:

- Accepts one PDF file.
- Maximum file size is 5 MB.
- Shows upload and processing states.
- Calls `POST /analyze`.
- Displays visible processing stages.

Preserve all validation, loading, success, and error states.

## `DashboardPage.jsx`

Current behavior:

- Displays the analysis result.
- Shows summary information.
- Shows name/location information.
- Routes between dashboard panels.

Do not remove the ability to move between all analysis sections.

## `ProfilePanel.jsx`

Displays extracted contact information, extraction methods, summary counts, and role matches.

## `SkillsPanel.jsx`

Displays extracted skills grouped by category and supports category filtering.

## `JobRolesPanel.jsx`

Displays ranked job roles, match scores, O*NET codes, descriptions, and matched required/preferred skills.

## `GapPanel.jsx`

Displays readiness percentage, missing required skills, missing preferred skills, and priority.

## `CoursesPanel.jsx`

Displays priority skills, role-specific recommendations, and external course links.

## `JobsPanel.jsx`

Displays live or mock jobs, role/location search, sorting, relevance/date information, and external application links.

## `PipelinePanel.jsx`

Displays expandable raw outputs from the analysis pipeline.

This panel is important for transparency. Keep the ability to inspect how the analysis was produced.

## `Chatbot.jsx`

Floating or contextual chatbot UI. It supports suggested questions, conversation history, and backend intent responses using the current analysis.

Keep the chatbot connected to the existing API rather than replacing it with a static design.

---

# Existing API contracts: do not break these

The frontend currently communicates with the backend through `frontend/src/utils/api.js`.

## Health check

```http
GET /health
```

Response:

```json
{
  "status": "ok",
  "service": "MargDarshak API"
}
```

## Resume analysis

```http
POST /analyze
Content-Type: multipart/form-data
Field: file
```

The file must be a PDF no larger than 5 MB.

Response shape:

```json
{
  "status": "success",
  "filename": "resume.pdf",
  "pipeline": {
    "step1_extraction": {},
    "step2_preprocessing": {},
    "step3_entities": {},
    "step4_skills": {},
    "step5_job_roles": {},
    "step6_gaps": {},
    "step7_courses": {},
    "step8_jobs": {}
  },
  "entities": {},
  "skills": {},
  "job_roles": {},
  "gaps": {},
  "courses": {},
  "jobs": {}
}
```

Preserve the flattened keys and nested `pipeline` keys because dashboard panels depend on them.

## Jobs

```http
POST /jobs
Content-Type: application/json
```

Request:

```json
{
  "job_title": "Software Engineer",
  "location": "Bengaluru"
}
```

Response generally contains:

```json
{
  "jobs": [],
  "total_found": 0,
  "query": {},
  "status": "success"
}
```

## Chatbot

```http
POST /chat
Content-Type: application/json
```

Request:

```json
{
  "message": "What should I learn next?",
  "analysis": {},
  "history": []
}
```

Response:

```json
{
  "response": "...",
  "intent": "...",
  "confidence": null,
  "method": "..."
}
```

Keep this request shape and response handling.

---

# Backend behavior to represent accurately

The backend pipeline currently includes:

1. PDF text extraction with `pdfminer.six`.
2. Seven-stage NLTK preprocessing.
3. Regex and spaCy-based entity extraction.
4. Exact word-boundary skill matching against the skills database.
5. Weighted skill-vector job-role classification using cosine similarity.
6. Set-subtraction skill-gap analysis.
7. Curated course lookup with fallback course URLs.
8. Adzuna job matching, with a mock listing when credentials are unavailable.
9. A local chatbot using an intent classifier and keyword fallback.

Do not claim that the current system uses fuzzy matching, retrieval-augmented generation, or human review unless the implementation is actually updated to do so.

The visible pipeline has eight analysis stages. The chatbot is a separate ninth product capability. Do not show contradictory numbering without explaining this clearly.

---

# UI and UX redesign direction

Create an original design inspired by premium editorial product websites and high-quality agency websites such as the supplied Framer references. Use the references for visual principles only, not for copied content, branding, imagery, or exact layouts.

## Desired personality

MargDarshak should feel:

- Intelligent but approachable
- Premium but usable
- Ambitious but trustworthy
- Data-informed but human
- Clear rather than overwhelming
- Encouraging without sounding childish
- Transparent about AI limitations

## Visual language

Use a strong editorial system across the entire product:

- Deep charcoal or near-black foundation for high-impact sections.
- Warm ivory, paper, or soft neutral surfaces for readable content areas.
- One energetic accent color such as coral, orange, electric pink, or acid lime.
- Strong contrast and clear section boundaries.
- Expressive display typography for major headings.
- Highly readable sans-serif typography for application content.
- Uppercase labels for metadata, categories, states, and navigation context.
- Large numerals for pipeline stages and workflow steps.
- Thin borders, subtle dividers, and restrained shadows.
- Sharp or lightly rounded components; avoid excessive pill-shaped containers.
- Generous whitespace and intentional asymmetry.
- Product UI previews rather than abstract decorative shapes.

The current app uses a dark charcoal, orange, gold, and light-panel direction with Bebas Neue and DM Sans. Preserve the useful personality if appropriate, but refine it into a more coherent design system. Do not introduce a random new palette or unrelated visual language.

Avoid:

- Purple-on-white default SaaS styling
- Excessive glassmorphism
- Identical card grids everywhere
- Decorative gradients that reduce readability
- Oversized headings inside dense dashboard components
- Unexplained AI scores
- Fake statistics or testimonials
- Visual clutter
- Unnecessary onboarding steps

---

# Design system requirements

Create reusable design tokens for:

- Backgrounds
- Surface colors
- Text colors
- Accent colors
- Semantic success, warning, and error colors
- Border colors
- Spacing
- Typography scale
- Border radius
- Shadows
- Motion timing

Use existing CSS Modules and global CSS patterns where practical. Avoid creating many one-off styles.

Create reusable components for:

- Buttons
- Icon buttons
- Navigation
- Tabs
- Breadcrumbs or context labels
- Status badges
- Skill tags
- Progress indicators
- Metric blocks
- Tables and responsive data rows
- Timeline items
- Upload zones
- Empty states
- Error states
- Loading skeletons
- Toasts
- Modals
- Tooltips
- Chat messages
- Course items
- Job items
- Role recommendation items

Use `lucide-react` icons where available. Icons must support comprehension, not decorate every element. Add accessible labels and tooltips for unfamiliar icon-only controls.

---

# Page-by-page UI requirements

## Landing page

The landing page should communicate the product within the first viewport.

Hero content:

- MargDarshak brand
- Headline: “Your next move, mapped clearly.”
- Short explanation of resume analysis and career guidance
- Primary CTA: “Analyze my resume”
- Secondary CTA: “See how it works”
- Realistic dashboard preview showing skills, role matches, gaps, courses, and jobs
- A visible hint of the next section below the fold

Recommended sections:

1. Hero
2. Product outcomes
3. Analysis process
4. Feature walkthrough
5. Trust and transparency
6. Dashboard preview
7. FAQ
8. Final upload CTA
9. Footer

Do not make the page only a generic marketing page. Show the actual product experience.

## Login and signup

Keep Supabase authentication working.

Design requirements:

- Focused form layout
- Clear field labels
- Password visibility control
- Loading state
- Validation and error state
- Accessible focus state
- Link between login and signup
- Product preview or editorial context panel
- Responsive mobile layout

## Upload page

Make resume upload the central product action.

Include:

- Large drag-and-drop zone
- Browse button
- PDF-only explanation
- 5 MB limit explanation
- Selected file state
- Replace and remove actions
- Upload progress
- Processing state
- Error state
- Retry action
- Clear “Start analysis” action

Use a large workflow label such as `01 / UPLOAD` and a statement such as:

> Start with the experience you already have.

Do not fake analysis progress. Show actual stage progress where available and otherwise use honest processing language.

## Analysis progress

Represent the analysis as a transparent journey.

Each stage should show:

- Large step number
- Name
- Short explanation
- Pending, active, complete, or failed state
- Relevant output preview when available
- Expandable details
- Clear next action

Make errors recoverable and preserve the selected file context.

## Dashboard overview

The dashboard should feel like a career intelligence command center, not a generic admin template.

Include:

- Greeting and analyzed resume status
- Recommended career direction
- Profile completeness or extraction summary
- Top skills
- Skill-gap summary
- Recommended courses
- Job-match preview
- Recent analysis activity
- Career chatbot entry point
- Analyze another resume action

Use a mixture of full-width editorial insight areas, compact metrics, progress indicators, tables, tags, and timelines. Do not put every element inside the same type of card.

## Profile

Show:

- Name and location
- Contact information
- Professional summary
- Education
- Experience
- Projects
- Certifications
- Extracted skills
- Extraction method or confidence where available

Allow the user to distinguish extracted information from inferred information. If editing is not implemented, do not present controls that appear to save changes.

## Skills

Show:

- Skills grouped by category
- Category filtering
- Skill count
- Match details or evidence
- Confirmed versus inferred distinction where supported
- Search if useful
- Empty and no-results states

Use tags, bars, labels, and compact sections without making the view visually noisy.

## Job roles

Show recommended roles as an explainable ranked list.

Each role should include:

- Rank
- Role title
- Match score
- Short description
- O*NET code when available
- Matching required skills
- Matching preferred skills
- Missing skills
- Why the match exists
- Next action

Do not represent a similarity score as a guarantee.

## Skill gaps

Show:

- Readiness percentage
- Target role selector
- Current strengths
- Required skills
- Missing required skills
- Missing preferred skills
- Priority level
- Related courses
- Progress state

Use a clear current-state to target-state visual narrative.

## Courses

Show course recommendations with:

- Skill being developed
- Course title
- Provider
- Difficulty
- Estimated duration when available
- Priority
- External link
- Save or open action

Include filters or grouping when supported by current data. Make external links clear.

## Live jobs

Show jobs in a scannable comparison layout.

Include:

- Job title
- Company
- Location
- Remote or onsite status when available
- Match or relevance information
- Salary when available
- Date posted
- Matching skills when available
- Search by role and location
- Sort by relevance or date
- External application link
- Empty, loading, mock-data, and error states

Clearly label mock listings when live credentials are unavailable.

## NLP pipeline

Make the pipeline panel visually impressive but technically honest.

Allow users to inspect the raw outputs of the analysis stages. Use expandable sections, readable JSON-like output, summary labels, and stage explanations.

This screen is a trust feature, not merely a developer screen.

## Chatbot

Make the chatbot contextual and connected to the actual analysis.

Suggested prompts:

- What are my strongest skills?
- Why was I matched to this role?
- What should I learn next?
- Explain my skill gaps.
- Which course should I start with?
- How can I improve my resume?

Include:

- Conversation history
- Loading state
- Error state
- Empty state
- Suggested questions
- Accessible message input
- Clear relationship to the current analysis
- Navigation links to relevant dashboard sections when appropriate

Do not create a generic chatbot disconnected from the resume data.

---

# Interaction and motion

Use motion sparingly and purposefully:

- Page-load reveal for major sections
- Staggered pipeline stage appearance
- Smooth progress transitions
- Tab transitions
- Expand/collapse animations
- Hover states for rows and primary actions
- Animated skill and match indicators
- Subtle dashboard preview transitions

Respect `prefers-reduced-motion`. Motion must never delay task completion, hide important data, or make the interface difficult to scan.

---

# Responsive behavior

Support desktop, tablet, and mobile.

On mobile:

- Collapse navigation into a clear menu.
- Stack editorial sections vertically.
- Keep headings readable and prevent overflow.
- Turn wide tables into stacked rows or controlled horizontal scroll.
- Keep dashboard previews readable.
- Use touch-friendly buttons and controls.
- Preserve visible step numbers and status labels.
- Keep chatbot input accessible.
- Prevent overlap between headings, buttons, labels, and data.

Test at narrow mobile widths and wide desktop widths.

---

# Accessibility and content rules

Use semantic HTML and accessible interaction patterns.

Required:

- Keyboard navigation
- Visible focus styles
- Proper form labels
- Accessible buttons and dialogs
- Meaningful alt text
- Strong color contrast
- Do not rely on color alone for status
- Reduced-motion support
- Useful empty states
- Useful error messages
- Preserved form input after errors

Copy should be concise, direct, and human. Avoid corporate jargon and unsupported claims.

Never say that MargDarshak guarantees a job. Use language such as “recommended,” “estimated match,” “potential fit,” or “suggested next step.”

---

# Data and state safety requirements

The analysis currently lives in React memory. A page refresh can lose the current report. Do not accidentally introduce navigation or reload behavior that loses analysis context.

Preserve:

- Authentication guards
- Logout behavior
- Upload validation
- Loading states
- Error handling
- Dashboard tab IDs and navigation
- External course links
- External job links
- Chatbot history behavior
- API request payloads
- API response keys

If you add persistence, do so deliberately and explain the change. Do not silently change the backend contract.

---

# Environment variables

The application may use:

```text
VITE_API_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
ADZUNA_APP_ID
ADZUNA_APP_KEY
```

Do not expose secrets in frontend code or commit environment values.

---

# Implementation workflow for Claude

Follow this order:

1. Inspect the existing repository and understand the current components.
2. Run the frontend and backend if possible.
3. Establish the design system and global tokens.
4. Redesign the shared navigation, buttons, typography, surfaces, and layout primitives.
5. Redesign the landing page.
6. Redesign authentication and upload flows.
7. Redesign the dashboard shell and navigation.
8. Redesign each dashboard panel while preserving its data behavior.
9. Improve responsive layouts.
10. Add purposeful motion and accessibility improvements.
11. Run the frontend build.
12. Test the backend health endpoint and major frontend routes.
13. Report changed files, remaining limitations, and validation results.

Make focused edits. Avoid unrelated refactors.

---

# Definition of done

The redesign is complete when:

- The frontend starts successfully with the existing project command.
- The backend API still starts successfully.
- Landing, login, signup, upload, dashboard, and all dashboard panels remain reachable.
- Resume upload still sends a PDF to `POST /analyze`.
- Dashboard panels still consume the existing analysis response.
- Job search still sends the existing `/jobs` request.
- Chatbot still sends the existing `/chat` request.
- Authentication behavior remains intact.
- Loading, empty, success, and error states are designed.
- Mobile layouts do not overlap or overflow.
- The UI has one coherent visual system.
- AI results are explainable and not presented as guarantees.
- The app feels like a polished, premium career intelligence product rather than a generic dashboard.

At the end, provide:

- A concise summary of the redesign.
- Files changed.
- Commands used for validation.
- Any limitations or follow-up work that remains.
