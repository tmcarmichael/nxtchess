import { test, expect } from '@playwright/test';

const clickSquare = (page: import('@playwright/test').Page, square: string) =>
  page.locator(`[data-square="${square}"]`).click();

const expectPieceOnSquare = (page: import('@playwright/test').Page, square: string) =>
  expect(page.locator(`[data-square="${square}"] img`)).toBeVisible();

test.describe('Smoke Tests', () => {
  test('home page loads with quick play cards', async ({ page }) => {
    await page.goto('/');

    // Verify header navigation loads
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Train' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Analyze' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Puzzles' })).toBeVisible();

    // Verify Quick Play section loads with time control cards
    await expect(page.getByText('Quick Play')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Quick play Bullet 1+0' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Quick play Blitz 3+2' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Quick play Rapid 10+5' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Quick play Classical 30+15' })).toBeVisible();

    // Verify Puzzles section loads (scoped to section to avoid header nav match)
    await expect(page.locator('section').getByText('Puzzles')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mate in 1' })).toBeVisible();
  });

  test('single-player: vs Computer starts game and AI responds', async ({ page }) => {
    await page.goto('/play');

    // PlayHub should render — click "vs Computer" to open AI modal
    await page.getByRole('button', { name: /vs Computer/ }).click();

    // PlayAIModal should appear
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'vs Computer' })).toBeVisible();

    // Select White so color is deterministic
    await page.getByRole('radio', { name: 'Play as White' }).click();

    // Start the game
    await page.getByRole('button', { name: 'Start Game' }).click();

    // Wait for chess board to render (64 squares)
    await expect(page.locator('[data-square]')).toHaveCount(64);

    // Wait for engine to initialize
    await expect(page.locator('text=Loading')).not.toBeVisible({ timeout: 15000 });

    // Player is White — make e2-e4
    await clickSquare(page, 'e2');
    await clickSquare(page, 'e4');

    // Verify move was made
    await expectPieceOnSquare(page, 'e4');

    // Wait for AI (black) to respond — a black piece should appear on rank 5 or 6
    await expect(async () => {
      const blackPieceOnRank5or6 = page.locator(
        '[data-square$="5"] img[src*="/b"], [data-square$="6"] img[src*="/b"]'
      );
      const count = await blackPieceOnRank5or6.count();
      expect(count).toBeGreaterThan(0);
    }).toPass({ timeout: 15000 });
  });

  test('multiplayer: play hub and create game modal', async ({ page }) => {
    await page.goto('/play');

    // PlayHub should render with action buttons
    await expect(page.getByRole('button', { name: /vs Computer/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Game/ })).toBeVisible();

    // Open Games lobby section should be visible
    await expect(page.getByRole('heading', { name: 'Open Games' })).toBeVisible();

    // Join by link input should be visible
    await expect(page.getByPlaceholder('Paste game link or ID')).toBeVisible();

    // Click Create Game to open the modal
    await page.getByRole('button', { name: /Create Game/ }).click();

    // Modal should appear with title "Create Game"
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Create Game' })).toBeVisible();

    // Side selector should be present
    await expect(page.getByRole('radiogroup', { name: 'Choose your color' })).toBeVisible();

    // Close button should work
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('training mode: starts game with eval bar', async ({ page }) => {
    await page.goto('/');

    // Click Train in header to open modal
    await page.getByRole('button', { name: 'Train' }).click();

    // Training modal should appear with title "Train"
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Train' })).toBeVisible();

    // Game phase options should be visible
    await expect(page.getByRole('button', { name: 'Opening' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Endgame' })).toBeVisible();

    // Start the training game
    await page.getByRole('button', { name: 'Start Game' }).click();

    // Should navigate to /training
    await expect(page).toHaveURL('/training');

    // Wait for board to load
    await expect(page.locator('[data-square]')).toHaveCount(64);

    // Wait for engine
    await expect(page.locator('text=Loading')).not.toBeVisible({ timeout: 15000 });

    // Eval bar should be visible in training mode (it has role="img" with aria-label)
    const evalBar = page.getByRole('img', { name: /Position evaluation/ });
    await expect(evalBar).toBeVisible();
  });

  test('navigation: 404 page shows for invalid routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');

    // Should show 404 page
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Page not found')).toBeVisible();
  });
});
