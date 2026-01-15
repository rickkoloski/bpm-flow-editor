/**
 * PaletteContent - Reusable palette content for embedding in different containers.
 *
 * This component contains the core palette functionality (search, step types, commands)
 * without the outer container styling, making it suitable for use in tab panels.
 */

import { useState, useCallback } from 'react'
import {
  Play,
  GitBranch,
  Clock,
  Layers,
  Merge,
  Flag,
  Search,
} from 'lucide-react'
import { cn } from '@wf/lib/utils'
import { useWorkflowStore } from '@wf/stores'
import type { StepType, CommandType } from '@wf/types'

interface PaletteItem {
  type: StepType
  label: string
  icon: React.ReactNode
  description: string
}

// Fixed card width for widget-like appearance
const CARD_WIDTH = 140

// Palette card component
interface PaletteCardProps {
  label: string
  icon: React.ReactNode
  description: string
  onDragStart: (e: React.DragEvent) => void
}

function PaletteCard({ label, icon, description, onDragStart }: PaletteCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{ width: CARD_WIDTH }}
      className={cn(
        'p-3 bg-background border rounded-lg cursor-grab',
        'hover:border-primary hover:shadow-sm transition-all',
        'flex flex-col items-center text-center'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-sm">{label}</span>
        <span className="text-primary flex-shrink-0">{icon}</span>
      </div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
  )
}

const stepTypes: PaletteItem[] = [
  {
    type: 'action',
    label: 'Action',
    icon: <Play className="w-4 h-4" />,
    description: 'Executes a command',
  },
  {
    type: 'decision',
    label: 'Decision',
    icon: <GitBranch className="w-4 h-4" />,
    description: 'Routes via conditions',
  },
  {
    type: 'wait',
    label: 'Wait',
    icon: <Clock className="w-4 h-4" />,
    description: 'Pauses until event/timeout',
  },
  {
    type: 'subprocess',
    label: 'Subprocess',
    icon: <Layers className="w-4 h-4" />,
    description: 'Invokes another plan',
  },
  {
    type: 'join',
    label: 'Join',
    icon: <Merge className="w-4 h-4" />,
    description: 'Waits for parallel tokens',
  },
  {
    type: 'terminal',
    label: 'Terminal',
    icon: <Flag className="w-4 h-4" />,
    description: 'End state',
  },
]

export interface PaletteContentProps {
  /** Number of columns for the grid layout (default: 2) */
  columns?: number
  /** Optional class name for the container */
  className?: string
}

export function PaletteContent({ columns = 2, className }: PaletteContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const commandTypes = useWorkflowStore((state) => state.commandTypes)

  const onDragStart = useCallback(
    (
      event: React.DragEvent,
      nodeType: StepType,
      commandTypeId?: string
    ) => {
      event.dataTransfer.setData('application/reactflow/type', nodeType)
      if (commandTypeId) {
        event.dataTransfer.setData('application/reactflow/commandTypeId', commandTypeId)
      }
      event.dataTransfer.effectAllowed = 'move'
    },
    []
  )

  // Group command types by category
  const commandTypesByCategory = commandTypes
    .filter((ct) => ct.ui_metadata.palette_visible && ct.status === 'active')
    .reduce<Record<string, CommandType[]>>((acc, ct) => {
      const category = ct.ui_metadata.category || 'Other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(ct)
      return acc
    }, {})

  const filteredStepTypes = stepTypes.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCommandTypes = Object.entries(commandTypesByCategory).reduce<
    Record<string, CommandType[]>
  >((acc, [category, types]) => {
    const filtered = types.filter(
      (ct) =>
        ct.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ct.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (filtered.length > 0) {
      acc[category] = filtered
    }
    return acc
  }, {})

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Search */}
      <div className="p-3 border-b flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Step Types Section */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Step Types
          </h3>
          <div
            className="grid gap-2 justify-center"
            style={{ gridTemplateColumns: `repeat(${columns}, ${CARD_WIDTH}px)` }}
          >
            {filteredStepTypes.map((item) => (
              <PaletteCard
                key={item.type}
                label={item.label}
                icon={item.icon}
                description={item.description}
                onDragStart={(e) => onDragStart(e, item.type)}
              />
            ))}
          </div>
        </div>

        {/* Command Types Section */}
        {Object.keys(filteredCommandTypes).length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Commands
            </h3>
            {Object.entries(filteredCommandTypes).map(([category, types]) => (
              <div key={category} className="mb-3">
                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                  {category}
                </h4>
                <div
                  className="grid gap-2 justify-center"
                  style={{ gridTemplateColumns: `repeat(${columns}, ${CARD_WIDTH}px)` }}
                >
                  {types.map((ct) => (
                    <PaletteCard
                      key={ct.id}
                      label={ct.name}
                      icon={ct.ui_metadata.icon || <Play className="w-4 h-4" />}
                      description={ct.description}
                      onDragStart={(e) => onDragStart(e, 'action', ct.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
