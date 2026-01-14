import { DocsPage } from '../DocsPage'

const content = `
# Data Binding

This guide explains how data flows between your backend API and the BPM Flow Editor UI.

## Overview

The editor uses a two-layer data model:

1. **Backend Model** - \`Plan\`, \`Step\`, \`Transition\`, \`Command\`, \`Condition\`
2. **UI Model** - React Flow \`Node\` and \`Edge\` objects

The Zustand store handles conversion between these layers, so your API only deals with the backend model.

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                      Backend API                        │
│                                                         │
│   Plan { steps, transitions, commands, conditions }    │
└─────────────────────────┬───────────────────────────────┘
                          │
                    setPlan() ↓ ↑ toBackendPlan()
                          │
┌─────────────────────────┴───────────────────────────────┐
│                    Zustand Store                        │
│                                                         │
│   nodes: WorkflowNode[]    edges: WorkflowEdge[]       │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  React Flow Canvas                      │
└─────────────────────────────────────────────────────────┘
\`\`\`

## Backend Data Model

### Plan

The root entity representing a complete workflow definition.

\`\`\`typescript
interface Plan {
  id: string
  name: string
  description?: string
  start_step_id?: string
  steps: Step[]
  transitions: Transition[]
  conditions: Condition[]
  commands: Command[]
  version?: number
  created_at?: string
  updated_at?: string
}
\`\`\`

### Step

A node in the workflow graph. Maps to a React Flow node.

\`\`\`typescript
interface Step {
  id: string
  plan_id: string
  step_type: 'action' | 'decision' | 'wait' | 'subprocess' | 'join' | 'terminal'
  name: string
  description?: string
  command_id?: string      // Reference to Command (for action steps)
  config?: Record<string, unknown>
  position: { x: number; y: number }
}
\`\`\`

### Transition

An edge connecting two steps. Maps to a React Flow edge.

\`\`\`typescript
interface Transition {
  id: string
  plan_id: string
  from_step_id: string     // Source node ID
  to_step_id: string       // Target node ID
  transition_type: 'standard' | 'parallel_fork' | 'default'
  condition_id?: string    // Reference to Condition (for decision branches)
}
\`\`\`

### Command

A configured instance of a command type with user-provided parameters.

\`\`\`typescript
interface Command {
  id: string
  command_type_id: string  // Reference to CommandType catalog
  parameters: Record<string, unknown>
}
\`\`\`

### Condition

A routing condition for decision branches.

\`\`\`typescript
interface Condition {
  id: string
  name: string
  expression: string       // e.g., "result.status === 'approved'"
  priority?: number        // Evaluation order
}
\`\`\`

### CommandType

Catalog entry defining available commands (loaded from API).

\`\`\`typescript
interface CommandType {
  id: string
  name: string
  description: string
  parameter_schema: Record<string, ParameterSchema>
  result_schema?: Record<string, ParameterSchema>
  ui_metadata: {
    icon?: string
    category: string
    palette_visible: boolean
    color?: string
  }
  status: 'active' | 'deprecated' | 'draft'
}
\`\`\`

## Loading Data

### Loading a Plan

Use \`setPlan()\` to load a workflow from your API:

\`\`\`typescript
import { useWorkflowStore } from './stores'

async function loadWorkflow(planId: string) {
  const response = await fetch(\`/api/plans/\${planId}\`)
  const plan: Plan = await response.json()

  // This converts the Plan to React Flow nodes/edges
  useWorkflowStore.getState().setPlan(plan)
}
\`\`\`

### Loading Command Types

Load the command catalog before loading plans so nodes can reference their command types:

\`\`\`typescript
async function loadCommandTypes() {
  const response = await fetch('/api/command-types')
  const types: CommandType[] = await response.json()

  useWorkflowStore.getState().setCommandTypes(types)
}

// Load in sequence
await loadCommandTypes()
await loadWorkflow('plan-123')
\`\`\`

### What setPlan() Does

When you call \`setPlan(plan)\`, the store:

1. **Converts Steps to Nodes** - Creates React Flow nodes with position and data
2. **Resolves Commands** - Attaches the referenced Command to each node
3. **Resolves CommandTypes** - Attaches the CommandType from the catalog
4. **Converts Transitions to Edges** - Creates React Flow edges
5. **Resolves Conditions** - Attaches Condition data to edges

\`\`\`typescript
// Internal conversion (simplified)
const nodes = plan.steps.map((step) => ({
  id: step.id,
  type: step.step_type,           // 'action', 'decision', etc.
  position: step.position,
  data: {
    step,
    command: plan.commands.find(c => c.id === step.command_id),
    commandType: commandTypes.find(ct => ct.id === command?.command_type_id),
  },
}))
\`\`\`

## Saving Data

### Saving a Plan

Use \`toBackendPlan()\` to serialize the current state back to a Plan:

\`\`\`typescript
async function saveWorkflow() {
  const plan = useWorkflowStore.getState().toBackendPlan()

  if (!plan) {
    console.error('No plan loaded')
    return
  }

  await fetch(\`/api/plans/\${plan.id}\`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  })
}
\`\`\`

### What toBackendPlan() Does

The function extracts backend entities from React Flow state:

1. **Extracts Steps** - Pulls step data from nodes, updates positions
2. **Extracts Transitions** - Pulls transition data from edges
3. **Extracts Commands** - Collects all command instances from nodes
4. **Extracts Conditions** - Collects all conditions from edges

\`\`\`typescript
// Internal extraction (simplified)
const steps = nodes.map((node) => ({
  ...node.data.step,
  position: node.position,  // Sync position from React Flow
}))

const transitions = edges.map((edge) => edge.data.transition)
\`\`\`

### Auto-Save

You can implement auto-save by subscribing to store changes:

\`\`\`typescript
import { useEffect } from 'react'
import { useWorkflowStore } from './stores'

function AutoSave() {
  const nodes = useWorkflowStore((state) => state.nodes)
  const edges = useWorkflowStore((state) => state.edges)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveWorkflow()
    }, 1000)  // Debounce 1 second

    return () => clearTimeout(timeoutId)
  }, [nodes, edges])

  return null
}
\`\`\`

## Execution State

During workflow execution, nodes display real-time status updates.

### Execution Data Model

\`\`\`typescript
interface ExecutionContext {
  id: string
  plan_id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  data: Record<string, unknown>  // Blackboard/shared data
  tokens: Token[]
  started_at?: string
  completed_at?: string
}

interface Token {
  id: string
  step_id: string
  status: 'pending' | 'active' | 'in_progress' | 'completed' | 'failed' | 'waiting' | 'blocked'
  created_at: string
}

interface StepResult {
  step_id: string
  token_id: string
  status: 'completed' | 'failed'
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  error?: { message: string; stack?: string }
  started_at: string
  completed_at: string
  duration_ms: number
}
\`\`\`

### Updating Node Execution State

Update nodes with execution state as events arrive:

\`\`\`typescript
function handleExecutionEvent(event: ExecutionEvent) {
  const { updateNode } = useWorkflowStore.getState()

  switch (event.type) {
    case 'token_moved':
      updateNode(event.step_id, {
        executionState: 'active',
        tokens: event.tokens,
      })
      break

    case 'step_completed':
      updateNode(event.step_id, {
        executionState: 'completed',
        result: event.result,
      })
      break

    case 'step_failed':
      updateNode(event.step_id, {
        executionState: 'failed',
        result: event.result,
      })
      break
  }
}
\`\`\`

### WebSocket Integration

Connect to a WebSocket for real-time updates:

\`\`\`typescript
function connectExecution(executionId: string) {
  const ws = new WebSocket(\`wss://api.example.com/executions/\${executionId}/ws\`)

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    handleExecutionEvent(data)
  }

  return ws
}
\`\`\`

### Execution State Rendering

Nodes automatically render execution state through their \`executionState\` data:

| State | Visual |
|-------|--------|
| \`pending\` | Default appearance |
| \`active\` | Highlighted border, pulse animation |
| \`in_progress\` | Progress indicator |
| \`completed\` | Green checkmark |
| \`failed\` | Red X, error details |
| \`waiting\` | Clock icon |
| \`blocked\` | Warning indicator |

## Type Reference

All types are exported from \`@/types\`:

\`\`\`typescript
import type {
  // Core entities
  Plan,
  Step,
  Transition,
  Command,
  CommandType,
  Condition,

  // Step configuration
  StepType,
  TransitionType,
  ParameterSchema,

  // Execution
  ExecutionContext,
  ExecutionState,
  Token,
  StepResult,

  // React Flow wrappers
  WorkflowNode,
  WorkflowNodeData,
  WorkflowEdge,
  WorkflowEdgeData,
} from '@wf/types'
\`\`\`

## Next Steps

- [State Management](/docs/guides/state-management) - Deep dive into the Zustand store
- [Customization](/docs/guides/customization) - Custom node types and styling
- [WorkflowEditor API](/docs/components/workflow-editor) - Component reference
`

export function DataBinding() {
  return <DocsPage content={content} />
}
