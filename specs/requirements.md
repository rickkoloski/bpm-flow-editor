# Technical Specifications: Workflow Editor UI

## Overview

A React-based embeddable workflow editing widget for creating, managing, and debugging workflows. The UI integrates with an Elixir/Phoenix orchestration engine and serves both technical and business users in a space-constrained embedded panel context.

---

## System Architecture

### Technology Stack

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Framework | React | 18.x | Industry standard, component-based architecture |
| Language | TypeScript | 5.x | Type safety, better developer experience |
| Build Tool | Vite | 5.x | Fast builds, excellent DX |
| Workflow Library | React Flow | 11.x | Native React, customizable nodes/edges, active community |
| State Management | Zustand | 4.x | Simple, efficient, React Flow recommended |
| Layout Engine | ELKjs | 0.9.x | Automatic DAG arrangement, handles complex layouts |
| UI Components | shadcn/ui | Latest | Highly customizable, Tailwind-based |
| Styling | Tailwind CSS | 3.x | Utility-first, consistent with shadcn/ui |
| WebSocket | Phoenix.js | 1.x | Native Phoenix channel support |
| Testing | Vitest + React Testing Library | Latest | Fast, React-native testing |

### Folder Structure

```
src/
├── api/                    # REST API and WebSocket clients
│   ├── rest.ts            # REST API wrapper
│   ├── websocket.ts       # Phoenix channel client
│   └── types.ts           # API response types
├── components/
│   ├── canvas/            # React Flow canvas components
│   │   ├── WorkflowCanvas.tsx
│   │   └── Toolbar.tsx
│   ├── nodes/             # Custom node components
│   │   ├── ActionNode.tsx
│   │   ├── DecisionNode.tsx
│   │   ├── WaitNode.tsx
│   │   ├── SubprocessNode.tsx
│   │   ├── JoinNode.tsx
│   │   └── TerminalNode.tsx
│   ├── edges/             # Custom edge components
│   │   ├── StandardEdge.tsx
│   │   ├── ParallelForkEdge.tsx
│   │   └── DefaultEdge.tsx
│   ├── palette/           # Node palette
│   │   ├── Palette.tsx
│   │   ├── StepTypeSection.tsx
│   │   └── CommandTypeSection.tsx
│   ├── properties/        # Properties panel
│   │   ├── PropertiesPanel.tsx
│   │   └── DynamicForm.tsx
│   ├── debug/             # Debugging components
│   │   ├── ContextInspector.tsx
│   │   ├── StepInspector.tsx
│   │   └── ExecutionStatus.tsx
│   └── ui/                # shadcn/ui components
├── hooks/                  # Custom React hooks
│   ├── useWorkflowStore.ts
│   ├── useExecutionStore.ts
│   ├── useWebSocket.ts
│   └── useAutoLayout.ts
├── stores/                 # Zustand stores
│   ├── workflowStore.ts
│   └── executionStore.ts
├── types/                  # TypeScript type definitions
│   ├── workflow.ts
│   ├── execution.ts
│   └── api.ts
├── utils/                  # Utility functions
│   ├── layout.ts          # ELKjs layout helpers
│   └── validation.ts      # Workflow validation
└── index.tsx              # Main entry point
```

---

## Data Models

### Core Entities

#### Step
Represents a node in the workflow graph.

```typescript
interface Step {
  id: string;
  plan_id: string;
  step_type: StepType;
  name: string;
  description?: string;
  command_id?: string;           // For action steps
  ui_metadata: {
    position: { x: number; y: number };
    collapsed?: boolean;
  };
  created_at: string;
  updated_at: string;
}

type StepType =
  | 'action'      // Executes a command
  | 'decision'    // Routes via conditions (no execution)
  | 'wait'        // Pauses until event/timeout
  | 'subprocess'  // Invokes another plan
  | 'join'        // Waits for parallel tokens
  | 'terminal';   // End state
```

#### Transition
Represents an edge between steps.

```typescript
interface Transition {
  id: string;
  plan_id: string;
  from_step_id: string;
  to_step_id: string;
  transition_type: TransitionType;
  condition_id?: string;
  priority: number;               // For ordering multiple outgoing transitions
  created_at: string;
  updated_at: string;
}

type TransitionType =
  | 'standard'       // Normal flow
  | 'parallel_fork'  // Spawns parallel token
  | 'default';       // Fallback when no conditions match
```

#### Condition
Attached to transitions for conditional routing.

```typescript
interface Condition {
  id: string;
  name: string;
  expression: string;              // Expression to evaluate
  expression_type: 'simple' | 'jsonpath' | 'javascript';
  created_at: string;
  updated_at: string;
}
```

#### Command
Instance of a CommandType with specific parameters.

```typescript
interface Command {
  id: string;
  command_type_id: string;
  parameters: Record<string, unknown>;  // Filled based on parameter_schema
  created_at: string;
  updated_at: string;
}
```

#### CommandType
Catalog of available commands.

```typescript
interface CommandType {
  id: string;
  name: string;
  description: string;
  source: 'platform' | 'partner' | 'custom';
  parameter_schema: JSONSchema;      // JSON Schema for parameters
  result_schema?: JSONSchema;        // Schema for output
  ui_metadata: {
    category: string;
    icon: string;
    palette_visible: boolean;
  };
  status: 'active' | 'deprecated' | 'disabled';
  created_at: string;
  updated_at: string;
}
```

#### Plan
The workflow definition.

```typescript
interface Plan {
  id: string;
  name: string;
  description?: string;
  start_step_id: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  steps: Step[];
  transitions: Transition[];
  created_at: string;
  updated_at: string;
}
```

#### ExecutionContext
Runtime execution state.

```typescript
interface ExecutionContext {
  id: string;
  plan_id: string;
  plan_version: number;
  status: ExecutionStatus;
  data: Record<string, unknown>;    // Blackboard/context data
  tokens: Token[];
  step_results: StepResult[];
  started_at: string;
  completed_at?: string;
}

type ExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

interface Token {
  id: string;
  step_id: string;
  status: TokenStatus;
  created_at: string;
}

type TokenStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'failed'
  | 'waiting'
  | 'blocked';

interface StepResult {
  step_id: string;
  token_id: string;
  status: 'completed' | 'failed';
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
  };
  started_at: string;
  completed_at: string;
  duration_ms: number;
}
```

---

## API Specifications

### REST Endpoints

#### Plans
```
GET    /api/plans                    # List plans
POST   /api/plans                    # Create plan
GET    /api/plans/:id                # Get plan with steps/transitions
PUT    /api/plans/:id                # Update plan
DELETE /api/plans/:id                # Delete plan

GET    /api/plans/:id/validate       # Validate plan structure
POST   /api/plans/:id/publish        # Publish plan version
```

#### Command Types
```
GET    /api/command_types            # List active command types
       ?status=active                # Filter by status
       ?category=string              # Filter by category
GET    /api/command_types/:id        # Get command type details
```

#### Executions
```
GET    /api/executions               # List executions
       ?plan_id=uuid                 # Filter by plan
       ?status=string                # Filter by status
POST   /api/executions               # Start new execution
GET    /api/executions/:id           # Get execution details
DELETE /api/executions/:id           # Cancel execution
```

### WebSocket Protocol (Phoenix Channels)

#### Channel: `workflow:execution:{execution_context_id}`

##### Server → Client Events

```typescript
// Token movement
interface TokenMovedEvent {
  event: 'token:moved';
  payload: {
    token_id: string;
    from_step_id: string;
    to_step_id: string;
  };
}

// Parallel fork creates new token
interface TokenCreatedEvent {
  event: 'token:created';
  payload: {
    token_id: string;
    step_id: string;
    parent_token_id: string;
  };
}

// Token completed step
interface TokenCompletedEvent {
  event: 'token:completed';
  payload: {
    token_id: string;
    step_id: string;
  };
}

// Token failed at step
interface TokenFailedEvent {
  event: 'token:failed';
  payload: {
    token_id: string;
    step_id: string;
    error: {
      message: string;
      stack?: string;
    };
  };
}

// Step execution started
interface StepStartedEvent {
  event: 'step:started';
  payload: {
    step_id: string;
    token_id: string;
    started_at: string;
  };
}

// Step execution completed
interface StepCompletedEvent {
  event: 'step:completed';
  payload: {
    step_id: string;
    token_id: string;
    result: Record<string, unknown>;
    duration_ms: number;
  };
}

// Context/blackboard updated
interface ContextUpdatedEvent {
  event: 'context:updated';
  payload: {
    data: Record<string, unknown>;
    changed_keys: string[];
  };
}

// Execution completed
interface ExecutionCompletedEvent {
  event: 'execution:completed';
  payload: {
    status: 'completed' | 'failed';
    completed_at: string;
  };
}

// Execution failed
interface ExecutionFailedEvent {
  event: 'execution:failed';
  payload: {
    error: {
      message: string;
      stack?: string;
    };
  };
}
```

##### Client → Server Events

```typescript
// Start execution
interface ExecuteStartEvent {
  event: 'execute:start';
  payload: {};
}

// Manual advance (debug mode)
interface ExecuteAdvanceEvent {
  event: 'execute:advance';
  payload: {
    token_id: string;
  };
}

// Cancel execution
interface ExecuteCancelEvent {
  event: 'execute:cancel';
  payload: {};
}
```

---

## User Interface Requirements

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Toolbar (zoom, undo/redo, run, save, mode selector)    │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  Node    │      Canvas                                  │
│  Palette │      (React Flow workflow DAG)               │
│          │                                              │
│  - Step  │                              ┌───────────────┤
│    types │                              │  Properties   │
│  - Cmd   │                              │  Panel        │
│    types │                              │  (collapsible)│
│          │                              │               │
├──────────┴──────────────────────────────┴───────────────┤
│  Minimap / Execution Status Bar                         │
└─────────────────────────────────────────────────────────┘
```

### Space Optimization
- Collapsible palette (full → icon-only mode)
- Properties panel as slide-over or bottom drawer
- Toggleable minimap
- Compact toolbar for embedded context

### Node Visual Specifications

| Step Type | Shape | Dimensions | Icon | Border |
|-----------|-------|------------|------|--------|
| action | Rounded rectangle | 180x60 | Command-specific | 1px solid |
| decision | Diamond | 100x100 | GitBranch | 1px solid |
| wait | Rounded rectangle | 150x60 | Clock | 1px dashed |
| subprocess | Rounded rectangle | 180x60 | Layers | 2px solid |
| join | Horizontal bar | 120x30 | Merge | 1px solid |
| terminal | Circle/rounded rect | 80x80 | Flag | 2px solid |

### Edge Visual Specifications

| Transition Type | Line Style | Arrow | Label Style |
|-----------------|------------|-------|-------------|
| standard | Solid, 2px | Filled triangle | Condition name, rounded bg |
| parallel_fork | Solid, 2px | Double arrow | "Fork" badge |
| default | Dashed, 2px | Filled triangle | "Default" italic |

### Execution State Styling

| Status | Background | Border | Animation |
|--------|------------|--------|-----------|
| pending | gray-100 | gray-300 | none |
| active | blue-100 | blue-500 | pulse (opacity) |
| in_progress | yellow-100 | yellow-500 | pulse (opacity) |
| completed | green-100 | green-500 | none |
| failed | red-100 | red-500 | none |
| waiting | orange-100 | orange-500 | subtle pulse |
| blocked | white | red-500 (2px) | none |

---

## Interaction Specifications

### Core Interactions

| Action | Trigger | Behavior |
|--------|---------|----------|
| Add node | Drag from palette | Creates node at drop position |
| Add node | Click "+" between nodes | Inserts node inline |
| Select node | Click | Shows properties panel, blue selection ring |
| Multi-select | Shift+click or lasso | Multiple nodes selected |
| Connect | Drag output handle → input handle | Creates transition |
| Delete | Select + Delete/Backspace | Removes node(s) and connected edges |
| Pan | Middle mouse drag, Space+drag | Canvas panning |
| Zoom | Scroll wheel, Ctrl+/-, pinch | Canvas zoom (0.25x to 4x) |
| Undo | Ctrl+Z | Revert last action |
| Redo | Ctrl+Shift+Z | Re-apply undone action |
| Copy | Ctrl+C | Copy selected nodes |
| Paste | Ctrl+V | Paste at cursor position |
| Auto-layout | Toolbar button | Reorganize nodes with ELKjs |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Delete/Backspace | Delete selection |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Ctrl+C | Copy |
| Ctrl+V | Paste |
| Ctrl+A | Select all |
| Escape | Deselect all |
| Ctrl+S | Save workflow |
| Space+drag | Pan canvas |
| Ctrl+= | Zoom in |
| Ctrl+- | Zoom out |
| Ctrl+0 | Fit to view |

---

## Execution Modes

| Mode | Editing | Execution | UI Changes |
|------|---------|-----------|------------|
| Design | Full | None | Normal editor UI |
| Run | Disabled | Live | Locked canvas, execution status visible |
| Debug | Disabled | Manual | "Advance" button, step highlighting |
| Replay | Disabled | Historical | Timeline scrubber, animation controls |

---

## Permission-Based UI

| Permission | Visible Elements | Disabled Elements |
|------------|------------------|-------------------|
| canView only | Read-only canvas, execution viewer | All edit controls, run button |
| canView + canExecute | Read-only canvas, run button | All edit controls |
| canEdit | Full editor | Run button (without canExecute) |
| canEdit + canExecute | Full editor and run button | None |
| canCreate | "New workflow" button | N/A |

---

## Performance Requirements

- Initial load: < 2s for workflows up to 100 nodes
- Render: 60fps during pan/zoom with up to 200 nodes
- WebSocket latency: < 100ms visible update after event
- Auto-layout: < 500ms for 50 nodes

---

## Security Considerations

- Sanitize all user input in node configuration
- Validate parameter values against CommandType.parameter_schema
- Escape HTML in condition expressions display
- Use secure WebSocket connections (wss://)
- Respect RBAC permissions in all API calls

---

## Integration Points

### Backend Integration
- REST API for CRUD operations on Plans, Steps, Transitions
- WebSocket for real-time execution updates
- CommandType catalog loaded on initialization

### Embedding Requirements
- Exportable as ES module or UMD bundle
- CSS isolation (scoped styles or CSS-in-JS)
- Configurable API base URL
- Theme customization support
- Event callbacks for parent application integration

---

## References

- [React Flow Documentation](https://reactflow.dev/)
- [React Flow Workflow Editor Template](https://reactflow.dev/ui/templates/workflow-editor)
- [ELKjs Documentation](https://github.com/kieler/elkjs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Phoenix Channels JS](https://hexdocs.pm/phoenix/js/)
- [HubSpot Workflow Builder](https://community.hubspot.com/t5/Releases-and-Updates/Introducing-a-Visual-Editing-Interface-for-Your-Workflows/ba-p/417980)
- [Temporal Timeline View](https://temporal.io/blog/lets-visualize-a-workflow)
