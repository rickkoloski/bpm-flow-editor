import { DocsPage } from '../DocsPage'

const content = `
# Quick Start

Build your first workflow in under 5 minutes.

## Basic Setup

Wrap your app with \`ReactFlowProvider\` and render the \`WorkflowEditor\`:

\`\`\`tsx
import { ReactFlowProvider } from '@xyflow/react'
import { WorkflowEditor } from './components/WorkflowEditor'

function App() {
  return (
    <div className="h-screen w-screen">
      <ReactFlowProvider>
        <WorkflowEditor />
      </ReactFlowProvider>
    </div>
  )
}
\`\`\`

## Building a Workflow

### 1. Add Nodes

Drag components from the left palette onto the canvas:

1. Drag an **Action** node - this will be your starting point
2. Drag a **Decision** node - for conditional routing
3. Drag two **Terminal** nodes - for end states

### 2. Connect Nodes

Click and drag from a node's handle (the small circles on the edges) to another node to create connections:

1. Connect Action → Decision
2. Connect Decision → Terminal (success path)
3. Connect Decision → Terminal (failure path)

### 3. Configure Properties

Click any node to open the Properties Panel on the right. Here you can:

- Edit the node's name
- Configure step-specific settings
- Add descriptions

### 4. Customize Edges

Click an edge to open the Edge Properties Panel:

- Add labels to describe the transition
- Choose between curved or orthogonal line styles
- Set as default style for new edges

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Delete / Backspace | Delete selected node or edge |
| Ctrl + Z | Undo (coming soon) |
| Ctrl + Shift + Z | Redo (coming soon) |

## Next Steps

- Learn about [Data Binding](/docs/guides/data-binding) to connect your workflow to external data
- Explore [Node Types](/docs/components/nodes) for detailed node configuration
- See [Customization](/docs/guides/customization) for styling options
`

export function QuickStart() {
  return <DocsPage content={content} />
}
