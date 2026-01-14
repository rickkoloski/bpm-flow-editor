import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check, Download } from 'lucide-react'
import { cn } from '@wf/lib/utils'

interface DocsPageProps {
  content: string
}

export function DocsPage({ content }: DocsPageProps) {
  const [copied, setCopied] = useState(false)

  // Extract title from first h1 for filename
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch?.[1] || 'document'
  const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.md'

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content.trim())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [content])

  const handleDownload = useCallback(() => {
    const blob = new Blob([content.trim()], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [content, filename])

  return (
    <div className="relative">
      {/* Action buttons */}
      <div className="absolute top-0 right-0 flex items-center gap-1">
        <button
          onClick={handleCopy}
          className={cn(
            'p-2 rounded-md transition-colors',
            'hover:bg-accent text-muted-foreground hover:text-foreground',
            copied && 'text-green-600'
          )}
          title={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
        <button
          onClick={handleDownload}
          className="p-2 rounded-md transition-colors hover:bg-accent text-muted-foreground hover:text-foreground"
          title={`Download as ${filename}`}
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <article className="prose prose-slate dark:prose-invert max-w-none pt-2">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold tracking-tight mb-4 pr-20">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-semibold tracking-tight mt-8 mb-4 pb-2 border-b">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-semibold tracking-tight mt-6 mb-3">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="leading-7 text-muted-foreground mb-4">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="my-4 ml-6 list-disc text-muted-foreground space-y-2">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="my-4 ml-6 list-decimal text-muted-foreground space-y-2">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="leading-7">{children}</li>,
            code: ({ className, children, ...props }) => {
              const isInline = !className
              if (isInline) {
                return (
                  <code
                    className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                )
              }
              return (
                <code
                  className={cn('block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono', className)}
                  {...props}
                >
                  {children}
                </code>
              )
            },
            pre: ({ children }) => (
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
                {children}
              </pre>
            ),
            table: ({ children }) => (
              <div className="my-6 w-full overflow-auto">
                <table className="w-full border-collapse border border-border">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-border px-4 py-2 text-left font-semibold bg-muted">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-border px-4 py-2">{children}</td>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="mt-4 border-l-4 border-primary pl-4 italic text-muted-foreground">
                {children}
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  )
}
