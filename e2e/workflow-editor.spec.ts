import { test, expect } from '@playwright/test'

test.describe('Workflow Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure clean state
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    // Wait for the editor to load
    await expect(page.getByText('Components')).toBeVisible()
  })

  test.describe('Drag and Drop', () => {
    test('should create an Action node when dragged from palette to canvas', async ({ page }) => {
      // Get the Action palette item
      const actionItem = page.locator('[draggable="true"]').filter({ hasText: 'Action' }).first()

      // Get the canvas (React Flow pane)
      const canvas = page.locator('.react-flow__pane')

      // Verify no nodes exist initially
      await expect(page.locator('.react-flow__node')).toHaveCount(0)

      // Perform drag and drop
      await actionItem.dragTo(canvas)

      // Verify a node was created
      await expect(page.locator('.react-flow__node')).toHaveCount(1)

      // Verify it's an action node with the correct label
      await expect(page.locator('.react-flow__node').getByText('New action')).toBeVisible()
    })

    test('should create a Decision node when dragged from palette to canvas', async ({ page }) => {
      const decisionItem = page.locator('[draggable="true"]').filter({ hasText: 'Decision' }).first()
      const canvas = page.locator('.react-flow__pane')

      await expect(page.locator('.react-flow__node')).toHaveCount(0)

      await decisionItem.dragTo(canvas)

      await expect(page.locator('.react-flow__node')).toHaveCount(1)
      await expect(page.locator('.react-flow__node').getByText('New decision')).toBeVisible()
    })

    test('should create a Wait node when dragged from palette to canvas', async ({ page }) => {
      const waitItem = page.locator('[draggable="true"]').filter({ hasText: 'Wait' }).first()
      const canvas = page.locator('.react-flow__pane')

      await expect(page.locator('.react-flow__node')).toHaveCount(0)

      await waitItem.dragTo(canvas)

      await expect(page.locator('.react-flow__node')).toHaveCount(1)
      await expect(page.locator('.react-flow__node').getByText('New wait')).toBeVisible()
    })

    test('should create a Subprocess node when dragged from palette to canvas', async ({ page }) => {
      const subprocessItem = page.locator('[draggable="true"]').filter({ hasText: 'Subprocess' }).first()
      const canvas = page.locator('.react-flow__pane')

      await expect(page.locator('.react-flow__node')).toHaveCount(0)

      await subprocessItem.dragTo(canvas)

      await expect(page.locator('.react-flow__node')).toHaveCount(1)
      await expect(page.locator('.react-flow__node').getByText('New subprocess')).toBeVisible()
    })

    test('should create a Join node when dragged from palette to canvas', async ({ page }) => {
      const joinItem = page.locator('[draggable="true"]').filter({ hasText: 'Join' }).first()
      const canvas = page.locator('.react-flow__pane')

      await expect(page.locator('.react-flow__node')).toHaveCount(0)

      await joinItem.dragTo(canvas)

      await expect(page.locator('.react-flow__node')).toHaveCount(1)
      await expect(page.locator('.react-flow__node').getByText('New join')).toBeVisible()
    })

    test('should create a Terminal node when dragged from palette to canvas', async ({ page }) => {
      const terminalItem = page.locator('[draggable="true"]').filter({ hasText: 'Terminal' }).first()
      const canvas = page.locator('.react-flow__pane')

      await expect(page.locator('.react-flow__node')).toHaveCount(0)

      await terminalItem.dragTo(canvas)

      await expect(page.locator('.react-flow__node')).toHaveCount(1)
      await expect(page.locator('.react-flow__node').getByText('New terminal')).toBeVisible()
    })

    test('should create multiple nodes when dragged sequentially', async ({ page }) => {
      const canvas = page.locator('.react-flow__pane')

      // Drag an Action node
      const actionItem = page.locator('[draggable="true"]').filter({ hasText: 'Action' }).first()
      await actionItem.dragTo(canvas)
      await expect(page.locator('.react-flow__node')).toHaveCount(1)

      // Drag a Decision node
      const decisionItem = page.locator('[draggable="true"]').filter({ hasText: 'Decision' }).first()
      await decisionItem.dragTo(canvas)
      await expect(page.locator('.react-flow__node')).toHaveCount(2)

      // Drag a Terminal node
      const terminalItem = page.locator('[draggable="true"]').filter({ hasText: 'Terminal' }).first()
      await terminalItem.dragTo(canvas)
      await expect(page.locator('.react-flow__node')).toHaveCount(3)
    })
  })

  test.describe('Node Selection', () => {
    test('should select a node when clicked', async ({ page }) => {
      // First create a node
      const actionItem = page.locator('[draggable="true"]').filter({ hasText: 'Action' }).first()
      const canvas = page.locator('.react-flow__pane')
      await actionItem.dragTo(canvas)

      // Click on the node
      const node = page.locator('.react-flow__node').first()
      await node.click()

      // Verify it has the selected class
      await expect(node).toHaveClass(/selected/)
    })

    test('should deselect node when clicking on canvas', async ({ page }) => {
      // Create and select a node
      const actionItem = page.locator('[draggable="true"]').filter({ hasText: 'Action' }).first()
      const canvas = page.locator('.react-flow__pane')
      await actionItem.dragTo(canvas)

      const node = page.locator('.react-flow__node').first()
      await node.click()
      await expect(node).toHaveClass(/selected/)

      // Click on canvas to deselect
      await canvas.click({ position: { x: 100, y: 100 } })

      // Node should no longer be selected
      await expect(node).not.toHaveClass(/selected/)
    })
  })

  test.describe('Palette', () => {
    test('should display all step types in the palette', async ({ page }) => {
      await expect(page.getByText('Step Types')).toBeVisible()
      await expect(page.locator('[draggable="true"]').filter({ hasText: 'Executes a command' })).toBeVisible()
      await expect(page.locator('[draggable="true"]').filter({ hasText: 'Routes via conditions' })).toBeVisible()
      await expect(page.locator('[draggable="true"]').filter({ hasText: 'Pauses until event/timeout' })).toBeVisible()
      await expect(page.locator('[draggable="true"]').filter({ hasText: 'Invokes another plan' })).toBeVisible()
      await expect(page.locator('[draggable="true"]').filter({ hasText: 'Waits for parallel tokens' })).toBeVisible()
      await expect(page.locator('[draggable="true"]').filter({ hasText: 'End state' })).toBeVisible()
    })

    test('should filter palette items when searching', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search...')

      // All items visible initially
      await expect(page.locator('[draggable="true"]').filter({ hasText: 'Action' })).toBeVisible()
      await expect(page.locator('[draggable="true"]').filter({ hasText: 'Decision' })).toBeVisible()

      // Search for "action"
      await searchInput.fill('action')

      // Only Action should be visible
      await expect(page.locator('[draggable="true"]').filter({ hasText: 'Action' })).toBeVisible()
      await expect(page.locator('[draggable="true"]').filter({ hasText: 'Decision' })).not.toBeVisible()

      // Clear search
      await searchInput.clear()

      // All items visible again
      await expect(page.locator('[draggable="true"]').filter({ hasText: 'Action' })).toBeVisible()
      await expect(page.locator('[draggable="true"]').filter({ hasText: 'Decision' })).toBeVisible()
    })

    test('should collapse and expand palette', async ({ page }) => {
      // Palette is expanded initially
      await expect(page.getByText('Components')).toBeVisible()
      await expect(page.getByText('Step Types')).toBeVisible()

      // Click collapse button
      await page.getByRole('button', { name: 'Collapse palette' }).click()

      // Step Types text should not be visible (collapsed)
      await expect(page.getByText('Step Types')).not.toBeVisible()

      // Click expand button
      await page.getByRole('button', { name: 'Expand palette' }).click()

      // Step Types text should be visible again
      await expect(page.getByText('Step Types')).toBeVisible()
    })
  })
})
