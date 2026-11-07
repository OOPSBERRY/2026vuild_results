# 고요한 나의 책상 — Design System

## 1. Atmosphere & Identity

`고요한 나의 책상`은 밤색 호두나무 책상 앞에 조용히 앉아 생각을 고르는 개인 서재다. 기억에 남을 장면은 차가운 앱 패널이 아니라, 충분히 밝은 월넛 결 위에서 검은 가죽·아이보리 종이·절제된 금속 황동이 만나는 순간이다. 2026-11-07의 제공 시안은 재질과 조명 참고로만 사용하며, 실제 Three.js 책상·램프·머그·식물의 링크 매핑이 화면 구조를 결정한다. 손글씨, 찢어진 종이, 빈티지 장식, 파랑/남색은 사용하지 않는다.

## 2. Color

### Palette

| Role | Token | Value | Usage |
| --- | --- | --- | --- |
| Night | `--espresso-950` | `#100D0B` | page and scene edge |
| Espresso | `--espresso-900` | `#1B120F` | scene base, dark leather |
| Walnut | `--walnut-700` | `#36251D` | wood, elevated UI |
| Walnut light | `--walnut-500` | `#6A4935` | secondary material detail |
| Ivory | `--ivory-100` | `#F3EBDD` | primary text, paper |
| Ivory muted | `--ivory-300` | `#D7CCBA` | supporting copy |
| Brass | `--brass-500` | `#B99A63` | focus, selected state, metal accents |
| Brass bright | `--brass-300` | `#D6BD83` | restrained hover highlight |
| Burgundy | `--burgundy-600` | `#8A2F2A` | bookmark and tiny non-UI material cue |
| Ink | `--ink-900` | `#201713` | notebook text |

### Rules

- Blue and navy are prohibited in scene materials, window light, books, and UI.
- Brass denotes interactive focus or real metal; it is not a broad gradient or glow treatment.
- Burgundy appears only as a physical bookmark or one small textile/material detail.

## 3. Typography

### Scale

| Level | Size | Weight | Line height | Usage |
| --- | --- | --- | --- | --- |
| Display | `clamp(1.75rem, 3vw, 2.65rem)` | 650 | 1.15 | title |
| Title | `clamp(1.05rem, 1.55vw, 1.25rem)` | 600 | 1.4 | object labels |
| Body | `0.95rem` | 450 | 1.65 | intro support copy |
| Label | `0.78rem` | 600 | 1.45 | eyebrow and button guidance |

### Font Stack

- Primary: `"Pretendard Variable", "Pretendard", "SUIT", "Noto Sans KR", system-ui, sans-serif`
- The scene-drawn notebook uses the same sans stack, never a handwriting face.
- Korean labels use `word-break: keep-all` and no forced orphaned particles.

## 4. Spacing & Layout

Base unit: 4px. Standard tokens: `--space-2: 8px`, `--space-3: 12px`, `--space-4: 16px`, `--space-5: 20px`, `--space-6: 24px`, `--space-8: 32px`, `--space-10: 40px`.

- The canvas owns the viewport and physical desk metaphor. The DOM labels real Three.js hotspots, provides the entry control, and supplies accessible in-app detail menus after a physical object is selected.
- Header inset: `clamp(16px, 3vw, 48px)`; mobile labels remain at least 44px touch height.
- 375px: header becomes compact and labels remain directly tied to their projected objects; 768px/1280px retain the same scene rather than inventing a dashboard.

## 5. Components

### Study header

- **Structure:** `<header><p>eyebrow</p><h1>title</h1><p>support</p></header>`
- **States:** static, intro-deemphasized, seated-readable.
- **Accessibility:** text is real DOM; support copy remains readable over the canvas.
- **Motion:** opacity/transform only during the seat transition.

### Object hotspot

- **Structure:** real `<button class="obj"><span class="obj-label">` projected above one scene object.
- **States:** default, hover, focus-visible, selected (`aria-pressed=true`).
- **Accessibility:** keyboard focus, persistent selected state, 44px+ touch target, named by link data.
- **Motion:** 160ms transform/color feedback; scene object lift is meaningful feedback.

### Seat control

- **Structure:** `<button class="sit-btn">`.
- **States:** default, hover, active, focus-visible, hidden after seated.
- **Accessibility:** obvious focus ring, keyboard activated, reduced-motion path.
- **Motion:** physical press via transform only; does not pulse decoratively.

### Notebook action

- **Structure:** an actual `<a id="nbOpen">` precisely projected over the rendered notebook action.
- **States:** absent for blank URL, focus-visible, valid link.
- **Accessibility:** blank URLs expose no dead action; supplied URL opens with `noopener`.

### Tool detail panel

- **Structure:** a real right-side `role="dialog"` with textless generated object art, live Korean copy/actions, and a return-to-desk control.
- **Variants:** classic book list → selected `어린 왕자` detail; mood chooser persisted locally; one-minute rest timer; one-line journal persisted locally.
- **States:** closed, open, book-list, book-detail, local choice/saved, blank-link disabled, valid configured link.
- **Accessibility:** modal open moves focus to close; Escape/backdrop/return controls close it; background desk controls become inert; art has concise alt text where it communicates content.
- **Motion:** backdrop opacity and panel transform only; tool panels do not replace the live 3D room.

## 6. Motion & Interaction

| Type | Duration | Easing | Usage |
| --- | --- | --- | --- |
| Micro | 160ms | `cubic-bezier(.2,.8,.2,1)` | label/CTA feedback |
| Seat | 2800ms | scene cubic easing | camera/chair narrative |
| Atmosphere | continuous | low-amplitude sine | camera sway and steam only |

- Animation is limited to the existing seating story and feedback that identifies a clickable physical object.
- `prefers-reduced-motion` removes CSS animation and scene camera transition resolves without prolonged motion.

## 7. Depth & Surface

Strategy: **mixed material depth**. The canvas provides real light/shadow, roughness, metalness, and texture; DOM overlays only use tonal translucent backplates where contrast needs protection.

- Desk: supplied walnut albedo map, non-metallic roughness near `0.46`, physically lit with warm direct light and ivory bounce.
- Notebook: ivory paper, black leather desk pad, brass spiral, burgundy ribbon; text is canvas-rendered onto the page material.
- Lamp: near-black enamel shade plus brass stem, with an actual warm point light and restrained halo.
- Chair: black leather-like material with a specular edge, not pale woven fabric.

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- WCAG 2.2 AA target for DOM overlays: ivory text receives a dark translucent backing; brass is never the only state signal. Contrast is verified in the real browser before handoff.
- All actions are keyboard reachable and show a 3px ivory/brass focus treatment.
- `prefers-reduced-motion` is honoured by CSS and Three.js seating progress.
- Labels use Korean sans, `lang="ko"`, and natural CJK line breaks.

### Accepted Debt

| Item | Location | Why accepted | Owner / Exit |
| --- | --- | --- | --- |
| Scene canvas has no full semantic 3D representation | `scene.js` | Real controls are mirrored by named DOM buttons, which provide the operable interaction layer. | Follow-up only if an audio/scene-description feature is added. |
| Decorative tool art requires textual context | `assets/tool-*.png` | The four supplied images are image-only mood artwork. | Each panel supplies live title, lead, and action; meaningful book cover has alt text. |
