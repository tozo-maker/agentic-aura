

# Agentic Web Agency Storefront — Phase 1 (MVO)

## Brand & Design System
- **Working name**: "Nexus AI" (placeholder — refined during build)
- **Aesthetic**: Neo-Minimalist "Liquid Glass" — warm bone background (#FDFBF7) with SVG noise texture, glassmorphic cards (`backdrop-blur-xl`, `bg-white/40`), serif + sans typography pairing
- **Motion**: Spring-based animations via Framer Motion for hover states, section reveals, and the Omni-Bar
- **Dark mode**: Not in Phase 1 — focus on the warm, premium light aesthetic

## Page Structure (Single Page App)

### 1. Hero Section
- Large editorial serif headline communicating the "Hybrid Automation" value prop
- Subtle animated gradient or refractive glass effect
- Floating Omni-Bar trigger button (+ Cmd+K shortcut)
- Clear CTA: "Talk to Our Agent" or "Scope Your Project"

### 2. Omni-Bar (Command Center)
- Modal overlay triggered by Cmd+K or floating button
- Natural language search input with smart suggestions
- Predefined intents: "Cut support costs", "Automate procurement", "Build headless store"
- Deep-links to relevant service cards and triggers "Schedule Audit" or opens the AI chat

### 3. Bento Grid — Service Catalog (4-6 cards)
- **Agentic Commerce** — Headless Medusa v2 storefronts
- **Workflow Automation** — n8n-powered business process automation
- **Generative UI** — AI-adaptive interfaces that change based on user data
- **Self-Healing Infrastructure** — Dockerized sovereign hosting with uptime monitoring
- **AI Customer Support** — Intelligent support agents with human escalation
- **Data Intelligence** — Automated reporting and business insights
- Each card: glassmorphic style, icon, short description, hover animation

### 4. Trust Protocol Section
- Interactive toggle: "AI Mode (Fast)" vs "HITL Mode (Verified)"
- Visual flowchart showing how human verification gates work
- Badges: "Human Verified", "Zero Retention", "WCAG 2.2 AA"
- Purpose: alleviate AI anxiety for enterprise buyers

### 5. Live AI Consultant (Chat)
- Slide-up chat panel (or full-screen conversational view)
- Powered by Lovable AI (Gemini Flash) via Supabase edge function
- Qualifies leads: asks about use case, budget range, timeline
- Classifies intent (Commerce vs. Automation vs. Infrastructure)
- Stores conversations and extracted lead data in Supabase
- Fallback: "Schedule a human call" option always visible

### 6. Footer
- Minimal: links to privacy policy placeholder, "Built with hybrid intelligence" tagline

## Backend (Lovable Cloud + Supabase)

### Database Tables
- **leads** — name, email, company, intent category, budget range, timeline, status
- **chat_messages** — conversation history linked to leads/sessions

### Edge Functions
- **chat** — Streams AI responses via Lovable AI Gateway (Gemini Flash), includes system prompt for lead qualification
- Lead extraction: AI extracts structured lead info from conversation and saves to DB

## Accessibility & Performance
- Omni-Bar fully keyboard navigable (Cmd+K, arrow keys, Escape)
- Semantic HTML, ARIA labels, focus management
- Optimized for Core Web Vitals (LCP < 2.5s target)
- WCAG 2.2 AA color contrast on the bone/glass palette

## What's NOT in Phase 1
- n8n webhook integration (Phase 2)
- Calendar scheduling API (Phase 2)
- Medusa v2 storefront demo (Phase 2)
- Client portal / dashboard (Phase 3)
- Dark mode

