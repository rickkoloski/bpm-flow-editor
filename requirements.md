# Workflow Editor UI Requirements

## Overview

A React-based embeddable workflow editing widget for creating, managing, and debugging workflows. This UI sits on top of a custom/proprietary orchestration engine (Elixir/Phoenix) and must serve both technical and business users.

**Key Constraints:**
- Embedded panel context (space-constrained)
- Moderate DAG complexity (branching, parallel paths, conditionals)
- Dual audience: technical users + business users

**Backend Stack:**
- Elixir/Phoenix
- WebSockets (Phoenix Channels) for real-time execution updates
- PostgreSQL with JSONB for flexible schema

---

## Data Model Integration

See `data-model.md` for complete schema. Key mappings:

### Visual Element → Backend Entity

| UI Element | Backend Entity | Notes |
|------------|----------------|-------|
| **Node** | `Step` | All nodes are steps with different `step_type` |
| **Edge** | `Transition` | Directed edge with optional condition |
| **Start marker** | `Plan.start_step_id` | Points to entry step |
| **End node** | `Step` with `step_type: terminal` | Exit points |
| **Condition label** | `Condition` | Attached to transitions |
| **Command config** | `Command` → `CommandType` | Instance + catalog |

### Step Types → Visual Representation

| `step_type` | Shape | Icon | Description |
|-------------|-------|------|-------------|
| `action` | Rectangle | Command icon | Executes a command |
| `decision` | Diamond | Branch icon | Routes via conditions (no execution) |
| `wait` | Rectangle | Clock | Pauses until event/timeout |
| `subprocess` | Rectangle | Nested boxes | Invokes another plan |
| `join` | Horizontal bar | Sync icon | Waits for parallel tokens |
| `terminal` | Rounded rect/circle | Flag/stop | End state |

### Transition Types → Edge Rendering

| `transition_type` | Line Style | Label |
|-------------------|------------|-------|
| `standard` | Solid arrow | Condition name (if any) |
| `parallel_fork` | Arrow + fork symbol | "Fork" |
| `default` | Dashed arrow | "Default" |

### Execution State → Node Coloring

| Token/Step Status | Color | Animation |
|-------------------|-------|-----------|
| `pending` | Gray | None |
| `active` / `in_progress` | Blue/Yellow | Pulse |
| `completed` | Green | None |
| `failed` | Red | None |
| `waiting` | Orange | Subtle pulse |
| `blocked` | Red outline | None |

---

## Command Type System

Commands are dynamically loaded from the backend. The palette queries `GET /api/command_types?status=active`.

### CommandType Sources
1. **Platform commands** - Built into the orchestration engine
2. **Partner libraries** - Per-business-partner command sets
3. **Custom commands** - User-coded operations

### Palette Organization
- Group by `ui_metadata.category`
- Show `ui_metadata.icon` for visual recognition
- Filter by `ui_metadata.palette_visible`
- Display `description` on hover

### Command Configuration
When user drags a CommandType onto canvas:
1. Create a new `Step` with `step_type: action`
2. Create a new `Command` referencing the `CommandType`
3. Properties panel shows form based on `CommandType.parameter_schema`
4. User fills in `Command.parameters`

---

## Real-Time Architecture

### WebSocket Integration (Phoenix Channels)

```
Channel: "workflow:execution:{execution_context_id}"

Events (server → client):
- token:moved      {token_id, from_step_id, to_step_id}
- token:created    {token_id, step_id}  // parallel fork
- token:completed  {token_id, step_id}
- token:failed     {token_id, step_id, error}
- step:started     {step_id, token_id}
- step:completed   {step_id, result}
- context:updated  {data}  // blackboard changed
- execution:completed {status}
- execution:failed    {error}

Events (client → server):
- execute:start    {}
- execute:advance  {token_id}  // manual mode
- execute:cancel   {}
```

### Multi-User Viewing
- Multiple users can subscribe to same execution channel
- All see real-time token movement and state changes
- No collaborative editing (single editor at a time)

---

## Permissions (RBAC)

Component-level permissions (future: per-plan granularity):

| Permission | Description |
|------------|-------------|
| `canView` | Can view workflows and executions |
| `canCreate` | Can create new plans |
| `canEdit` | Can modify existing plans |
| `canExecute` | Can start/stop/advance executions |

UI should:
- Hide create/edit controls when lacking permission
- Disable execute button without `canExecute`
- Show read-only mode for view-only users

---

## Research & Benchmarking

### Reference Implementations

#### HubSpot Workflow Builder (Primary Reference)
HubSpot's visual workflow editor represents our target UX quality:

- **Canvas-based branching logic**: Users envision branches on a visual canvas
- **Progressive disclosure**: Zoom controls toggle between granular branch examination and full-campaign overview
- **Top navigation**: Moves controls from sidebar to top for space efficiency
- **"+" insertion pattern**: Simple interface to add actions at any point
- **Performance tab**: Integrated workflow metrics and monitoring
- **Design philosophy**: "Lighter to learn, easier to use" - visual scaffolding reduces need for external diagramming

#### Zapier Canvas
- Visual automation builder that executes tasks, not just maps processes
- Designed for non-technical teams seeking speed and simplicity
- Balances power user features with accessibility

#### Make (formerly Integromat)
- Drag-and-drop interface displays entire workflow in one view
- Real-time testing and adjustment
- Strong workflow visualization and data movement tracking
- More control over execution logic than linear tools

#### Retool Workflows
- Visual building with ability to drop into JavaScript/Python
- Step-by-step debugging
- Optimized for complex enterprise use cases
- 45+ native integrations plus REST/GraphQL APIs

### Anti-Patterns to Avoid (n8n Lessons)

n8n is widely regarded as powerful but complex:
- Visual builders become unmanageable past certain complexity thresholds
- "Mess of nodes and edges" problem with complex workflows
- Workflows with numerous nodes strain system resources
- Users report difficulty creating end-user interfaces for workflows

**Mitigation strategies:**
- Progressive complexity (simple by default, power features available)
- Auto-layout to prevent visual clutter
- Batching/pagination for large data workflows
- Hybrid approach: visual + code escape hatch

---

## Technical Architecture

### Recommended Stack

| Component | Recommendation | Rationale |
|-----------|---------------|-----------|
| **Workflow Library** | React Flow | Native React, well-documented, active community, customizable nodes/edges |
| **State Management** | Zustand | Simple, efficient, recommended by React Flow templates |
| **Layout Engine** | ELKjs | Automatic node arrangement, handles DAGs well |
| **UI Components** | shadcn/ui + Tailwind | Highly customizable, consistent with React Flow templates |
| **WebSocket Client** | Phoenix.js | Native Phoenix channel support |

### Alternative Libraries Considered

| Library | Pros | Cons |
|---------|------|------|
| JointJS+ | 170+ demos, SVG rendering, graph algorithms | Commercial, less React-native |
| JsPlumb Toolkit | Custom shapes, edge routing, export | Claims React Flow has extensibility limits |
| GoJS | Mature, feature-rich | Commercial, steeper learning curve |

---

## UX Requirements

### Layout: Palette-Canvas-Properties

```
┌─────────────────────────────────────────────────────────┐
│  Toolbar (zoom, undo/redo, run, save)                   │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  Node    │      Canvas                                  │
│  Palette │      (workflow DAG)                          │
│          │                                              │
│  - Step  │                              ┌───────────────┤
│    types │                              │  Properties   │
│  - Cmd   │                              │  Panel        │
│    types │                              │  (collapsible)│
│          │                              │               │
├──────────┴──────────────────────────────┴───────────────┤
│  Minimap / Execution Status                             │
└─────────────────────────────────────────────────────────┘
```

**Space optimization for embedded context:**
- Collapsible palette (icon-only mode)
- Properties panel as slide-over or bottom drawer
- Minimap toggle

### Core Interactions

| Interaction | Pattern | Reference |
|-------------|---------|-----------|
| Add node | Drag from palette OR click "+" on canvas | HubSpot |
| Select node | Click node, shows properties panel | Universal |
| Multi-select | Shift+click or lasso selection | React Flow |
| Connect nodes | Drag from output handle to input handle | Universal |
| Delete | Select + Delete key, or context menu | Universal |
| Pan | Middle-mouse drag or space+drag | Universal |
| Zoom | Scroll wheel, pinch, or +/- buttons | HubSpot, Temporal |

### Progressive Disclosure

1. **Simple view**: Hide advanced options, show essential node config
2. **Advanced view**: Expand to show all configuration options
3. **Code view**: (optional) Show underlying workflow definition as JSON

---

## Execution Visualization & Debugging

### Requirements (Critical Feature)

Based on Temporal's Timeline View patterns:

#### State Representation
- **Color coding**: See "Execution State → Node Coloring" table above
- **Visual indicators**: Animate currently executing node (pulse, glow, spinner)
- **Token visualization**: Show token position(s) on graph

#### Parallelism Visualization
- Multiple tokens shown simultaneously on different branches
- Fork transitions clearly indicate parallel spawn
- Join nodes show waiting token count

#### Debugging Features
- **Hover details**: Show exact start/end times, duration, input/output data
- **Context inspector**: View `ExecutionContext.data` (blackboard) at any point
- **Step inspector**: View step input/output for completed steps
- **Error details**: Full error message and stack for failed steps

### Execution Modes

| Mode | Editing | Execution | Description |
|------|---------|-----------|-------------|
| **Design** | Yes | No | Full editing capabilities |
| **Run** | No | Live | Execute workflow, show live progress |
| **Debug** | No | Manual | Step through with `execute:advance` |
| **Replay** | No | Historical | Animate past execution |

---

## Features Checklist

### Phase 1: Core Editor
- [ ] Visual workflow canvas with pan/zoom
- [ ] Node palette with step types
- [ ] Command type palette (from API)
- [ ] Properties panel for selected node
- [ ] Step types: action, decision, wait, subprocess, join, terminal
- [ ] Edge/transition management with types
- [ ] Auto-layout with ELKjs
- [ ] Save/load via REST API
- [ ] Undo/redo

### Phase 2: Enhanced Editing
- [ ] Minimap for navigation
- [ ] Copy/paste nodes
- [ ] Subprocess linking (navigate to child plan)
- [ ] Keyboard shortcuts
- [ ] Search/filter in palette
- [ ] Validation indicators (missing connections, invalid config)
- [ ] Condition editor for transitions

### Phase 3: Execution & Debugging
- [ ] WebSocket connection to Phoenix channels
- [ ] Live token position visualization
- [ ] Node state color coding
- [ ] Execution animation (token movement)
- [ ] Context inspector panel
- [ ] Step input/output viewer
- [ ] Error highlighting and details
- [ ] Manual advance (debug mode)

### Phase 4: Polish
- [ ] Dark mode
- [ ] Responsive/adaptive layout for embedded context
- [ ] Accessibility (keyboard navigation, screen reader support)
- [ ] Export workflow as image/JSON
- [ ] Workflow templates
- [ ] Permission-based UI (hide/disable based on RBAC)

### Future Considerations
- [ ] Version history (when backend supports)
- [ ] Plan-level permissions
- [ ] Collaborative editing
- [ ] AI-assisted workflow building

---

## Open Questions (Resolved)

| Question | Answer |
|----------|--------|
| Node types | Dynamic: Step types (action, decision, wait, subprocess, join, terminal) + CommandTypes from API |
| Data schema | Relational (see data-model.md), accessed via REST API |
| Real-time updates | WebSockets via Phoenix Channels |
| Multi-user | Execution viewing via shared WebSocket subscription |
| Versioning | Not yet, but anticipated - design for future support |
| Permissions | Component-level RBAC: canView, canCreate, canEdit, canExecute |

---

## References

### Primary Sources
- [HubSpot Visual Workflow Editor](https://community.hubspot.com/t5/Releases-and-Updates/Introducing-a-Visual-Editing-Interface-for-Your-Workflows/ba-p/417980)
- [React Flow](https://reactflow.dev/)
- [React Flow Workflow Editor Template](https://reactflow.dev/ui/templates/workflow-editor)
- [Temporal Timeline View](https://temporal.io/blog/lets-visualize-a-workflow)

### Additional Research
- [Zapier Visual Workflows Guide](https://zapier.com/blog/visual-workflow/)
- [Retool Workflows](https://retool.com/workflows)
- [n8n UX Guidelines](https://docs.n8n.io/integrations/creating-nodes/build/reference/ux-guidelines/)
- [LangChain: Not Another Workflow Builder](https://blog.langchain.com/not-another-workflow-builder/)
- [AWS Step Functions Workflow Studio](https://docs.aws.amazon.com/step-functions/latest/dg/workflow-studio.html)

### Internal
- [Data Model Reference](./data-model.md)
