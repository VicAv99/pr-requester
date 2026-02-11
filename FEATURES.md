# Requester — GitHub Review Requests Dashboard

A personal dashboard for tracking GitHub pull request review requests, organized around CODEOWNERS-based team workflows. The app surfaces three distinct views: PRs you're directly assigned to review, PRs authored by your team, and PRs that need reviews from your team. All PR links open on GitHub — this app is a triage layer, not a code review tool.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **UI**: shadcn (Radix Nova preset), Tailwind CSS 4
- **Language**: TypeScript (strict mode)
- **Path aliases**: `@/components`, `@/ui`, `@/lib`, `@/hooks`, `@/utils`
- **Pre-built UI components**: alert-dialog, badge, button, card, combobox, dropdown-menu, field, input, input-group, label, select, separator, textarea

---

## Feature 1: GitHub Authentication

**Goal**: Authenticate the user with GitHub so the app can fetch review requests and team membership data.

**Requirements**:
- Add a login page at `/login` with a "Sign in with GitHub" button
- Use GitHub OAuth (via NextAuth.js / Auth.js) to authenticate
- Store the GitHub access token in the session so it can be used for GitHub API calls
- Protect all routes except `/login` — redirect unauthenticated users to `/login`
- Show the user's GitHub avatar and username in the app header when logged in
- Add a sign-out option in a dropdown menu on the avatar

**API scopes needed**: `repo`, `read:org`

---

## Feature 2: Team Configuration

**Goal**: Let the user configure which GitHub organization team they belong to, since CODEOWNERS assigns reviews to teams.

**Requirements**:
- After first login, prompt the user to select their org and team via a setup flow or settings page at `/settings`
- Use the GitHub API to fetch the user's GitHub organizations (`GET /user/orgs`)
- After an org is selected, fetch the teams in that org (`GET /orgs/{org}/teams`) and let the user pick their team
- Store the selected org and team slug in localStorage (or a cookie/session)
- Use the GitHub API to fetch the team's members list (`GET /orgs/{org}/teams/{team_slug}/members`) — this is needed to identify "my team's PRs" and "my team's reviews"
- Allow changing the team selection from `/settings` at any time
- Support selecting multiple teams if the user belongs to more than one

---

## Feature 3: "Assigned to Me" View

**Goal**: Show all PRs where the authenticated user is directly requested as a reviewer.

**Requirements**:
- This is the default view on the main `/` page, displayed as a tab or nav item labeled "Assigned to Me"
- Use the GitHub Search API: `is:pr is:open review-requested:{username}` to fetch PRs where the user is a requested reviewer
- Display results as a list of cards or table rows. Each PR entry shows:
  - PR title (clickable link that opens the PR on GitHub in a new tab)
  - Repository name (as `org/repo`)
  - Author (avatar + username)
  - Created date (relative format, e.g. "3 days ago")
  - Labels (as colored badges)
  - Draft indicator (visual badge if the PR is a draft)
  - Number of pending reviewers (e.g. "2 of 3 reviewed")
- Sort by most recently updated by default
- Show a loading skeleton while data is being fetched
- Show an empty state with a message like "No reviews assigned to you" when the list is empty

---

## Feature 4: "My Team's PRs" View

**Goal**: Show all open PRs authored by members of the user's configured team, so the user can see what their team is working on.

**Requirements**:
- Display as a tab or nav item labeled "My Team's PRs"
- Using the team members list from Feature 2, fetch open PRs authored by each team member
- Use the GitHub Search API: `is:pr is:open author:{member}` for each team member, then deduplicate results
- Display the same PR card/row format as Feature 3, with the addition of:
  - Review status summary (e.g. "Approved", "Changes requested", "Awaiting review")
  - Whether the PR is ready to merge (all checks passing + approved)
- Exclude the user's own PRs from this view (they don't need to see their own)
- Sort by most recently updated by default
- Show loading skeleton and empty state as in Feature 3

---

## Feature 5: "Needs Team Review" View

**Goal**: Show PRs where the user's team has been requested as a reviewer (typically via CODEOWNERS), so the team can coordinate who picks up what.

**Requirements**:
- Display as a tab or nav item labeled "Needs Team Review"
- Use the GitHub Search API: `is:pr is:open team-review-requested:{org}/{team_slug}` to fetch PRs where the team is a requested reviewer
- Display the same PR card/row format as Feature 3, with the addition of:
  - Who from the team (if anyone) has already started reviewing
  - Whether someone from the team has already approved
- This view may overlap with "Assigned to Me" if the user is also individually requested — that's fine, show the PR in both views
- Sort by most recently updated by default
- Show loading skeleton and empty state

---

## Feature 6: Filtering & Search

**Goal**: Let the user filter and search within any of the three views.

**Requirements**:
- Add a filter bar above the PR list that persists across all three views
- Filters:
  - **Repository**: multi-select combobox to filter by one or more repos
  - **Author**: multi-select combobox to filter by PR author
  - **Label**: multi-select combobox to filter by labels
  - **Draft status**: toggle or select to show/hide draft PRs
  - **Age**: select with presets — "Last 24 hours", "Last 7 days", "Last 30 days", "Older than 30 days"
- Add a free-text search input that filters PR titles
- All filters apply client-side with AND logic for instant feedback (no re-fetch)
- Show a count: "Showing 5 of 23"
- Add a "Clear filters" button to reset all filters
- Populate the filter options dynamically from the currently loaded data (e.g. the repo dropdown only shows repos that appear in the results)

---

## Feature 7: Sorting

**Goal**: Allow the user to sort the PR list within any view.

**Requirements**:
- Allow sorting by clicking column headers (or a sort dropdown if using card layout)
- Sortable fields: repository, author, created date, updated date
- Toggle ascending / descending on each click
- Show a visual sort indicator on the active sort field
- Default: updated date, descending

---

## Feature 8: Refresh & Staleness

**Goal**: Keep data fresh without requiring a page reload.

**Requirements**:
- Add a "Refresh" button in the header that re-fetches data for the current view
- Show a spinner on the button during refresh
- Auto-refresh every 5 minutes while the tab is visible
- Pause auto-refresh when the tab is hidden (use `document.visibilitychange`)
- Show "Last updated: X minutes ago" next to the refresh button
- After a refresh, preserve the current filters and sort state

---

## Feature 9: Tab Counts & Badges

**Goal**: Show at a glance how many PRs are in each view without needing to click into it.

**Requirements**:
- Display a count badge next to each tab/nav item label (e.g. "Assigned to Me (4)")
- Update counts when data is refreshed
- Use a muted/subtle style for zero counts
- Fetch counts for all three views on initial load so all tabs show their badge immediately
