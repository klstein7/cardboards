# cardboards design language: Ledger

Ledger is the app-wide design system, distilled from the board page redesign.
The canonical implementation is the board route
(`src/app/(project)/p/[projectId]/(board)`); when in doubt, match it.

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
  (`absolute left-0 top-[3px] h-3.5 w-0.5`, colored by `--priority-*`),
  a title that shifts to `text-primary` on hover, and a mono meta line
  (labels as plain text, due date, avatar). Completed entries are muted with
  `line-through` and a border-colored tick.
- The same tick communicates unread state in notifications (primary color).

## Inputs

- Search and filter inputs on pages are hairline underlines: a `label` with
  `flex items-center gap-2 border-b border-border pb-1
  focus-within:border-foreground/60`, a bare transparent `input`, and an
  optional clear button. Underline `SelectTrigger`
  (`border-0 border-b px-0 pb-1`) pairs with it for sorts.
- Form fields inside dialogs and settings forms keep boxed shadcn `Input`
  components with label above and description below. Underline inputs are for
  finding things; boxed inputs are for entering data.

## Controls

- One primary (`bg-primary`) action per bar, with a `Plus` and a short label
  ("New card", "New project").
- Everything secondary is a quiet ghost: `text-muted-foreground
  hover:text-foreground`, icon-only where the meaning is clear, revealed on
  hover for row/column-level actions (`opacity-0 group-hover:opacity-100`,
  always visible on touch via `max-sm:opacity-100`).
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
