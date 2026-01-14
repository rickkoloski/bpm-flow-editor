import { DocsPage } from '../DocsPage'

const content = `
# BPM Flow Editor

A visual workflow editor for building business process management (BPM) flows using React and React Flow.

## Overview

BPM Flow Editor provides a drag-and-drop interface for designing workflow diagrams. It includes:

- **Visual Canvas** - Pan, zoom, and interact with your workflow
- **Component Palette** - Drag step types onto the canvas
- **Properties Panel** - Configure selected nodes and edges
- **Multiple Node Types** - Action, Decision, Wait, Subprocess, Join, and Terminal

## Features

### Drag & Drop
Drag components from the palette onto the canvas to build your workflow. The palette supports 1, 2, or 3 column layouts.

### Node Types
| Type | Purpose |
|------|---------|
| Action | Executes a command or operation |
| Decision | Routes flow based on conditions |
| Wait | Pauses until an event or timeout |
| Subprocess | Invokes another workflow |
| Join | Synchronizes parallel branches |
| Terminal | Marks end states |

### Edge Customization
Connect nodes with edges that support:
- Curved (Bezier) or orthogonal (Step) paths
- Custom labels
- Condition-based routing

## Quick Links

- [Installation](/docs/installation) - Set up the editor in your project
- [Quick Start](/docs/quick-start) - Build your first workflow
- [WorkflowEditor Component](/docs/components/workflow-editor) - API reference
`

export function Introduction() {
  return <DocsPage content={content} />
}
