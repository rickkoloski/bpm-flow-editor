import { memo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react'
import type { WorkflowEdge } from '@/types'
import { useWorkflowStore } from '@/stores'

function StandardEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<WorkflowEdge>) {
  const defaultPathType = useWorkflowStore((state) => state.defaultEdgePathType)
  const pathType = data?.pathType || defaultPathType

  // Get the path based on the path type
  const pathParams = {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  }

  const [edgePath, labelX, labelY] = pathType === 'smoothstep'
    ? getSmoothStepPath(pathParams)
    : getBezierPath(pathParams)

  // Display custom label if present, otherwise show condition name
  const displayLabel = data?.label || data?.condition?.name

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? 'hsl(var(--primary))' : 'hsl(var(--border))',
          strokeWidth: selected ? 2 : 1.5,
        }}
      />
      {displayLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="bg-white border border-border rounded px-2 py-0.5 text-xs shadow-sm"
          >
            {displayLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export const StandardEdge = memo(StandardEdgeComponent)
