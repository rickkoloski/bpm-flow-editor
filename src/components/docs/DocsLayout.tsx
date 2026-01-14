import { Outlet, Link, useLocation } from 'react-router-dom'
import { cn } from '@wf/lib/utils'
import { ChevronRight, Home } from 'lucide-react'

interface NavItem {
  title: string
  href: string
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    title: 'Getting Started',
    href: '/docs',
    children: [
      { title: 'Introduction', href: '/docs' },
      { title: 'Installation', href: '/docs/installation' },
      { title: 'Quick Start', href: '/docs/quick-start' },
    ],
  },
  {
    title: 'Components',
    href: '/docs/components',
    children: [
      { title: 'WorkflowEditor', href: '/docs/components/workflow-editor' },
      { title: 'Palette', href: '/docs/components/palette' },
      { title: 'Nodes', href: '/docs/components/nodes' },
      { title: 'Edges', href: '/docs/components/edges' },
    ],
  },
  {
    title: 'Guides',
    href: '/docs/guides',
    children: [
      { title: 'Data Binding', href: '/docs/guides/data-binding' },
      { title: 'Customization', href: '/docs/guides/customization' },
      { title: 'State Management', href: '/docs/guides/state-management' },
    ],
  },
]

function NavSection({ item, level = 0 }: { item: NavItem; level?: number }) {
  const location = useLocation()
  const isActive = location.pathname === item.href
  const hasActiveChild = item.children?.some(
    (child) => location.pathname === child.href
  )

  return (
    <div className={cn(level > 0 && 'ml-3')}>
      <Link
        to={item.href}
        className={cn(
          'flex items-center gap-2 py-1.5 text-sm transition-colors',
          level === 0 && 'font-semibold text-foreground',
          level > 0 && 'text-muted-foreground hover:text-foreground',
          isActive && level > 0 && 'text-primary font-medium'
        )}
      >
        {level === 0 && (hasActiveChild || isActive) && (
          <ChevronRight className="w-3 h-3" />
        )}
        {item.title}
      </Link>
      {item.children && (
        <div className="mt-1 space-y-0.5">
          {item.children.map((child) => (
            <NavSection key={child.href} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function DocsLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Home className="w-4 h-4" />
            <span>Back to Editor</span>
          </Link>
        </div>
        <div className="p-4 border-b">
          <h1 className="font-bold text-lg">BPM Flow Editor</h1>
          <p className="text-xs text-muted-foreground mt-1">Documentation</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-4">
          {navigation.map((item) => (
            <NavSection key={item.href} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t text-xs text-muted-foreground">
          v0.1.0
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
