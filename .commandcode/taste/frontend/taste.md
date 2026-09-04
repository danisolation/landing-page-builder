# Taste — Frontend (Next.js)

- Prefers TanStack Query for all API data fetching, caching, and refetch/invalidation. Confidence: 0.9
- Dislikes overly long files — wants components split into small, focused files following current common FE structure. Confidence: 0.85
- Cares about visual polish of both internal (admin) and public UI; judges results visually and reports layout issues such as misalignment. Confidence: 0.8
- Vietnamese is the default locale; the Vietnamese UI must contain no leftover English strings — all user-facing text goes through i18n. Confidence: 0.8
- For FE work the agent may implement directly, but must explain the changes afterwards. Confidence: 0.7
- Previews (full-page and per-section) should show complete content without internal scrolling, adapt to each screen size ("phù hợp với từng màn hình"), and be centered at normal width — the per-section preview should mirror the full-page preview experience. Confidence: 0.7
- Values a visual/WYSIWYG editing experience — live canvas with click-to-edit, drag-drop section reordering, inline text editing, and real-time preview are core features, not nice-to-haves. Confidence: 0.8
- Prefers simple, conventional UI design meant for ordinary users — dislikes "bizarre" or overly complex interfaces; when the user called the editor "bizarre and the UX is terrible," the agent acknowledged it was overengineered and offered to simplify. Confidence: 0.85
- Layouts must be analyzed for feasibility before implementation — text overflow, clipping, and cutoff issues should be caught during design, not reported by the user after the fact; the user expects the agent to think through how layouts actually work visually. Confidence: 0.8
- Prefers standardized, cohesive section layouts with consistent spacing/typography tokens for a professional look; existing visual effects should be preserved while standardizing layout. Confidence: 0.8
