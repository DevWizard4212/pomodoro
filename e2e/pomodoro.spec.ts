import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Clear localStorage to start fresh each test
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

// ─── App loads ──────────────────────────────────────────

test('app loads with correct title', async ({ page }) => {
  await expect(page).toHaveTitle('Pomodoro Timer')
})

test('timer view is shown by default', async ({ page }) => {
  await expect(page.getByText('25:00')).toBeVisible()
  await expect(page.getByText('Focus')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible()
})

test('shows session counter', async ({ page }) => {
  await expect(page.getByText('Session 0 / 4')).toBeVisible()
})

// ─── Navigation ─────────────────────────────────────────

test('navigate to Stats tab', async ({ page }) => {
  await page.getByRole('button', { name: 'Stats' }).click()
  await expect(page.getByText('Statistics')).toBeVisible()
  await expect(page.getByText('Total sessions')).toBeVisible()
  await expect(page.getByText('Streak')).toBeVisible()
})

test('navigate to Settings tab', async ({ page }) => {
  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await expect(page.getByText('Focus duration (min)')).toBeVisible()
  await expect(page.getByText('Short break (min)')).toBeVisible()
})

test('navigate back to Timer from Settings', async ({ page }) => {
  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await page.getByRole('button', { name: 'Timer' }).click()
  await expect(page.getByText('25:00')).toBeVisible()
})

// ─── Timer controls ─────────────────────────────────────

test('Start button starts timer and becomes Pause', async ({ page }) => {
  await page.getByRole('button', { name: 'Start' }).click()
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
  // Timer should be counting down — wait for it to tick
  await expect(page.getByText('24:59')).toBeVisible({ timeout: 3000 })
})

test('Pause and Resume work', async ({ page }) => {
  await page.getByRole('button', { name: 'Start' }).click()
  await expect(page.getByText('24:59')).toBeVisible({ timeout: 3000 })

  await page.getByRole('button', { name: 'Pause' }).click()
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible()

  // Time should be frozen while paused
  const timeText = await page.locator('.font-mono').textContent()
  await page.waitForTimeout(1500)
  const timeAfter = await page.locator('.font-mono').textContent()
  expect(timeText).toBe(timeAfter)
})

test('Reset restores original time', async ({ page }) => {
  await page.getByRole('button', { name: 'Start' }).click()
  await expect(page.getByText('24:59')).toBeVisible({ timeout: 3000 })

  await page.getByRole('button', { name: 'Reset' }).click()
  await expect(page.getByText('25:00')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible()
})

test('Skip moves to Short Break', async ({ page }) => {
  await page.getByRole('button', { name: 'Skip' }).click()
  await expect(page.getByText('Short Break')).toBeVisible()
  await expect(page.getByText('05:00')).toBeVisible()
})

test('Skip twice goes Short Break → Focus', async ({ page }) => {
  await page.getByRole('button', { name: 'Skip' }).click()
  await expect(page.getByText('Short Break')).toBeVisible()

  await page.getByRole('button', { name: 'Skip' }).click()
  await expect(page.getByText('Focus')).toBeVisible()
  await expect(page.getByText('25:00')).toBeVisible()
})

// ─── Full cycle: reach Long Break ───────────────────────

test('skip alternates between Focus and Short Break', async ({ page }) => {
  // Skip from focus → short break
  await page.getByRole('button', { name: 'Skip' }).click()
  await expect(page.getByText('Short Break')).toBeVisible()

  // Skip from short break → focus
  await page.getByRole('button', { name: 'Skip' }).click()
  await expect(page.getByText('Focus')).toBeVisible()

  // Skip from focus → short break again (skip doesn't increment focusCount)
  await page.getByRole('button', { name: 'Skip' }).click()
  await expect(page.getByText('Short Break')).toBeVisible()

  // Each skip resets timer to idle
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible()
})

// ─── Settings ───────────────────────────────────────────

test('changing focus duration updates timer', async ({ page }) => {
  await page.getByRole('button', { name: 'Settings' }).click()

  const focusInput = page.locator('input[type="number"]').first()
  await focusInput.fill('10')

  await page.getByRole('button', { name: 'Timer' }).click()
  await expect(page.getByText('10:00')).toBeVisible()
})

test('settings are persisted in localStorage', async ({ page }) => {
  await page.getByRole('button', { name: 'Settings' }).click()

  const focusInput = page.locator('input[type="number"]').first()
  await focusInput.fill('15')

  // Reload and check persistence
  await page.reload()
  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page.locator('input[type="number"]').first()).toHaveValue('15')
})

// ─── Stats ──────────────────────────────────────────────

test('stats page shows zero state', async ({ page }) => {
  await page.getByRole('button', { name: 'Stats' }).click()
  await expect(page.getByText('0 / 8')).toBeVisible()         // today: 0/8
  await expect(page.getByText('Total sessions')).toBeVisible()
  await expect(page.getByText('Total focus')).toBeVisible()
  await expect(page.getByText('Focus minutes — last 7 days')).toBeVisible()
})
