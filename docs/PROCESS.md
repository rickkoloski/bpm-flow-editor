# Development Process Guide

This document describes the development process and conventions used for this project. It ensures consistency across development sessions and agents.

---

## Overview

We use a **deliverable-based development process** with comprehensive documentation. Each piece of work is:

1. **Specified** — Clear definition of goals, non-goals, and success criteria
2. **Planned** — Step-by-step implementation instructions
3. **Executed** — Implemented following the plan
4. **Documented** — Results captured in completion document

---

## Directory Structure

```
docs/
├── PROCESS.md                    # This file
└── current_work/
    ├── specs/                    # What to build
    │   └── {deliverable}_spec.md
    ├── planning/                 # How to build it
    │   └── {deliverable}_instructions.md
    └── stepwise_results/         # What was built
        └── {deliverable}_COMPLETE.md
```

---

## Deliverable Naming

Deliverables use a hierarchical naming convention:

- **Major deliverable**: `W1` (Workflow Editor Library Mode)
- **Sub-deliverable**: `W1a`, `W1b`, `W1c`

Example:
```
W1 — Library Mode Packaging
├── W1a — Alias Cleanup (@/ → @wf/)
├── W1b — Entry Point Exports
└── W1c — CSS Variables Extraction
```

---

## Document Types

### Specification (`specs/{name}_spec.md`)

Defines WHAT to build:

```markdown
# {Deliverable} — {Title} Spec

**Status:** Draft | In Progress | Complete
**Created:** YYYY-MM-DD
**Parent:** {Parent deliverable if applicable}

## Summary
One paragraph describing the deliverable.

## Goals
1. First goal
2. Second goal

## Non-Goals
- What this does NOT include

## Technical Details
Architecture, data flow, interfaces, etc.

## Success Criteria
1. Observable result 1
2. Observable result 2

## Files to Create/Modify
| File | Purpose |
|------|---------|
| ... | ... |
```

### Instructions (`planning/{name}_instructions.md`)

Defines HOW to build it:

```markdown
# {Deliverable} — {Title} Instructions

**Spec:** `docs/current_work/specs/{name}_spec.md`

## Overview
Brief context and prerequisites.

## Part 1: {First Major Section}

### Step 1: {Action}
Specific instructions, code snippets, commands.

### Step 2: {Action}
...

## Part N: Verification

### Step N: Run Tests
```bash
pnpm test
```

## Verification Checklist
- [ ] Item 1
- [ ] Item 2
```

### Completion Document (`stepwise_results/{name}_COMPLETE.md`)

Documents WHAT was built:

```markdown
# {Deliverable} — {Title}: COMPLETE

**Status:** COMPLETE
**Date:** YYYY-MM-DD
**Parent:** {Parent deliverable}

## Summary
What was accomplished.

## What Was Built
Detailed description of changes.

## Files Summary
| File | Status |
|------|--------|
| ... | New/Modified |

## Verification Results
Test results, build output, screenshots.

## Next Steps
What comes next, any follow-up work.
```

---

## Workflow

### 1. Before Starting

1. **Read the spec** — Understand goals, non-goals, success criteria
2. **Read the instructions** — Follow the step-by-step guide
3. **Check prerequisites** — Ensure dependencies are met

### 2. During Implementation

1. **Follow the plan** — Don't skip steps
2. **Run tests frequently** — Catch issues early
3. **Document deviations** — Note any changes from the plan

### 3. After Completion

1. **Run full verification** — All items in checklist
2. **Create completion document** — In `stepwise_results/`
3. **Note any issues** — Technical debt, follow-up work

---

## Conventions

### Code Style

- TypeScript with strict mode
- ESLint + Prettier formatting
- Descriptive variable names
- JSDoc comments for public APIs

### Testing

- Unit tests with Vitest
- E2E tests with Playwright
- Test files alongside source: `{name}.test.ts`

### Git Commits

- One commit per logical change
- Descriptive commit messages
- Reference deliverable: `[W1a] Change @/ alias to @wf/`

---

## Integration with vNext

This project (workflow-editor-ui) is consumed by vnext-admin. Key integration points:

| Export | Consumer Usage |
|--------|----------------|
| `WorkflowEditor` component | Mounted in WorkflowMonitor |
| `useWorkflowStore` | Plan/node state management |
| `useExecutionStore` | Execution state from channels |
| Types (`Plan`, `Step`, etc.) | Shared type definitions |
| CSS variables | Theme consistency |

Changes here affect vnext-admin. Coordinate significant changes.

---

## Current Context

**Parent Project:** vNext (cognitive substrate for enterprise workflows)

**Integration Point:** vnext-admin consumes this package for workflow visualization and debugging.

**Current Issue:** Package is structured as an app, not a library. This causes:
- Path alias conflicts (`@/` used by both projects)
- No proper exports (consumers import from source paths)
- CSS duplication (no shared theme file)

**Active Work:** W1 — Library Mode Packaging
