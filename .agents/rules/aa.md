---
trigger: always_on
---

# Antigravity Project — Agent Rules

## 🖥️ Environment
- OS: **Windows** — always use PowerShell-compatible commands
- Never use `grep` → use `Select-String` or `findstr`
- Never use `ls` → use `dir` or `Get-ChildItem`
- Never use `cat` → use `Get-Content`
- Never use `touch` → use `New-Item`
- Never use unix-style paths (`/`) → use Windows paths (`\`)

---

## 📁 Project Structure
```
src/
  components/
    common/        → Shared components (StoryActionButton, Header, Footer)
    home/          → Home page components (TopNewsLayout, TrendingBar)
    news/          → NewsCard
    sections/      → CityNews, Cricket, Election, Feature, NewsThrio, ShortsSection, etc.
    navigation/
    layout/        → Layout.jsx
  pages/           → Article.jsx, SearchResults.jsx
  data/
  lib/
server/            → sql-store.js, auth.js, story-save-store.js, etc.
database/          → SQL schema files
```

---

## ⚛️ Frontend Rules

### StoryActionButton
- **Only ONE `<StoryActionButton>` per article/card** — never render it twice in the same component
- Always pass a unique `storyId` prop
- Do not add duplicate bookmark or share icons in parent AND child components simultaneously
- If a layout wraps a card, check if the card already has `StoryActionButton` before adding one in the layout

### General Component Rules
- Do not duplicate JSX elements when fixing bugs — always check if element already exists before adding
- When editing a component, read the FULL file first before making changes
- Never add a component import if it is already imported at the top of the file

---

## 🗄️ Backend Rules (sql-store.js)
- All data mutations go through `updateData()`
- Always check for duplicates before `.push()` (e.g., check username, storyId)
- `nextNumericId()` is used for new user/story IDs — do not hardcode IDs
- Password hashing is done via `hashPassword()` — never store plain text passwords
- Safe user object must exclude password: `const { password: _, ...safeUser } = newUser`

---

## 🔖 Known Bug Patterns to Avoid

### Duplicate Bookmarks
- **Cause:** `StoryActionButton` rendered in both a page (`Article.jsx`) and its child section, OR rendered twice in the same file
- **Fix:** Keep only ONE instance per view. Check all parent-child component chains before adding

### Agent Command Failures
- Always use PowerShell syntax
- Prefer `Select-String` over `findstr` for multi-line context
- Use `-Context 0,0` flag when you only need the matching line
- Run `Get-Content file | Select-String "pattern"` for searching inside files

---

## ✅ Before Making Any Edit — Checklist
1. Read the full target file first
2. Check if the component/import already exists
3. Check parent AND child components for duplicate renders
4. Use only PowerShell commands
5. Make the smallest possible change — do not refactor unrelated code
6. After editing, verify the change with `Get-Content` to confirm

---

## 🚫 Never Do
- Do not use `grep`, `ls`, `cat`, `touch`, `cp`, `mv` (these are Linux commands)
- Do not render `StoryActionButton` more than once per article view
- Do not add duplicate imports
- Do not rewrite entire files when only a small fix is needed
- Do not ignore exit code 1 errors — investigate before retrying