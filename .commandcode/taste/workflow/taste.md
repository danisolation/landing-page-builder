# Taste — Workflow (git, change discipline, verification)

- Never commit or push to git unless explicitly asked; act only on the specific occasion requested ("bạn không được tự ý push nhé"). Confidence: 0.95
- Keep changes strictly within the requested scope — when asked for a narrow task like adding i18n, do not also change UI/layout; user was frustrated by unrelated UI changes ("thêm i18n thôi mà chứ có đổi UI đâu", "đừng thay đổi UI của app nha"). Confidence: 0.9
- Visually verify FE changes (e.g., run Playwright, check screenshots) before claiming completion; broken or misaligned UI is called out immediately. Confidence: 0.85
- Prefer mature libraries over hand-rolled implementations (e.g., a toast library everywhere, not alert()); from now on use the newest possible library/technology versions. Confidence: 0.85
- When (re)designing UI, research and reference beautiful modern sites (top landing pages, e.g. Linear/Vercel-class) rather than inventing styles from scratch — user explicitly asks to "research how others do it" before implementing. Confidence: 0.8
- Git author identity should be the personal account: danisolation <tranquocdungb4@gmail.com> — not a company account and not tool names like "claude". Confidence: 0.75
- Gives very brief, direct commands ("push đi", "continue", "demo 1 page có SEO đây đủ cho tôi xem") — expects the agent to understand intent without lengthy explanations or confirmations. Confidence: 0.75
- Wants to see a working demo/preview before committing to large changes — a working slice is worth more than a detailed plan for big features. Confidence: 0.7
- When fixing missing translation keys, proactively scan ALL keys used across the codebase (grep + script to compare used vs. defined) and add to ALL locales (en + vi) simultaneously — not just the one reported. Confidence: 0.75
- Editor changes (add/edit/delete sections, edit content) must only mutate local state and must NOT persist to the database until the user explicitly clicks Save — auto-saving on every action is considered a bug. Confidence: 0.75
- Expects the agent to proactively inspect its own UI/UX in a real browser (screenshots/snapshots) to find layout issues and fix them autonomously, instead of asking the user to choose a direction. Confidence: 0.85
