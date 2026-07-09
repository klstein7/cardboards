# cardboards design language: Ledger

Ledger is the app-wide design system, distilled from the board page redesign.
The canonical implementation is the board route
(`src/app/(project)/p/[projectId]/(board)`); when in doubt, match it.
The production board uses the Panorama composition: a compact command strip,
a real-data masthead, and stable weighted lanes that keep the full workflow in
view on wide screens.

## Foundations

- **Theme**: dark-locked. Near-black neutral ground (`--background: 0 0% 4%`),
  grayscale neutrals only. Tokens live in `src/styles/globals.css`.
- **Accent**: one accent, cobalt (`--primary: 215 90% 63%` in dark). Used for
  the active nav underline, counts, the single primary button per bar, hover
  emphasis, and unread/selected ticks. Destructive red is reserved for errors,
  overdue dates, and the danger zone; it is semantic, not decorative.
- **Radius**: `--radius: 0rem`. Everything is sharp. The only intentional
  curve in the app is `rounded-full` on avatars.
- **Type**: Jost (`font-sans`) for UI, the system mono stack (`font-mono`) for
  metadata, IBM Plex Mono medium (`~/components/brand/brand-font`) for the
  lowercase wordmark — the brand speaks in the register's own voice.

## Type scale

- Page/section titles: `text-2xl font-light tracking-tight`
  (`text-4xl font-extralight` for top-level page headers like Projects).
- Micro-labels (column headers, section labels):
  `text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground`.
- Metadata (counts, dates, tallies): `font-mono text-xs` or `text-[10px]`
  in `text-muted-foreground`.
- Body/entry titles: `text-sm` / `text-[13px] font-medium leading-snug`.

## Structure: ink on ground, no boxes

Content is typographic and unboxed. Do not wrap content in `Card`, filled
panels, `bg-card`, or `backdrop-blur` containers.

- Group with hairlines and whitespace: `divide-y divide-border` lists with a
  `border-t border-border` cap, `divide-x` between board columns, `border-t`
  above page sections.
- List rows are typographic entries: title line plus a mono meta line,
  separated by row padding (`py-4`/`py-5`), never by boxes.
- Board cards are entries with a 2px priority tick
  (`w-0.5 shrink-0`, colored by `--priority-*`),
  a title that shifts to `text-primary` on hover, and a mono meta line
  (priority name, labels as plain text, due date, avatar). Completed entries
  are muted with `line-through`, a border-colored tick, and a text status.
- The same tick communicates unread state in notifications (primary color).

## Board composition: Panorama

- The command strip carries project and board context, filters, members,
  settings, notifications, and the single primary action.
- The masthead below it owns the large board name, live card figures, and a
  compact stage line. It reflows cleanly when the card workbench docks.
- Lanes are edge-to-edge and fill the available width. The first two open
  stages receive slightly more width, middle stages remain steady, and a
  completed stage is narrower. These weights depend on stable position and
  stage meaning, not live card counts, so moving a card never shifts the board.
- Below `sm`, every lane becomes nearly viewport-wide with horizontal snap.
  Left and Right Arrow keys move the board by one readable lane interval.
- The selected card receives a quiet neutral surface and primary title color.
  Selection never relies on color alone; the focused entry remains keyboard
  reachable and exposes its full text content to assistive technology.

## Projects composition: Pulse

- The projects page is a live operational view rather than a grid of detached
  project cards. The command strip owns search and the single primary action.
- A compact project rail filters the page. Each project exposes its board
  count and an honest activity signal derived from its latest project or board
  update: active today, active this week, or quiet. Selection is URL-backed via
  `?project=<id>` so project and board routes can return to the same context.
- The center column is a chronological activity pulse across accessible
  projects, grouped by day. Entries use real history, actors, project context,
  and changed entity details; never invent progress, health, or status data.
- The right summary keeps one project in view with its real members and boards,
  then links directly into the project or a board. On narrow screens, the rail
  becomes horizontal and the summary follows the activity feed.

## Inputs

- Search and filter inputs on pages use hairline underlines that strengthen on
  focus, a bare transparent input, and an optional clear button. Underline
  selects use the same visual language.
- Form fields inside dialogs and settings forms keep boxed shadcn `Input`
  components with label above and description below. Underline inputs are for
  finding things; boxed inputs are for entering data.

## Controls

- One primary (`bg-primary`) action per bar, with a `Plus` and a short label
  ("New card", "New project").
- Everything secondary is a quiet ghost. Icon-only controls appear where the
  meaning is clear, and row or column actions reveal on hover while remaining
  visible on touch.
- Count indicators are small accent squares:
  `h-4 min-w-4 bg-primary px-1 font-mono text-[9px] text-primary-foreground`.
- Chips (labels, roles) are hairline mono chips:
  `border px-1.5 py-0.5 font-mono text-[10px]`; active/emphasis variant swaps
  to `border-primary text-primary`. No filled `Badge` pills.

## States

- Loading: skeletons that mirror the final layout (entry-shaped rows in
  `divide-y` lists), not spinners or boxed placeholder cards.
- Empty: a `border border-dashed border-border` region with a muted icon, a
  `font-light tracking-tight` heading, one sentence of guidance, and at most
  one call to action.
- Error: same shape with destructive text; danger zones are a `border-t`
  section headed by a destructive mono micro-label, not a red box.

## Motion

Quiet and functional only: color/opacity transitions, a 1px hover lift at
most, hover-revealed actions. No decorative animation loops or staggered
entrance effects.

Dragging is the deliberate exception because motion communicates spatial
change. The drag preview preserves the card's source width and pointer offset;
the source remains as a translucent placeholder; a 2px primary insertion line
marks the exact destination. On drop, cached order changes immediately, nearby
entries settle with a tightly damped layout spring, and the moved entry gets a
single 400ms primary-tinted settle pulse. Do not rotate previews, dim an entire
lane while saving, stack multiple completion effects, or wait for the server
before moving the entry. Reduced-motion mode keeps the state changes and
removes spatial animation.
