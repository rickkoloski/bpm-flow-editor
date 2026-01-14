# Claude Code Task: Implement W1 — Library Mode Packaging

## Context

You are working on the `workflow-editor-ui` project, a React-based BPM workflow editor. This project is consumed as a library by `vnext-admin` (part of the vNext project).

Currently, the package is structured as a standalone app, which causes integration issues when consumed by other projects. Your task is to transform it into a properly packaged library.

## Process

**IMPORTANT:** This project follows a documented development process. Before starting:

1. **Read the process guide:** `/Users/richardkoloski/src/wf/ui/docs/PROCESS.md`
2. **Read the specification:** `/Users/richardkoloski/src/wf/ui/docs/current_work/specs/w1_library_mode_packaging_spec.md`
3. **Follow the instructions:** `/Users/richardkoloski/src/wf/ui/docs/current_work/planning/w1_library_mode_packaging_instructions.md`

The instructions document provides step-by-step guidance. Follow it in order.

## Working Directory

```
/Users/richardkoloski/src/wf/ui
```

## Summary of Changes

### W1a — Alias Cleanup
- Change `@/` alias to `@wf/` to avoid conflicts with consumers
- Update `vite.config.ts`, `tsconfig.json`, and all import statements
- ~50-60 files need import updates (mechanical find/replace)

### W1b — Entry Point Exports  
- Create `src/index.ts` with public API exports
- Update `package.json` with exports field
- Define what consumers can import

### W1c — CSS Variables Extraction
- Create `src/styles/variables.css` with `wf-` prefixed variables
- Create `src/styles/react-flow.css` with React Flow customizations
- Create `src/styles/index.css` as import entry point
- Update `tailwind.config.js` to use new variables

## Key Files to Reference

**Current structure:**
- `src/components/WorkflowEditor.tsx` — Main component
- `src/stores/workflowStore.ts` — Plan/node state
- `src/stores/executionStore.ts` — Execution state
- `src/types/workflow.ts` — Type definitions
- `src/index.css` — Current app styles
- `tailwind.config.js` — Tailwind configuration

## Verification

After each part, verify:

```bash
# TypeScript check
pnpm exec tsc --noEmit

# Run tests  
pnpm test

# Start dev server
pnpm dev

# Build
pnpm build
```

## Deliverable

After successful implementation, create:
```
/Users/richardkoloski/src/wf/ui/docs/current_work/stepwise_results/w1_library_mode_packaging_COMPLETE.md
```

Include:
- Summary of what was changed
- Files created/modified count
- Verification results (test output, build output)
- Any issues encountered and how they were resolved
- Confirmation that app still works in standalone mode

## Integration Verification (Optional)

If time permits, verify the consumer can simplify their integration:

In `/Users/richardkoloski/src/vNext-gpt/vnext_lab/vnext_admin`:
1. Remove Vite transform plugin from `vite.config.ts`
2. Remove `src/types/workflow-editor-ui.d.ts`
3. Update imports to use root package
4. Import CSS from `workflow-editor-ui/styles`
5. Run `pnpm dev` and `pnpm build`

## Notes

- The instructions document has detailed code snippets for each step
- The alias change (W1a) is the most files but is mechanical find/replace
- Keep the standalone app working throughout — run `pnpm dev` after each part
- Use `wf-` prefix for CSS variables to avoid conflicts with consumers
