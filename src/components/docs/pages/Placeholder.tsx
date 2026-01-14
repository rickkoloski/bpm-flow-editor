import { useLocation } from 'react-router-dom'
import { DocsPage } from '../DocsPage'

export function Placeholder() {
  const location = useLocation()
  const path = location.pathname.replace('/docs/', '').replace(/-/g, ' ')
  const title = path
    .split('/')
    .pop()
    ?.split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const content = `
# ${title}

This page is coming soon.

Check back later for documentation on this topic, or contribute to the docs on [GitHub](https://github.com/rickkoloski/bpm-flow-editor).
`

  return <DocsPage content={content} />
}
