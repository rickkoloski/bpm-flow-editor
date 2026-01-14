import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Undo,
  Redo,
  Trash2,
} from 'lucide-react'
import { cn } from '@wf/lib/utils'
import { useWorkflowStore } from '@wf/stores'

interface ToolbarButtonProps {
  onClick: () => void
  disabled?: boolean
  title: string
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'destructive'
}

function ToolbarButton({
  onClick,
  disabled,
  title,
  children,
  variant = 'default',
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'default' && 'hover:bg-accent',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
      )}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-border mx-1" />
}

/**
 * Editor toolbar with canvas and editing controls.
 *
 * Execution controls (Start, Next Step, Stop) are managed by the host
 * application (WorkflowMonitor) rather than the widget itself.
 */
export function Toolbar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const undo = useWorkflowStore((state) => state.undo)
  const redo = useWorkflowStore((state) => state.redo)
  const historyIndex = useWorkflowStore((state) => state.historyIndex)
  const history = useWorkflowStore((state) => state.history)
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId)
  const selectedEdgeId = useWorkflowStore((state) => state.selectedEdgeId)
  const deleteNode = useWorkflowStore((state) => state.deleteNode)
  const deleteEdge = useWorkflowStore((state) => state.deleteEdge)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1
  const canDelete = selectedNodeId !== null || selectedEdgeId !== null

  const handleDelete = useCallback(() => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId)
    } else if (selectedEdgeId) {
      deleteEdge(selectedEdgeId)
    }
  }, [selectedNodeId, selectedEdgeId, deleteNode, deleteEdge])

  return (
    <div className="flex items-center gap-1 bg-background border rounded-lg shadow-md px-2 py-1">
      {/* Zoom controls */}
      <ToolbarButton onClick={() => zoomOut()} title="Zoom Out">
        <ZoomOut className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => zoomIn()} title="Zoom In">
        <ZoomIn className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => fitView()} title="Fit View">
        <Maximize className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* History controls */}
      <ToolbarButton onClick={undo} disabled={!canUndo} title="Undo">
        <Undo className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={redo} disabled={!canRedo} title="Redo">
        <Redo className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Delete */}
      <ToolbarButton onClick={handleDelete} disabled={!canDelete} title="Delete Selected">
        <Trash2 className="w-4 h-4" />
      </ToolbarButton>
    </div>
  )
}
