# Project #8 views — setup guide

Produced under [#120](https://github.com/Jared-Godar/audio-lab/issues/120). How to build and
maintain the view set on the audio-lab GitHub Project (Project #8,
`https://github.com/users/Jared-Godar/projects/8`, id `PVT_kwHOAQEwMM4BehsR`), modelled on the
`ecg_anomaly_detection` project.

Two paths, because GitHub splits the capability:

- **Scriptable** (`gh api graphql`) — create/update/delete a view, set its **name**, **layout**,
  **filter**, and **visible fields**. Additive and reversible (delete a view to undo).
- **Manual UI** — **board column grouping, table group-by, roadmap dates, and Insights charts
  have no API** and must be clicked. Those click paths are documented below and were **verified
  against the live UI on 2026-07-31**.

The audio-lab set was built with the scriptable path for the view shells and filters; the
group-bys, roadmap dates, and the Insights chart are the manual steps left for the maintainer
(§5). This is the state as of #120.

## 1. Prerequisites

- `gh` authenticated with the `project` scope (`gh auth status` shows `project`; an interactive
  login has it). The `gh` CLI (v2.96) has **no** `view` subcommand — `gh project` covers
  create/edit/field/item only — so views go through raw GraphQL.
- The project id and field ids, read once:

```bash
gh api graphql -f query='
query { node(id: "PVT_kwHOAQEwMM4BehsR") { ... on ProjectV2 {
  title number url
  fields(first: 50) { nodes {
    ... on ProjectV2FieldCommon { id name dataType }
    ... on ProjectV2SingleSelectField { id name options { id name } }
  } }
  views(first: 40) { nodes { id name layout filter } }
} } }'
```

For Project #8 the fields that matter (read 2026-07-31):

| Field | dataType | id |
| --- | --- | --- |
| Status | SINGLE_SELECT (Todo/In Progress/Done) | `PVTF_lAHOAQEwMM4BehsRzhY7Mmw` |
| Milestone | MILESTONE | `PVTF_lAHOAQEwMM4BehsRzhY7MnE` |
| Title | TITLE | `PVTF_lAHOAQEwMM4BehsRzhY7Mmg` |
| Assignees | ASSIGNEES | `PVTF_lAHOAQEwMM4BehsRzhY7Mmo` |

**There is no `area` or `priority` custom field.** Those axes live as **labels**
(`area: pipeline`, `priority: high`), so priority/area views filter on labels, not fields (§3.3).

## 2. What is scriptable vs. UI-only

Verified by GraphQL schema introspection (2026-07-31). The mutations
`createProjectV2View` / `updateProjectV2View` / `deleteProjectV2View` exist, but their inputs are
narrow:

| Capability | Mechanism |
| --- | --- |
| Create a view (name, layout) | `createProjectV2View` — API |
| Set visible fields | `configuration.visibleFieldIds` on create **or** update — API |
| Set a filter | `filter` on **`updateProjectV2View` only** — API |
| Change layout of an existing view | `layout` on update — API |
| Delete a view | `deleteProjectV2View` — API |
| **Board column grouping / table group-by** | **UI only** (`View → Column by` / `Group by`) |
| **Sort, swimlanes, slice-by** | **UI only** |
| **Roadmap date fields, zoom, markers** | **UI only** (`View → Dates`) |
| **Insights charts** | **UI only** (Insights tab) |

The one correction worth stating plainly: `filter` is **not** a `createProjectV2View` input — the
create call takes only `name`, `layout`, and `configuration`. A filtered view is therefore a
**two-step** create-then-update. (`CreateProjectV2ViewInput` has no `filter` field; only
`UpdateProjectV2ViewInput` does.)

## 3. Scriptable path — the commands

Layout enum values are `BOARD_LAYOUT`, `TABLE_LAYOUT`, `ROADMAP_LAYOUT`.

### 3.1 Create a view shell

```bash
gh api graphql -f query='
mutation($p: ID!, $n: String!) {
  createProjectV2View(input: {projectId: $p, name: $n, layout: TABLE_LAYOUT}) {
    projectV2View { id name layout }
  }
}' -f p="PVT_kwHOAQEwMM4BehsR" -f n="High priority"
```

### 3.2 Set a filter (or layout, or fields) on an existing view

`filter` is update-only. Pass the filter as a variable so the inner quotes survive the shell:

```bash
gh api graphql -f query='
mutation($id: ID!, $f: String!) {
  updateProjectV2View(input: {viewId: $id, filter: $f}) {
    projectV2View { id name layout filter }
  }
}' -f id="<VIEW_ID>" -f f='label:"priority: high"'
```

`configuration.visibleFieldIds` takes a list of field ids to restrict/order the columns; omit it
to keep the default field set.

### 3.3 Filter syntax

GitHub Projects filter strings. Because area/priority are labels, use `label:`:

- High priority — `label:"priority: high"`
- Per area — `label:"area: pipeline"` (quote the whole value; the label name contains a space)

### 3.4 Undo

```bash
gh api graphql -f query='mutation($id: ID!) {
  deleteProjectV2View(input: {viewId: $id}) { clientMutationId }
}' -f id="<VIEW_ID>"
```

### 3.5 The audio-lab set, reproducibly

The default "View 1" was **updated** into the Board (rather than left as a stray table); the rest
were **created**. Area views were created then filtered in a loop:

```bash
PROJECT="PVT_kwHOAQEwMM4BehsR"

# Board: repurpose the default view -> BOARD layout (group-by set in the UI, §5)
gh api graphql -f query='mutation($id: ID!) {
  updateProjectV2View(input: {viewId: $id, name: "Board", layout: BOARD_LAYOUT}) {
    projectV2View { id name layout } } }' -f id="<default view id>"

# High priority (TABLE), then filter
# By milestone (TABLE; group-by in the UI), Roadmap (ROADMAP; dates in the UI)
gh api graphql -f query='mutation($p: ID!, $n: String!, $l: ProjectV2ViewLayout!) {
  createProjectV2View(input: {projectId: $p, name: $n, layout: $l}) {
    projectV2View { id } } }' -f p="$PROJECT" -f n="By milestone" -f l=TABLE_LAYOUT

# Per-area views: create + filter, one per in-use area label
for area in governance episodes infra pipeline voices brand web marketing; do
  id=$(gh api graphql -f query='mutation($p: ID!, $n: String!) {
    createProjectV2View(input: {projectId: $p, name: $n, layout: TABLE_LAYOUT}) {
      projectV2View { id } } }' -f p="$PROJECT" -f n="Area: $area" \
    --jq '.data.createProjectV2View.projectV2View.id')
  gh api graphql -f query='mutation($id: ID!, $f: String!) {
    updateProjectV2View(input: {viewId: $id, filter: $f}) {
      projectV2View { name filter } } }' -f id="$id" -f f="label:\"area: $area\""
done
```

All eight `area:` labels are in use (3–35 issues each as of 2026-07-31), so no per-area view is
empty. Add or drop one by re-running the create+filter pair, or `deleteProjectV2View`.

### 3.6 Confirm — a 200 is not a result

Read the views back and check `name`, `layout`, and `filter` actually persisted:

```bash
gh api graphql -f query='query { node(id: "PVT_kwHOAQEwMM4BehsR") { ... on ProjectV2 {
  views(first: 40) { nodes { id name layout filter } } } } }'
```

## 4. Manual UI path — click paths (verified live 2026-07-31)

Open the project, then the target view's tab. The **View** control is the gear button at the
right of the filter bar; it opens the view-configuration menu (its top row toggles layout
**Table / Board / Roadmap**).

- **Board column grouping** (Board view): **View → Column by → Status**. A fresh `BOARD_LAYOUT`
  view already lands on Status columns (Todo / In Progress / Done); this is where to confirm or
  change it.
- **Table group-by** (By milestone view): **View → Group by → Milestone**. Group-by defaults to
  `none`, so this is a required manual step for a grouped table.
- **Roadmap dates** (Roadmap view): **View → Dates → pick the date field(s)**. Project #8 has no
  custom start/target date fields, so choose an existing date pair (e.g. Created → Closed) or the
  Milestone dates; the roadmap shows an empty timeline until a date field is set. `View → Zoom
  level` and `View → Markers` tune the timeline.
- **Visible fields / order** (any view): **View → Fields** (the UI equivalent of
  `configuration.visibleFieldIds`).
- **Sort**: **View → Sort by**.
- **Insights chart**: the **Insights** button (top-right of the project) opens the Insights page.
  A default **Burn up** chart is present; **+ New chart** (left sidebar, under *Custom charts*)
  adds one. In a chart's **Configure** panel set the filter (e.g. `is:issue`) and the axes — for a
  status breakdown, a **Column** chart with **X-axis = Status**. Charts are project-level, not
  per-view.

After any UI change, the "save"/"discard" prompt on the view tab persists it to that view for
everyone; there is no separate publish step.

## 5. Current state and the manual steps that remain

Created via the scriptable path (12 views on Project #8):

| View | Layout | Filter |
| --- | --- | --- |
| Board | BOARD | — (columns by Status) |
| High priority | TABLE | `label:"priority: high"` |
| By milestone | TABLE | — (group-by Milestone: UI) |
| Roadmap | ROADMAP | — (dates: UI) |
| Area: governance … marketing (8) | TABLE | `label:"area: <name>"` |

Left for the maintainer to click (no API exists — §4):

1. **By milestone** — `View → Group by → Milestone`.
2. **Roadmap** — `View → Dates → …` (choose a date field; add a custom date field first if
   precise start/target scheduling is wanted).
3. **Status Insights chart** — Insights → New chart → Configure (Column, X-axis = Status).

The Board's Status grouping needs no action — it lands there by default; open
`View → Column by` only to confirm.

## 6. Reference

- Model: the `ecg_anomaly_detection` project (fields, label mapping, and the
  `scripts/github/` automation that populates and validates project items). Its setup predates
  GitHub's view-mutation API, so this guide adds the now-scriptable view layer on top of that
  same project shape.
- API capabilities in §2 were confirmed by GraphQL schema introspection and by creating the live
  view set, both 2026-07-31; the §4 click paths were verified against the live Project #8 UI the
  same day.
