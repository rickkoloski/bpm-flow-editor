# Claude Code Agent Prompt: workflow-editor-ui (W1)

## Your Role

You are a coding agent working on the `workflow-editor-ui` project — a React-based BPM workflow editor. Your task is to transform this package from a standalone app into a properly packaged library.

## First Steps

**Before writing any code, read these documents in order:**

1. **Process Guide:** `docs/PROCESS.md`
   - Explains our development workflow and conventions
   - Understand the spec → instructions → completion document pattern

2. **Specification:** `docs/current_work/specs/w1_library_mode_packaging_spec.md`
   - Defines WHAT you're building and WHY
   - Goals, non-goals, success criteria

3. **Instructions:** `docs/current_work/planning/w1_library_mode_packaging_instructions.md`
   - Step-by-step HOW to implement
   - Code snippets for each change
   - Verification commands after each part

## Project Location

```
/Users/richardkoloski/src/wf/ui
```

## Task Summary

Transform workflow-editor-ui into a properly packaged library by:

| Part | Task | Key Change |
|------|------|------------|
| W1a | Alias Cleanup | Change `@/` to `@wf/` in all imports |
| W1b | Entry Point Exports | Create `src/index.ts` with public API |
| W1c | CSS Variables | Extract theme to `src/styles/` with `wf-` prefix |

## Why This Matters

This package is consumed by `vnext-admin`. Currently, the consumer needs ugly workarounds:
- A Vite plugin to rewrite imports
- 200+ lines of manual TypeScript declarations
- Duplicated CSS variables

After your work, consumers can simply:
```typescript
import { WorkflowEditor, useWorkflowStore } from 'workflow-editor-ui'
import 'workflow-editor-ui/styles'
```

## Working Pattern

For each part (W1a, W1b, W1c):

1. **Read** the relevant section in instructions
2. **Implement** following the steps exactly
3. **Verify** using the provided commands:
   ```bash
   pnpm exec tsc --noEmit  # TypeScript check
   pnpm test               # Unit tests
   pnpm dev                # App still works
   ```
4. **Continue** to next part only when verification passes

## Critical Constraints

- **Keep the standalone app working** — Run `pnpm dev` after each part
- **Don't break tests** — Run `pnpm test` frequently
- **Use `wf-` prefix** for all CSS variables (avoids conflicts)
- **Follow the instructions document** — It has exact code snippets

## Deliverable

When complete, create:
```
docs/current_work/stepwise_results/w1_library_mode_packaging_COMPLETE.md
```

Following the template in `docs/PROCESS.md`, include:
- Summary of changes
- Files created/modified
- Verification results
- Any issues and resolutions

## Commands Reference

```bash
# Navigate to project
cd /Users/richardkoloski/src/wf/ui

# TypeScript check
pnpm exec tsc --noEmit

# Run tests
pnpm test

# Start dev server (verify app works)
pnpm dev

# Production build
pnpm build

# Find files with @/ imports (for W1a)
grep -r "from '@/" src/ --include="*.ts" --include="*.tsx" -l
```

## Start Now

Begin by reading the documents listed in "First Steps" above. The instructions document will guide you through each change with specific code snippets.

Good luck! 🚀
