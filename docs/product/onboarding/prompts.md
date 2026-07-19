# Image-generation briefs

These concepts were generated with the built-in image-generation tool on 2026-07-18. They are discussion artifacts; typography, commands, provider details, and logos must be verified before implementation.

## Concept A — Guided wizard

```text
Use case: ui-mockup
Asset type: desktop app onboarding storyboard board
Primary request: Create a low-fidelity 6-screen storyboard for onboarding a first-time T3 Code user who may have no coding harness installed. Show the journey: welcome, choose harness, install and verify, authenticate, open or create project, send first prompt.
Subject: Six desktop app wireframe screens arranged as a clean 3 by 2 contact sheet. Direction A is a calm guided wizard with a persistent left progress rail: 1 Welcome, 2 Coding agent, 3 Connect, 4 Project, 5 First task. The selected example is Codex, with other harness choices Claude, OpenCode, Cursor, and Grok.
Style/medium: intentionally low-fi product design wireframe, grayscale charcoal surfaces, thin light borders, one restrained cobalt blue accent, DM Sans-like typography, simple geometric placeholder icons, pencil-sketch annotation arrows around the frames. Clearly a practical macOS desktop product, not a marketing landing page and not polished concept art.
Composition/framing: 16:9 landscape design board, six legible frames with generous gutters, small caption above each frame. The app window resembles T3 Code: narrow left navigation, roomy main pane, rounded composer at bottom where relevant.
Text (verbatim): "Welcome to T3 Code", "Choose your coding agent", "Set up Codex", "Connect your account", "Choose a project", "Send your first task", "Continue", "Already installed? Check again"
Constraints: preserve the six-step sequence; installation screen must show detection status and a one-click primary setup action plus a copyable manual command; authentication screen must offer a browser sign-in and API key alternative; project screen must offer Open a folder, Clone from Git, and Create something new; final screen must show a large prompt composer plus 3 example prompt chips. Use names rather than copied brand logos. Keep text sparse and readable.
Avoid: glossy gradients, neon cyberpunk, decorative illustrations, dense settings UI, fake code everywhere, mobile screens, watermark.
```

## Concept B — Setup companion

```text
Use case: ui-mockup
Asset type: desktop app onboarding storyboard board
Primary request: Create a low-fidelity onboarding concept for T3 Code where setup feels like a conversational companion instead of a conventional form wizard. It must guide a novice from no coding harness installed to sending a first prompt.
Subject: Five wide desktop states arranged left-to-right as a storyboard strip. Each state uses a split layout: a friendly T3 Code conversation on the left and a live setup card on the right. Sequence: greeting and goal, choose Codex/Claude/OpenCode/Cursor/Grok, Codex installing with transparent progress log, browser authentication waiting then verified, project selected and first prompt ready.
Style/medium: rough UX wireframe, charcoal and near-black UI, off-white type, subtle cobalt blue action color, thin border cards, hand-drawn callouts and rough gray placeholder strokes. Productive and trustworthy, not cute mascot UI. DM Sans-like typography.
Composition/framing: 16:9 landscape design exploration board, five desktop frames with numbered captions and arrows. Show a compact progress breadcrumb across the top: Agent, Account, Project, First task. The assistant conversation uses short plain-language bubbles; technical details live in a collapsible panel labeled Details.
Text (verbatim): "Let’s get you ready to build", "Which coding agent do you want to use?", "Install Codex", "Waiting for sign-in…", "Connected", "Pick a project", "Try your first task", "Show details"
Constraints: installation must expose what T3 Code is doing without making the terminal the main experience; show a recovery action if detection fails; user can go back or switch harness without losing progress; final state includes a project name, a large composer, and example prompts. Use harness names but no copied logos. Sparse readable text.
Avoid: chatbot mascot, purple gradients, terminal-first experience, tiny unreadable labels, polished marketing visuals, mobile screens, watermark.
```

## Concept C — Readiness launchpad

```text
Use case: ui-mockup
Asset type: desktop app onboarding product concept board
Primary request: Design a low-fidelity "first-run launchpad" for T3 Code that avoids a modal step-by-step wizard. The whole path from coding agent setup to first prompt stays visible as a simple readiness checklist on one home screen.
Subject: One large primary desktop screen plus four smaller zoomed detail frames. The main screen says Start building with three readiness sections: Coding agent, Project, First task. Coding agent shows harness tiles Codex, Claude, OpenCode, Cursor, Grok with status dots Missing, Ready, Sign in. Project section offers Open folder, Clone repository, Start from a template. First task section is locked until the first two are ready, then opens into a prominent composer with prompt suggestions. Detail frames show install sheet, sign-in sheet, project picker, and unlocked first task.
Style/medium: lo-fi UX mockup, dark neutral T3 Code desktop aesthetic, minimal cobalt blue accent, fine borders, rounded cards, DM Sans-like typography, rough red pencil notes in the margins describing UX intent. Serious friendly product UI, accessible and calm.
Composition/framing: 16:9 landscape board. Main screen fills the left two thirds; four small detail zooms stack on the right. Include a tiny existing-user escape link near the top.
Text (verbatim): "Start building", "1 · Coding agent", "2 · Project", "3 · First task", "Set up", "Ready", "Open folder", "Clone repository", "Start from a template", "I’ve used T3 Code before", "What would you like to make?"
Constraints: status should be visually obvious without color alone; no account creation step for T3 Code itself; installation and auth are scoped to the chosen harness; show that multiple harnesses can be added later; the first prompt is the success moment. Use harness names but no copied logos. Keep text legible and sparse.
Avoid: dashboard analytics, excessive cards, gradients, illustrations, mobile layouts, tiny text, watermark.
```

## Concept B2 — Companion after activation

```text
Use case: ui-mockup
Asset type: desktop app post-onboarding lifecycle storyboard board
Input images: Image 1 is a visual continuity reference for the earlier T3 Code setup-companion concept; create a new follow-on board, do not edit or reproduce it exactly.
Primary request: Evolve the conversational setup-companion idea after the user has sent and completed a first task. Show how T3 Code continues the journey toward advanced features without front-loading setup or interrupting active work.
Subject: A four-state desktop storyboard. State 1: the normal T3 Code thread after the first useful response, with a small inline completion card saying the essentials are ready and no modal. State 2: at a natural pause, a slim optional companion drawer titled "Make T3 Code yours" shows exactly one recommended next capability, T3 Connect, with Later and Explore all; other features are only small secondary links. State 3: focused T3 Connect value-first onboarding showing this Mac, a phone, and a remote machine, explaining work from another device and agent activity notifications, then a simple setup action. State 4: a contextual model/account picker showing Codex · Personal and Codex · Work, plus "Add coding account", explaining that separate work and personal accounts are first-class.
Style/medium: rough low-fidelity UX storyboard matching Image 1, dark charcoal T3 Code desktop UI, off-white text, restrained cobalt blue action color, thin borders, hand-drawn gray annotations and arrows. Serious, calm, product-focused, DM Sans-like typography. The companion is a subtle guide, not a mascot or permanent chat transcript.
Composition/framing: 16:9 landscape design board with four large numbered desktop states from left to right and concise handwritten rationale below. Maintain normal project/thread chrome after activation. Show the companion surfacing only after a completed response and at a quiet moment, never while an agent is running.
Text (verbatim): "You’re up and running", "Keep building", "Make T3 Code yours", "Pick up from any device", "Set up T3 Connect", "Later", "Explore all", "Coding accounts", "Codex · Personal", "Codex · Work", "Add coding account"
Constraints: The first task success is not followed by a blocking upsell. Show at most one prominent recommendation at a time. Advanced features must read as optional enhancements, not incomplete onboarding. T3 Connect has a value explanation before switches or permissions. Multi-account language must avoid the term provider instance in primary UI. Include dismiss and return-later affordances. Use generic geometric icons and names, not copied logos.
Avoid: success confetti, modal immediately after first prompt, multiple competing banners, gamified progress, chatbot mascot, purple gradients, dense terminal output, mobile-only layouts, watermark.
```

## Concept C2 — Launchpad after activation

```text
Use case: ui-mockup
Asset type: desktop app post-onboarding product concept board
Input images: Image 1 is a visual continuity reference for the earlier T3 Code readiness-launchpad concept; create a new evolved board, do not edit or reproduce it exactly.
Primary request: Evolve the T3 Code readiness launchpad after the user sends their first task. The launchpad should become a durable but low-pressure setup hub that highlights T3 Connect, remote environments, and multiple coding accounts over time without making optional capabilities feel like unfinished mandatory onboarding.
Subject: One large post-activation T3 Code home/setup-hub screen plus four smaller lifecycle/detail frames. Main screen: normal product home titled "Your T3 Code", a compact collapsed row "Essentials complete", a single large "Next for you" card for T3 Connect, and two quiet management sections: Coding accounts with Codex · Personal ready and Add coding account, and Environments with This Mac ready and Add environment. Smaller frames: 1 first task sent and launchpad yielding to normal thread, 2 setup hub later reached from the sidebar, 3 T3 Connect setup with Publish this environment and Publish agent activity, 4 add coding account sheet with Codex Personal and Work labels and optional accent markers.
Style/medium: low-fi UX mockup matching Image 1, dark neutral T3 Code desktop aesthetic, fine borders, rounded cards, DM Sans-like typography, minimal cobalt blue accent, rough red pencil product notes. Calm, trustworthy, shippable structure rather than concept art.
Composition/framing: 16:9 landscape board. The large setup hub fills about two thirds; four smaller detail frames stack on the right. Handwritten annotations explain prominence decay, one recommendation at a time, contextual entry points, and optional features never reducing completion below 100 percent.
Text (verbatim): "Your T3 Code", "Essentials complete", "Next for you", "Pick up from any device", "Set up T3 Connect", "Coding accounts", "Codex · Personal", "Add coding account", "Environments", "This Mac", "Add environment", "Not now"
Constraints: After the first task, the user is fully onboarded. Do not show a partially complete 1-of-3 meter for optional features. The initial launchpad should automatically yield to the normal thread. Preserve a persistent, user-invoked setup hub from sidebar or settings. Show exactly one prominent optional recommendation. T3 Connect and remote environments are clearly related but distinguish account sign-in, publishing this environment, and connecting other environments. Multi-account is first-class but secondary until the user opens the account/model picker or setup hub. Use names and generic icons, not copied logos.
Avoid: mandatory cloud account, blocking post-success modal, dashboard analytics, streaks or achievements, excessive cards, gradients, illustrations, tiny text, watermark.
```

## Coach — Across app starts

```text
Use case: ui-mockup
Asset type: desktop app product-coach lifecycle storyboard
Input images: Image 1 is the current T3 Code desktop visual-language reference. Image 2 is the post-activation companion concept reference. Create a new board; do not edit either image.
Primary request: Show a smart bottom-left T3 Code coach recommending exactly one useful optional action per app start. Demonstrate four different app launches for the same user over time, never more than one coach popup in a launch.
Subject: Four full desktop T3 Code windows in a 2 by 2 storyboard. Each window is a normal coding thread with one small coach popup anchored immediately above Settings at the bottom-left of the sidebar. Launch 1 recommends T3 Connect because it is available and not configured. Launch 2 recommends a second Codex account after the user has explicitly used the account picker. Launch 3 recommends adding another environment after T3 Connect is ready but only this Mac exists. Launch 4 recommends publishing agent activity after a mobile client exists but activity publishing is off. Handwritten notes explain the eligibility signal for each launch.
Style/medium: low-fidelity but legible product UI board, matching T3 Code's dark charcoal surfaces, fine neutral borders, off-white DM Sans-like type, restrained cobalt blue actions, subtle hand-drawn annotations. Calm and trustworthy, not marketing art.
Composition/framing: 16:9 landscape contact sheet, four app windows with enough zoom to read the bottom-left coach cards. Each popup is about 280 pixels wide, floats above the Settings row without covering the composer, has a small geometric icon, short eyebrow, title, two-line benefit, primary action, Later, close, and a quiet "Why this?" link.
Text (verbatim): "Pick up from any device", "Set up T3 Connect", "Keep work and personal separate", "Add Codex account", "Bring in another computer", "Add environment", "Know when work finishes", "Publish activity", "Later", "Why this?"
Constraints: exactly one coach popup per window; never show a popup while the agent is actively streaming or awaiting approval; no progress counter; optional actions must not look like incomplete onboarding; dismiss and snooze are obvious; popup placement stays consistent; recommendations use only visible product state and explicit UI interactions. Keep text sparse and readable.
Avoid: multiple toasts, stacked banners, center modals, mascot, confetti, gamification, notification spam, analytics dashboard, gradients, watermark.
```

## Coach — Popup treatments

```text
Use case: ui-mockup
Asset type: desktop app coach-popup component exploration board
Input images: Image 1 is the current T3 Code desktop visual-language reference. Image 2 is the post-activation companion concept reference. Create a new component exploration; do not edit either image.
Primary request: Explore three visual treatments for a bottom-left smart coach popup in T3 Code and identify a recommended treatment.
Subject: One large close-up of the recommended popup plus three smaller in-context variants. Recommended treatment is a quiet floating card above the Settings row: eyebrow "Suggested for your setup", close button, simple connection icon, title "Pick up from any device", two-line description, primary button "Set up T3 Connect", secondary text button "Later", and small "Why this?" disclosure. Variant A is the recommended full card. Variant B is a compact one-line peek that expands on click. Variant C is visually integrated into the sidebar as an inline card. Include tiny lifecycle sketches: waits until the agent is idle, appears once in the app start, Later snoozes it, close suppresses that recommendation, action opens the real setup flow.
Style/medium: low-fi UX component sheet, dark neutral T3 Code styling, crisp thin borders, restrained cobalt blue, off-white text, DM Sans-like type, red pencil annotations naming hierarchy and interaction rules.
Composition/framing: 16:9 landscape board with a large popup anatomy diagram on the left and three smaller app-context crops on the right. Use spacious layout and readable labels. The popup should feel like product chrome, not a system notification.
Text (verbatim): "Suggested for your setup", "Pick up from any device", "Work from another device and stay informed about agent activity.", "Set up T3 Connect", "Later", "Why this?", "One suggestion per app start"
Constraints: show explicit close and snooze semantics; coach never covers the composer or approval UI; only the content changes between recommendations, not placement or interaction; accessibility includes icon plus label, strong focus states, and no reliance on color alone.
Avoid: macOS notification style, speech bubbles, mascot, huge popup, glassmorphism, gradients, glowing neon, tiny unreadable text, watermark.
```

## Coach — Recommendation catalog

```text
Use case: ui-mockup
Asset type: smart product-coach recommendation catalog
Input images: Image 1 is the current T3 Code desktop visual-language reference. Image 2 is the post-activation companion concept reference. Create a new recommendation catalog; do not edit either image.
Primary request: Create a lo-fi catalog of six possible T3 Code bottom-left coach popups, showing the exact product copy and the safe eligibility state that makes each suggestion relevant. This is a design-system board, not six simultaneous popups.
Subject: Six isolated coach-card specimens in a clean 3 by 2 grid. Card 1 T3 Connect: "Pick up from any device" and action "Set up T3 Connect". Card 2 multi-account: "Keep work and personal separate" and action "Add Codex account". Card 3 remote environment: "Bring in another computer" and action "Add environment". Card 4 agent activity: "Know when work finishes" and action "Publish activity". Card 5 worktrees: "Keep changes isolated" and action "Try a worktree". Card 6 multiple agents: "Use the right agent for the job" and action "Add coding agent". Each card has Later, close, Why this?, a simple monochrome icon, and a handwritten note outside the card describing a non-sensitive eligibility condition.
Style/medium: low-fi product UI catalog matching T3 Code dark charcoal cards, fine neutral borders, off-white type, restrained cobalt action button, DM Sans-like typography, rough pencil annotations around the grid.
Composition/framing: 16:9 landscape design board, six large readable cards with generous gutters and title "One useful suggestion per app start". Cards share identical component anatomy so only icon, copy, and action change.
Text (verbatim): "One useful suggestion per app start", "Pick up from any device", "Set up T3 Connect", "Keep work and personal separate", "Add Codex account", "Bring in another computer", "Add environment", "Know when work finishes", "Publish activity", "Keep changes isolated", "Try a worktree", "Use the right agent for the job", "Add coding agent", "Later", "Why this?"
Constraints: clearly state this is a catalog and only one card appears in the real app; no recommendation may depend on prompts, code contents, repository names, or filesystem paths; eligibility notes may use only capability state or explicit UI interactions; sparse readable copy.
Avoid: rendering all cards inside one app window, marketing banners, achievements, points, progress streaks, multiple CTAs per card, copied provider logos, gradients, watermark.
```
