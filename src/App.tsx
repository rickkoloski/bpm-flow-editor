import { ReactFlowProvider } from '@xyflow/react'
import { WorkflowEditor } from './components/WorkflowEditor'

function App() {
  return (
    <div className="h-screen w-screen">
      <ReactFlowProvider>
        <WorkflowEditor />
      </ReactFlowProvider>
    </div>
  )
}

export default App
