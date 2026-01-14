import { DocsPage } from '../DocsPage'

const content = `
# WorkflowEditor

The main component for rendering the visual workflow editor.

## Import

\`\`\`tsx
import { WorkflowEditor } from './components/WorkflowEditor'
\`\`\`

## Usage

\`\`\`tsx
import { ReactFlowProvider } from '@xyflow/react'
import { WorkflowEditor } from './components/WorkflowEditor'

function App() {
  return (
    <ReactFlowProvider>
      <WorkflowEditor />
    </ReactFlowProvider>
  )
}
\`\`\`

> **Note:** The \`WorkflowEditor\` must be wrapped in a \`ReactFlowProvider\`.

## Component Structure

The WorkflowEditor consists of three main areas:

| Area | Position | Description |
|------|----------|-------------|
| Palette | Left | Draggable component library |
| Canvas | Center | React Flow diagram area |
| Properties Panel | Right | Configuration for selected items |

## Subcomponents

### Palette

The left panel containing draggable node types. Features:

- Collapsible (click chevron to toggle)
- Resizable (drag right edge)
- Searchable
- Snap-to-grid column layouts (1, 2, or 3 columns)

### Canvas

The central React Flow canvas with:

- Pan and zoom controls
- Snap-to-grid (15px)
- Dot pattern background
- Toolbar with actions

### Properties Panel

Context-sensitive panel that shows:

- **Node Properties** when a node is selected
- **Edge Properties** when an edge is selected
- Hidden when nothing is selected

## State Management

The editor uses Zustand for state management. Access the store directly:

\`\`\`tsx
import { useWorkflowStore } from './stores'

function MyComponent() {
  const nodes = useWorkflowStore((state) => state.nodes)
  const edges = useWorkflowStore((state) => state.edges)
  const addNode = useWorkflowStore((state) => state.addNode)

  // Use state and actions...
}
\`\`\`

## Store Actions

| Action | Parameters | Description |
|--------|------------|-------------|
| \`addNode\` | \`(type, position, commandTypeId?)\` | Add a new node |
| \`updateNode\` | \`(id, data)\` | Update node data |
| \`deleteNode\` | \`(id)\` | Remove a node |
| \`selectNode\` | \`(id \\| null)\` | Select or deselect a node |
| \`updateEdge\` | \`(id, data)\` | Update edge data |
| \`selectEdge\` | \`(id \\| null)\` | Select or deselect an edge |

## Customization

See the [Customization Guide](/docs/guides/customization) for:

- Custom node types
- Custom edge styles
- Theme modifications
- Toolbar extensions
`

export function WorkflowEditorDocs() {
  return <DocsPage content={content} />
}
