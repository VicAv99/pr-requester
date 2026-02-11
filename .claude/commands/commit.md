---
description: Analyze staged/unstaged changes and create conventional commit(s). Proposes message(s) for approval before committing.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). The `$ARGUMENTS` may contain a hint about what the commit should focus on or `--all` to include all changes.

## Outline

Analyze changes and create conventional commit(s) with user approval.

### Commit Message Format

```txt
<type>(<scope>): <subject>

<body>

<footer>
```

The header is required. Scope is optional. All lines must stay under 100 characters.

### Commit Types

| Type       | Purpose                               |
| ---------- | ------------------------------------- |
| `feat`     | New feature                           |
| `fix`      | Bug fix                               |
| `refactor` | Code refactoring (no behavior change) |
| `chore`    | Routine maintenance tasks             |
| `docs`     | Documentation changes                 |
| `style`    | Code style and formatting             |
| `test`     | Tests added, updated or improved      |
| `perf`     | Performance improvement               |
| `build`    | Build system or CI changes            |
| `ci`       | Continuous integration configuration  |
| `deps`     | Dependency updates                    |
| `revert`   | Revert a previous commit              |

### Subject Line Rules

- Imperative, present tense: "Add feature" not "Added feature"
- Capitalize the first letter
- No period at the end
- Maximum 70 characters

### Body Guidelines

- Explain **what** and **why**, not how
- Use imperative mood and present tense
- Contrast with previous behavior when relevant

### Execution Steps

1. **Check for changes**:

   ```bash
   git status --short
   git diff --stat
   git diff --cached --stat
   ```

   - If no changes at all, abort: "Nothing to commit."
   - If `$ARGUMENTS` contains `--all`, stage all changes
   - Otherwise, note what is staged vs. unstaged

2. **If nothing is staged** (and no `--all` flag):
   - Show unstaged changes and ask which files to stage
   - Or suggest `--all` to include everything

3. **Analyze the changes**:

   ```bash
   git diff --cached
   ```

   Read the actual diff to understand what changed and why. Use `$ARGUMENTS` as additional context if provided.

4. **Determine commit strategy**:
   - If changes are logically related → single commit
   - If changes span unrelated concerns → propose multiple commits
   - Prefer multiple focused commits over one large commit

5. **Propose commit message(s)**:

   Present each proposed commit to the user:

   ```markdown
   ## Proposed Commit

   type(scope): subject

   Body explaining what and why.

   **Files**: list of files included

   ---

   Approve? Reply "yes" to commit, or suggest changes.
   ```

   If multiple commits, show all proposed messages and the breakdown before proceeding.

6. **Wait for user approval**:
   - On approval: execute the commit(s)
   - On suggested changes: revise and re-propose
   - **Never commit without explicit approval**

7. **Execute commit(s)**:

   Stage the appropriate files and commit. Use a HEREDOC for the message:

   ```bash
   git commit -m "$(cat <<'EOF'
   type(scope): subject

   Body text here.
   EOF
   )"
   ```

8. **Report completion**:

   ```markdown
   Committed: `<short hash>` type(scope): subject
   ```

### Examples

**Simple fix:**

```txt
fix(api): Handle null response in user endpoint

The user API could return null for deleted accounts, causing a crash
in the dashboard. Add null check before accessing user properties.
```

**Feature with scope:**

```txt
feat(photos): Add multi-select for bulk download

Allow users to select multiple photos and download them as a zip.
Previously only single-photo downloads were supported.
```

**Refactor:**

```txt
refactor: Extract common validation logic to shared module

Move duplicate validation code from three endpoints into a shared
validator class. No behavior change.
```

### Flags

| Flag    | Description                  |
| ------- | ---------------------------- |
| `--all` | Stage and commit all changes |

### Error Handling

- **Nothing to commit**: "No staged or unstaged changes. Nothing to commit."
- **Pre-commit hook fails**: Fix the issue, re-stage, and create a **new** commit (never `--amend` unless asked)
- **Not a git repo**: "Not inside a git repository."
