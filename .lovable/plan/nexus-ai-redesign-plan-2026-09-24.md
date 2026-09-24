# Nexus AI Redesign Plan

## Direction

Rebuild the experience around the selected **Integrated Minimal Hero**: one clear focal point, an embedded AI consultant, disciplined typography, and far less visual burden.

The final design will keep Nexus AI’s credible hybrid-intelligence positioning while avoiding the prototype’s generic dark-AI treatment. The visual system will use:

- **Palette:** ink, warm paper, cobalt structure, and restrained signal orange
- **Typography:** Instrument Serif for expressive brand moments; Work Sans for all interface and body text
- **Character:** editorial authority combined with the precision of a modern control surface
- **Motion:** quiet, purposeful transitions with full reduced-motion support

## 1. Rebuild the first screen

- Replace the oversized, empty hero with a compact centered composition based on the selected direction.
- Make **Nexus AI** the unmistakable first signal, followed by one concise, outcome-focused proposition.
- Embed the real AI composer directly in the hero instead of fixing it over page content.
- Place three relevant starter prompts inside the consultation area.
- Show a controlled glimpse of the next section so the page continues naturally below the fold.
- Remove the current collision between the composer, metrics, client strip, and capabilities heading.

## 2. Establish one visual system

- Consolidate page colors, surfaces, borders, shadows, type scales, spacing, and interaction states into semantic design tokens.
- Remove the mixture of editorial rules, glass panels, floating controls, pills, grid boxes, and inconsistent corner treatments.
- Create a restrained Nexus identity mark that works in navigation, empty states, and chat without a generic AI icon.
- Keep light and dark themes coherent rather than treating them as unrelated designs.
- Ensure text contrast and focus states meet WCAG 2.2 AA.

## 3. Restructure the homepage journey

Use a shorter, more engaging sequence:

```text
Navigation
  ↓
Integrated consultation hero
  ↓
Capabilities with interactive proof
  ↓
How Nexus works: AI action + human control
  ↓
Selected outcomes / credible evidence
  ↓
Trust and next consultation prompt
  ↓
Footer
```

- Replace static capability boxes with focused service entries that reveal a concrete workflow or outcome.
- Reduce decorative statistics and retain only verifiable evidence.
- Merge repetitive trust, testimonial, and proof content into fewer, stronger sections.
- Use varied full-width bands and editorial rhythm rather than a long stack of unrelated cards.
- Keep the AI consultant accessible again at natural decision points without using a persistent overlay.

## 4. Unify landing and chat

- Make the transition from homepage prompt to `/chat/:threadId` feel continuous rather than opening a separate boxed application.
- Carry the same navigation, identity, colors, typography, spacing, and composer language into chat.
- Simplify the chat shell: quieter history navigation, wider readable transcript, clearer assistant identity, and fewer borders.
- Keep assistant messages directly on the page; retain a deliberate high-contrast treatment for user messages.
- Place contextual suggestions immediately above the composer and limit them to three useful actions.
- Preserve thread history, GenUI modules, voice controls, stop/reset actions, and current chat behavior.

## 5. Make generated interfaces feel native

- Restyle service modules, comparison views, calculators, timelines, pricing, and wizard steps with the same design language.
- Remove nested-card clutter and give each module a clear primary action and information hierarchy.
- Standardize loading, empty, completed, and error states.
- Keep tool details collapsed by default while clearly showing status and result summaries.

## 6. Responsive and interaction pass

- Design the hero, embedded composer, capability interactions, chat history drawer, and modules for mobile first.
- Ensure the mobile keyboard never covers the composer and no fixed element overlaps content.
- Use stable dimensions for controls and content panels to prevent layout shifts.
- Add restrained entry, state-change, and selection motion; disable it when reduced motion is preferred.
- Verify key screens at desktop and mobile sizes, including long messages, streaming, errors, and open history.

## Scope boundaries

- This is a frontend redesign; existing conversation persistence, AI behavior, backend rules, and agent integrations remain unchanged.
- Existing factual content will be reused or tightened. No new clients, performance claims, or security certifications will be invented.
- Full voice mode and the admin dashboard remain separate future work from the earlier upgrade roadmap.

## Implementation order

1. Design tokens, typography, identity, and shared interaction styles
2. Integrated homepage hero and composer
3. Homepage section consolidation and capability interactions
4. Unified chat shell and thread navigation
5. GenUI and wizard module styling
6. Mobile, accessibility, dark-theme, and visual-regression verification
