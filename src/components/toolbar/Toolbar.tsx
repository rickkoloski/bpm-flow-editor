import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Undo,
  Redo,
  Save,
  Play,
  Pause,
  Bug,
  Layout,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkflowStore, useExecutionStore } from '@/stores'

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

export function Toolbar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const undo = useWorkflowStore((state) => state.undo)
  const redo = useWorkflowStore((state) => state.redo)
  const historyIndex = useWorkflowStore((state) => state.historyIndex)
  const history = useWorkflowStore((state) => state.history)
  const toBackendPlan = useWorkflowStore((state) => state.toBackendPlan)
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId)
  const selectedEdgeId = useWorkflowStore((state) => state.selectedEdgeId)
  const deleteNode = useWorkflowStore((state) => state.deleteNode)
  const deleteEdge = useWorkflowStore((state) => state.deleteEdge)

  const mode = useExecutionStore((state) => state.mode)
  const setMode = useExecutionStore((state) => state.setMode)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1
  const canDelete = selectedNodeId !== null || selectedEdgeId !== null

  const handleSave = useCallback(() => {
    const plan = toBackendPlan()
    if (plan) {
      console.log('Saving plan:', plan)
      // TODO: Call REST API to save
    }
  }, [toBackendPlan])

  const handleAutoLayout = useCallback(() => {
    // TODO: Implement ELKjs auto-layout
    console.log('Auto-layout triggered')
  }, [])

  const handleDelete = useCallback(() => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId)
    } else if (selectedEdgeId) {
      deleteEdge(selectedEdgeId)
    }
  }, [selectedNodeId, selectedEdgeId, deleteNode, deleteEdge])

  const handleRun = useCallback(() => {
    setMode('run')
    // TODO: Connect to WebSocket and start execution
  }, [setMode])

  const handleDebug = useCallback(() => {
    setMode('debug')
    // TODO: Connect to WebSocket in debug mode
  }, [setMode])

  const handleStop = useCallback(() => {
    setMode('design')
    // TODO: Cancel execution
  }, [setMode])

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

      <ToolbarDivider />

      {/* Layout */}
      <ToolbarButton onClick={handleAutoLayout} title="Auto Layout">
        <Layout className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Save */}
      <ToolbarButton onClick={handleSave} title="Save">
        <Save className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Execution controls */}
      {mode === 'design' ? (
        <>
          <ToolbarButton onClick={handleRun} title="Run" variant="primary">
            <Play className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={handleDebug} title="Debug">
            <Bug className="w-4 h-4" />
          </ToolbarButton>
        </>
      ) : (
        <ToolbarButton onClick={handleStop} title="Stop" variant="destructive">
          <Pause className="w-4 h-4" />
        </ToolbarButton>
      )}

      {/* Mode indicator */}
      {mode !== 'design' && (
        <span
          className={cn(
            'ml-2 px-2 py-0.5 text-xs font-medium rounded',
            mode === 'run' && 'bg-green-100 text-green-700',
            mode === 'debug' && 'bg-yellow-100 text-yellow-700',
            mode === 'replay' && 'bg-blue-100 text-blue-700'
          )}
        >
          {mode.toUpperCase()}
        </span>
      )}
    </div>
  )
}
