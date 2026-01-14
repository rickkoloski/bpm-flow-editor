# W1 — Library Mode Packaging Instructions

**Spec:** `docs/current_work/specs/w1_library_mode_packaging_spec.md`  
**Process Guide:** `docs/PROCESS.md`

---

## Overview

This document provides step-by-step instructions for transforming workflow-editor-ui into a properly packaged library. Follow each part in order.

---

## Prerequisites

- Node.js 18+
- pnpm installed
- All tests passing before starting

**Verify:**
```bash
cd /Users/richardkoloski/src/wf/ui
pnpm test
pnpm dev  # Should start without errors
```

---

## Part 1: W1a — Alias Cleanup

### Step 1: Update vite.config.ts

Change the alias from `@` to `@wf`:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@wf': path.resolve(__dirname, './src'),  // Changed from '@'
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

### Step 2: Update tsconfig.json

Update the paths configuration:

```json
{
  "compilerOptions": {
    "paths": {
      "@wf/*": ["./src/*"]
    }
  }
}
```

**Note:** If there's a `baseUrl` setting, keep it. Only change the paths key.

### Step 3: Update All Imports

Use find-and-replace across the codebase. This is a mechanical change.

**Search:** `from '@/`  
**Replace:** `from '@wf/`

**Search:** `from "@/`  
**Replace:** `from "@wf/`

Files to update (run this to find them):
```bash
grep -r "from '@/" src/ --include="*.ts" --include="*.tsx" -l
grep -r 'from "@/' src/ --include="*.ts" --include="*.tsx" -l
```

**Expected files (~50-60):**
- `src/components/**/*.tsx`
- `src/stores/*.ts`
- `src/lib/*.ts`
- `src/App.tsx`
- `src/main.tsx`

### Step 4: Update Test Setup

If `src/test/setup.ts` has any `@/` imports, update those too.

### Step 5: Verify Alias Change

```bash
# TypeScript check
pnpm exec tsc --noEmit

# Run tests
pnpm test

# Start dev server
pnpm dev
```

All should pass. If there are errors, they'll point to missed imports.

---

## Part 2: W1b — Entry Point Exports

### Step 6: Create src/index.ts

Create a new file that exports the public API:

```typescript
// src/index.ts

/**
 * workflow-editor-ui
 * 
 * A React-based BPM workflow editor with visual canvas,
 * node types, execution state visualization, and Zustand stores.
 * 
 * @packageDocumentation
 */

// === Components ===
export { WorkflowEditor } from '@wf/components/WorkflowEditor'

// === Stores ===
export { useWorkflowStore } from '@wf/stores/workflowStore'
export { useExecutionStore } from '@wf/stores/executionStore'

// === Types ===
export type {
  // Core workflow types
  Plan,
  Step,
  Transition,
  Condition,
  Command,
  CommandType,
  
  // Execution types
  ExecutionContext,
  Token,
  StepResult,
  
  // React Flow types
  WorkflowNode,
  WorkflowNodeData,
  WorkflowEdge,
  WorkflowEdgeData,
  
  // Enums/unions
  StepType,
  TransitionType,
  ExecutionState,
  EditorMode,
  EdgePathType,
  
  // Schemas
  ParameterSchema,
  CommandTypeUIMetadata,
  Permissions,
} from '@wf/types'
```

### Step 7: Update package.json Exports

Add the exports field to package.json:

```json
{
  "name": "workflow-editor-ui",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts"
    },
    "./types": {
      "types": "./src/types/index.ts",
      "import": "./src/types/index.ts"
    },
    "./stores": {
      "types": "./src/stores/index.ts",
      "import": "./src/stores/index.ts"
    },
    "./components/WorkflowEditor": {
      "types": "./src/components/WorkflowEditor.tsx",
      "import": "./src/components/WorkflowEditor.tsx"
    },
    "./styles": "./src/styles/index.css"
  },
  "files": [
    "src"
  ]
}
```

**Note:** Keep all existing scripts, dependencies, and devDependencies unchanged.

### Step 8: Verify Exports

```bash
# Check TypeScript still works
pnpm exec tsc --noEmit

# App still works
pnpm dev
```

---

## Part 3: W1c — CSS Variables Extraction

### Step 9: Create Styles Directory

```bash
mkdir -p src/styles
```

### Step 10: Create Variables File

Create `src/styles/variables.css`:

```css
/**
 * workflow-editor-ui theme variables
 * 
 * All variables use the 'wf-' prefix to avoid conflicts
 * when this package is consumed by other applications.
 * 
 * Consumers can override these by defining the same variables
 * after importing this file.
 */

:root {
  /* Base colors (HSL values without hsl() wrapper for Tailwind) */
  --wf-background: 0 0% 100%;
  --wf-foreground: 222.2 84% 4.9%;
  
  /* Card/surface colors */
  --wf-card: 0 0% 100%;
  --wf-card-foreground: 222.2 84% 4.9%;
  --wf-popover: 0 0% 100%;
  --wf-popover-foreground: 222.2 84% 4.9%;
  
  /* Primary accent */
  --wf-primary: 222.2 47.4% 11.2%;
  --wf-primary-foreground: 210 40% 98%;
  
  /* Secondary accent */
  --wf-secondary: 210 40% 96.1%;
  --wf-secondary-foreground: 222.2 47.4% 11.2%;
  
  /* Muted/disabled states */
  --wf-muted: 210 40% 96.1%;
  --wf-muted-foreground: 215.4 16.3% 46.9%;
  
  /* Accent (hover states) */
  --wf-accent: 210 40% 96.1%;
  --wf-accent-foreground: 222.2 47.4% 11.2%;
  
  /* Destructive/error */
  --wf-destructive: 0 84.2% 60.2%;
  --wf-destructive-foreground: 210 40% 98%;
  
  /* Borders and inputs */
  --wf-border: 214.3 31.8% 91.4%;
  --wf-input: 214.3 31.8% 91.4%;
  --wf-ring: 222.2 84% 4.9%;
  
  /* Border radius */
  --wf-radius: 0.5rem;
  
  /* === Workflow Node Execution States === */
  --wf-node-pending: 220 9% 46%;      /* Gray */
  --wf-node-active: 217 91% 60%;      /* Blue */
  --wf-node-in-progress: 48 96% 53%;  /* Yellow */
  --wf-node-completed: 142 76% 36%;   /* Green */
  --wf-node-failed: 0 84% 60%;        /* Red */
  --wf-node-waiting: 32 95% 44%;      /* Orange */
  --wf-node-blocked: 0 84% 60%;       /* Red */
}
```

### Step 11: Create React Flow Styles

Create `src/styles/react-flow.css`:

```css
/**
 * React Flow customizations for workflow-editor-ui
 */

/* Node selection styling */
.react-flow__node.selected {
  outline: 2px solid hsl(var(--wf-primary));
  outline-offset: 2px;
  border-radius: var(--wf-radius);
}

/* SVG-based nodes handle their own selection */
.react-flow__node-action.selected,
.react-flow__node-decision.selected,
.react-flow__node-wait.selected,
.react-flow__node-subprocess.selected,
.react-flow__node-join.selected,
.react-flow__node-terminal.selected {
  outline: none;
  box-shadow: none;
}

/* Connection handles */
.react-flow__handle {
  background-color: hsl(var(--wf-primary));
  width: 12px;
  height: 12px;
  border: 2px solid hsl(var(--wf-background));
}

.react-flow__handle:hover {
  background-color: hsl(var(--wf-primary) / 0.8);
}

/* Edge styling */
.react-flow__edge-path {
  stroke: hsl(var(--wf-border));
  stroke-width: 2;
}

.react-flow__edge.selected .react-flow__edge-path {
  stroke: hsl(var(--wf-primary));
  stroke-width: 3;
}

/* Node state animations */
@keyframes wf-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes wf-subtle-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

.wf-node-active {
  animation: wf-pulse 2s ease-in-out infinite;
}

.wf-node-waiting {
  animation: wf-subtle-pulse 3s ease-in-out infinite;
}
```

### Step 12: Create Main Styles Entry

Create `src/styles/index.css`:

```css
/**
 * workflow-editor-ui styles entry point
 * 
 * Import this file in your application:
 *   import 'workflow-editor-ui/styles'
 */

@import './variables.css';
@import './react-flow.css';
```

### Step 13: Update Existing index.css

Update `src/index.css` to import the new styles:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Import shared styles */
@import './styles/variables.css';
@import './styles/react-flow.css';

@layer base {
  * {
    border-color: hsl(var(--wf-border));
  }
  body {
    background-color: hsl(var(--wf-background));
    color: hsl(var(--wf-foreground));
  }
}

/* Component-specific styles that use Tailwind @apply */
/* Keep existing styles here */
```

### Step 14: Update Tailwind Config

Update `tailwind.config.js` to use the `wf-` prefixed variables:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--wf-border))",
        input: "hsl(var(--wf-input))",
        ring: "hsl(var(--wf-ring))",
        background: "hsl(var(--wf-background))",
        foreground: "hsl(var(--wf-foreground))",
        primary: {
          DEFAULT: "hsl(var(--wf-primary))",
          foreground: "hsl(var(--wf-primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--wf-secondary))",
          foreground: "hsl(var(--wf-secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--wf-destructive))",
          foreground: "hsl(var(--wf-destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--wf-muted))",
          foreground: "hsl(var(--wf-muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--wf-accent))",
          foreground: "hsl(var(--wf-accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--wf-popover))",
          foreground: "hsl(var(--wf-popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--wf-card))",
          foreground: "hsl(var(--wf-card-foreground))",
        },
        // Node execution state colors
        node: {
          pending: "hsl(var(--wf-node-pending))",
          active: "hsl(var(--wf-node-active))",
          "in-progress": "hsl(var(--wf-node-in-progress))",
          completed: "hsl(var(--wf-node-completed))",
          failed: "hsl(var(--wf-node-failed))",
          waiting: "hsl(var(--wf-node-waiting))",
          blocked: "hsl(var(--wf-node-blocked))",
        },
      },
      borderRadius: {
        lg: "var(--wf-radius)",
        md: "calc(var(--wf-radius) - 2px)",
        sm: "calc(var(--wf-radius) - 4px)",
      },
      keyframes: {
        "wf-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "wf-subtle-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        "wf-pulse": "wf-pulse 2s ease-in-out infinite",
        "wf-subtle-pulse": "wf-subtle-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
```

### Step 15: Verify CSS Changes

```bash
# Run dev server and check styling
pnpm dev

# Build to check for CSS issues
pnpm build
```

---

## Part 4: Final Verification

### Step 16: Full Test Suite

```bash
# TypeScript
pnpm exec tsc --noEmit

# Unit tests
pnpm test

# Build
pnpm build

# Dev server
pnpm dev
```

### Step 17: Consumer Integration Test

In vnext-admin, simplify the integration:

1. **Remove Vite transform plugin** from `vite.config.ts`
2. **Remove `src/types/workflow-editor-ui.d.ts`**
3. **Update imports:**

```typescript
// Before
import { WorkflowEditor } from 'workflow-editor-ui/components/WorkflowEditor'
import { useWorkflowStore, useExecutionStore } from 'workflow-editor-ui/stores'
import type { Plan } from 'workflow-editor-ui/types'

// After
import { WorkflowEditor, useWorkflowStore, useExecutionStore } from 'workflow-editor-ui'
import type { Plan } from 'workflow-editor-ui'
```

4. **Import CSS:**
```typescript
import 'workflow-editor-ui/styles'
```

5. **Remove duplicated CSS variables** from vnext-admin's `index.css`

6. **Test:**
```bash
cd vnext-admin
pnpm dev
pnpm build
```

---

## Part 5: Document Completion

### Step 18: Create Completion Document

Create `docs/current_work/stepwise_results/w1_library_mode_packaging_COMPLETE.md`:

Include:
- Summary of changes
- Files created/modified count
- Verification results
- Consumer simplification achieved
- Any remaining issues

---

## Verification Checklist

**W1a — Alias Cleanup:**
- [ ] `vite.config.ts` uses `@wf` alias
- [ ] `tsconfig.json` has `@wf/*` path
- [ ] All imports updated to `@wf/`
- [ ] `pnpm exec tsc --noEmit` passes
- [ ] `pnpm test` passes
- [ ] `pnpm dev` works

**W1b — Entry Point Exports:**
- [ ] `src/index.ts` created with exports
- [ ] `package.json` has exports field
- [ ] TypeScript resolves imports

**W1c — CSS Variables:**
- [ ] `src/styles/variables.css` created
- [ ] `src/styles/react-flow.css` created
- [ ] `src/styles/index.css` created
- [ ] `tailwind.config.js` updated
- [ ] Styling works in dev mode

**Consumer Integration:**
- [ ] vnext-admin can remove Vite plugin
- [ ] vnext-admin can remove manual `.d.ts`
- [ ] vnext-admin can import from root
- [ ] vnext-admin can import CSS
- [ ] vnext-admin builds successfully
