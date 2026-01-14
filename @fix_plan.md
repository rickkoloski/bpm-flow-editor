# Ralph Fix Plan

## High Priority (Phase 1: Core Editor)

### Project Setup
- [ ] Initialize React + TypeScript project with Vite
- [ ] Install and configure React Flow, Zustand, ELKjs, shadcn/ui, Tailwind CSS
- [ ] Set up project folder structure (components/, hooks/, stores/, types/, api/)
- [ ] Configure Phoenix.js WebSocket client

### Core Types & Data Structures
- [ ] Define TypeScript types for Step, Transition, Condition, Command, CommandType
- [ ] Define types for Plan and ExecutionContext matching backend schema
- [ ] Create Zustand store for workflow state (nodes, edges, selection)
- [ ] Create Zustand store for execution state (tokens, step states)

### Custom React Flow Nodes
- [ ] Create base WorkflowNode component with common styling
- [ ] Implement ActionNode (rectangle with command icon)
- [ ] Implement DecisionNode (diamond shape with branch icon)
- [ ] Implement WaitNode (rectangle with clock icon)
- [ ] Implement SubprocessNode (rectangle with nested boxes icon)
- [ ] Implement JoinNode (horizontal bar with sync icon)
- [ ] Implement TerminalNode (rounded rect/circle with flag/stop icon)

### Custom React Flow Edges
- [ ] Create base WorkflowEdge component
- [ ] Implement StandardEdge (solid arrow with optional condition label)
- [ ] Implement ParallelForkEdge (arrow with fork symbol)
- [ ] Implement DefaultEdge (dashed arrow with "Default" label)

### Node Palette
- [ ] Create collapsible Palette component
- [ ] Add step type section with all 6 step types
- [ ] Implement CommandType section (loads from GET /api/command_types)
- [ ] Group CommandTypes by ui_metadata.category
- [ ] Add drag-and-drop from palette to canvas

### Canvas & Layout
- [ ] Set up ReactFlow canvas with pan/zoom controls
- [ ] Implement toolbar with zoom in/out, fit view buttons
- [ ] Integrate ELKjs for auto-layout
- [ ] Add "+" insertion pattern between nodes (HubSpot style)

### Properties Panel
- [ ] Create collapsible PropertiesPanel component
- [ ] Display selected node configuration form
- [ ] Generate dynamic form fields from CommandType.parameter_schema
- [ ] Handle property updates and save to node data

### Persistence
- [ ] Implement save workflow to REST API
- [ ] Implement load workflow from REST API
- [ ] Add undo/redo using Zustand middleware

## Medium Priority (Phase 2: Enhanced Editing)

### Navigation & Selection
- [ ] Add Minimap component for navigation
- [ ] Implement copy/paste for nodes
- [ ] Add keyboard shortcuts (delete, undo, redo, copy, paste)
- [ ] Implement multi-select with shift+click and lasso

### Palette Enhancements
- [ ] Add search/filter in palette
- [ ] Implement icon-only collapsed mode for space optimization

### Validation & Conditions
- [ ] Show validation indicators (missing connections, invalid config)
- [ ] Create condition editor modal for transitions
- [ ] Highlight incomplete/invalid nodes

### Subprocess Support
- [ ] Implement subprocess linking (navigate to child plan)
- [ ] Add breadcrumb navigation for nested plans

## Low Priority (Phase 3: Execution & Debugging)

### WebSocket Integration
- [ ] Connect to Phoenix Channel "workflow:execution:{id}"
- [ ] Handle token:moved, token:created, token:completed, token:failed events
- [ ] Handle step:started, step:completed events
- [ ] Handle context:updated, execution:completed, execution:failed events
- [ ] Implement execute:start, execute:advance, execute:cancel client events

### Execution Visualization
- [ ] Apply execution state colors to nodes (pending, active, completed, failed, waiting, blocked)
- [ ] Add pulse animation for active/in_progress nodes
- [ ] Add subtle pulse for waiting nodes
- [ ] Show token positions on graph
- [ ] Visualize multiple tokens for parallel execution
- [ ] Show waiting token count on join nodes

### Debugging Features
- [ ] Create Context Inspector panel to view ExecutionContext.data (blackboard)
- [ ] Create Step Inspector to view step input/output for completed steps
- [ ] Show error details (message, stack) for failed steps
- [ ] Add hover details with start/end times, duration, input/output

### Execution Modes
- [ ] Implement Design mode (full editing, no execution)
- [ ] Implement Run mode (no editing, live execution)
- [ ] Implement Debug mode (manual step-through with execute:advance)
- [ ] Implement Replay mode (animate past execution)

## Low Priority (Phase 4: Polish)

### Theming & Responsiveness
- [ ] Implement dark mode toggle
- [ ] Create responsive/adaptive layout for embedded context
- [ ] Optimize for space-constrained panel

### Accessibility
- [ ] Add keyboard navigation for all controls
- [ ] Add ARIA labels and screen reader support
- [ ] Ensure proper focus management

### Export & Templates
- [ ] Export workflow as PNG/SVG image
- [ ] Export workflow as JSON
- [ ] Create workflow templates system

### Permission-Based UI
- [ ] Hide create/edit controls when lacking canEdit permission
- [ ] Disable execute button without canExecute permission
- [ ] Show read-only mode for canView-only users

## Completed
- [x] Project initialization
- [x] Create Ralph development instructions (PROMPT.md)
- [x] Create prioritized task list (@fix_plan.md)
- [x] Create technical specifications (specs/requirements.md)

## Notes

### Design Patterns to Follow
- **HubSpot**: Progressive disclosure, "+" insertion, top navigation
- **Temporal**: Timeline view for execution visualization

### Anti-Patterns to Avoid (n8n lessons)
- Visual builders becoming unmanageable past complexity thresholds
- "Mess of nodes and edges" problem
- Workflows with numerous nodes straining resources

### Mitigation Strategies
- Progressive complexity (simple by default, power features available)
- Auto-layout to prevent visual clutter
- Batching/pagination for large data workflows
- Hybrid approach: visual + code escape hatch (future)

### Backend Entity Mappings
- UI Node → Backend Step
- UI Edge → Backend Transition
- Start marker → Plan.start_step_id
- Condition label → Condition entity
- Command config → Command + CommandType
