# W1 — Library Mode Packaging Spec

**Status:** Draft  
**Created:** 2025-01-14  
**Consumer:** vnext-admin (vNext project)

---

## Summary

Transform workflow-editor-ui from a standalone app into a properly packaged library that can be cleanly consumed by vnext-admin and future consumers. This eliminates integration hacks currently required and establishes a sustainable architecture.

---

## Background

### Current State

workflow-editor-ui is structured as a Vite app:
- Uses `@/` alias for internal imports
- No package exports defined
- CSS variables embedded in app styles
- Consumers must import from source paths

### Consumer Workarounds (vnext-admin)

To consume this package, vnext-admin currently requires:
1. **Vite transform plugin** — Rewrites `@/` imports at build time
2. **200+ line `.d.ts` file** — Manual type declarations
3. **Duplicated CSS variables** — Entire theme copied
4. **Source path imports** — `workflow-editor-ui/src/stores`

These workarounds are fragile and won't work for production deployment.

---

## Goals

1. **Eliminate alias conflict** — Change `@/` to `@wf/` so consumers' `@/` works
2. **Proper package exports** — Define what consumers can import
3. **Shareable CSS** — Extract theme variables to importable file
4. **TypeScript declarations** — Auto-generated from source
5. **Backward compatible** — Standalone app still works

---

## Non-Goals

- Full library build with Rollup (future enhancement)
- Publishing to npm registry
- Breaking changes to component APIs
- Restructuring component architecture

---

## Deliverables

| ID | Title | Description |
|----|-------|-------------|
| W1a | Alias Cleanup | Change `@/` to `@wf/` throughout codebase |
| W1b | Entry Point Exports | Create `src/index.ts` with public API |
| W1c | CSS Variables Extraction | Create importable theme file |

---

## Technical Design

### W1a: Alias Change

**Files to modify:**
- `vite.config.ts` — Change alias from `@` to `@wf`
- `tsconfig.json` — Update paths
- All `*.ts` and `*.tsx` files — Update imports

**Before:**
```typescript
import { useWorkflowStore } from '@/stores'
```

**After:**
```typescript
import { useWorkflowStore } from '@wf/stores'
```

### W1b: Package Exports

**Create `src/index.ts`:**
```typescript
// Components
export { WorkflowEditor } from '@wf/components/WorkflowEditor'

// Stores
export { useWorkflowStore, useExecutionStore } from '@wf/stores'

// Types
export * from '@wf/types'
```

**Update `package.json`:**
```json
{
  "exports": {
    ".": "./src/index.ts",
    "./styles": "./src/styles/index.css"
  }
}
```

### W1c: CSS Extraction

**Create `src/styles/variables.css`:**
```css
:root {
  /* Base theme - consumers can override */
  --wf-background: 0 0% 100%;
  --wf-foreground: 222.2 84% 4.9%;
  --wf-primary: 222.2 47.4% 11.2%;
  /* ... all variables with wf- prefix */
}
```

**Create `src/styles/index.css`:**
```css
@import './variables.css';
@import './components.css';
@import './react-flow.css';
```

---

## Consumer Changes (vnext-admin)

After W1 completion, vnext-admin can simplify to:

**package.json:**
```json
{
  "dependencies": {
    "workflow-editor-ui": "link:../../../wf/ui"
  }
}
```

**Imports:**
```typescript
import { WorkflowEditor, useWorkflowStore, useExecutionStore } from 'workflow-editor-ui'
import type { Plan, Step, CommandType } from 'workflow-editor-ui'
import 'workflow-editor-ui/styles'
```

**Remove:**
- Vite transform plugin
- Manual `.d.ts` file
- Duplicated CSS variables

---

## Success Criteria

1. `pnpm dev` still works (app mode)
2. `pnpm test` passes
3. `pnpm build` succeeds
4. vnext-admin can import without Vite plugin
5. vnext-admin can import without manual type declarations
6. vnext-admin can import CSS without duplication
7. TypeScript resolves types correctly in both projects

---

## Estimated Effort

| Deliverable | Files | Complexity | Time |
|-------------|-------|------------|------|
| W1a | ~60 | Low (mechanical) | 1-2 hours |
| W1b | ~5 | Low | 30 min |
| W1c | ~5 | Medium | 1 hour |
| **Total** | ~70 | | 3-4 hours |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Breaking existing app | Run `pnpm dev` after each change |
| Missing import updates | Use find/replace, run TypeScript |
| CSS specificity issues | Use `wf-` prefix for all variables |

---

## Verification Plan

1. Run `pnpm dev` — App still works
2. Run `pnpm test` — All tests pass
3. Run `pnpm build` — Build succeeds
4. In vnext-admin:
   - Remove Vite plugin
   - Remove manual `.d.ts`
   - Update imports
   - Run `pnpm dev` — Works without errors
   - Run `pnpm build` — Builds successfully
