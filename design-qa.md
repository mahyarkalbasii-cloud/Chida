# CHIDA T8-UX3 — Design QA

## Sources

- Current-home reference: `/tmp/codex-remote-attachments/01a04d6b-bfef-7c20-a3e2-b0ed09dfae9f/450EFA93-D4CC-4A5A-A18D-5C43014F77DC/1-Photo-1.jpg`
- Quick-action style reference: `/tmp/codex-remote-attachments/01a04d6b-bfef-7c20-a3e2-b0ed09dfae9f/450EFA93-D4CC-4A5A-A18D-5C43014F77DC/2-Photo-2.jpg`
- Implementation capture: `design-qa/t8-ux3-home-390x844.png`
- Combined comparison input used for the final visual judgment: `/tmp/chida-t8-ux3-comparison.png`

## Target state

- Viewport: `390 × 844`
- Theme: Dark-only
- Route/state: empty builder chat home, existing active project, keyboard closed
- Required visible changes: project-name-only controls, one horizontally draggable Quick Action rail, complete honest actions, custom CHIDA assistant mark, and larger readable home typography.

## Comparison history

1. Source review identified four priority mismatches: repeated project labels and arrows, a two-column action grid, a generic sparkle mark, and undersized home copy.
2. Implementation pass replaced those surfaces while preserving the existing composer, project context, Dark palette, IRANYekanX, and copper accent.
3. The current-home reference, Grok rail reference, and `390 × 844` implementation were inspected together in the combined comparison input. The result keeps CHIDA's own visual language while adopting only the intended compact icon-and-label rail pattern.

## Final findings

- Typography: header project name `15px`, supporting home copy `14px`, Quick Action labels `12px`; no cramped or clipped visible Persian text.
- Layout: root horizontal overflow is `0`; the Quick Action rail owns `918px` of intentional internal overflow and initializes at the RTL start.
- Behavior: project space and task-center routes open and return correctly; the rail realigns after return and drag does not leak overflow to the page.
- Image quality: the generated assistant mark loads from the app-owned `/chida/` asset path, remains sharp at the rendered size, and does not reuse the generic sparkle/robot/chat/helmet motifs.
- Accessibility: both project controls remain semantic buttons with explicit accessible names; focus styling and practical tap targets are preserved.
- Console: no warning or error was emitted during the browser pass.

## Final result

passed
