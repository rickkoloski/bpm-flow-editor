import { DocsPage } from '../DocsPage'

const content = `
# Installation

Get BPM Flow Editor set up in your React project.

## Requirements

- Node.js 18+
- React 18+
- TypeScript 5+ (recommended)

## Package Installation

\`\`\`bash
npm install @xyflow/react zustand
\`\`\`

## Peer Dependencies

The editor relies on these packages:

| Package | Version | Purpose |
|---------|---------|---------|
| @xyflow/react | ^12.0.0 | Flow diagram rendering |
| zustand | ^4.0.0 | State management |
| lucide-react | ^0.400.0 | Icons |
| tailwindcss | ^3.4.0 | Styling |

## Tailwind Configuration

Add the editor's path to your \`tailwind.config.js\`:

\`\`\`js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    // Add path to editor components if using as package
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
\`\`\`

## CSS Setup

Import the required styles in your main CSS file:

\`\`\`css
@import '@xyflow/react/dist/style.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
\`\`\`

## Next Steps

Once installed, proceed to the [Quick Start](/docs/quick-start) guide to build your first workflow.
`

export function Installation() {
  return <DocsPage content={content} />
}
