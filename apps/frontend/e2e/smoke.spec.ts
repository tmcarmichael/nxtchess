import { test, expect } from '@playwright/test';

/**
 * Smoke tests for NXT Chess frontend.
 * These tests verify critical user flows work end-to-end.
 * Designed to run fast (<30s total) with minimal setup.
 */

// Helper to click a chess square
const clickSquare = (page: import('@playwright/test').Page, square: string) =>
  page.locator(`[data-square="${square}"]`).click();

// Helper to wait for square to have a piece (checking for img inside)
const expectPieceOnSquare = (page: import('@playwright/test').Page, square: string) =>
  expect(page.locator(`[data-square="${square}"] img`)).toBeVisible();

// Helper to wait for square to be highlighted as last move
const expectLastMove = (page: import('@playwright/test').Page, square: string) =>
  expect(page.locator(`[data-square="${square}"]`)).toHaveClass(/lastMove/);

test.describe('Smoke Tests', () => {
  test('home page loads with Play Now button', async ({ page }) => {
    await page.goto('/');

    // Verify hero section loads
    await expect(page.getByRole('button', { name: 'Play Now' })).toBeVisible();

    // Verify knight image loads (decorative element)
    await expect(page.getByAltText('Faded Knight Hero Image')).toBeVisible();
  });

  test('single-player: quick play starts game and AI responds', async ({ page }) => {
    await page.goto('/');

    // Click Play Now - this starts a quick game with random settings
    await page.getByRole('button', { name: 'Play Now' }).click();

    // Should navigate to /play
    await expect(page).toHaveURL('/play');

    // Wait for chess board to render (64 squares)
    await expect(page.locator('[data-square]')).toHaveCount(64);

    // Wait for engine to initialize - board should be interactive
    // The engine overlay should disappear when ready
    await expect(page.locator('text=Loading')).not.toBeVisible({ timeout: 15000 });

    // Check which color the player was assigned (shown in the side panel)
    const playingWhite = await page.getByText('You play White').isVisible();
    const playingBlack = await page.getByText('You play Black').isVisible();

    if (playingWhite) {
      // Player is White - make e2-e4
      await clickSquare(page, 'e2');
      await clickSquare(page, 'e4');

      // Verify move was made
      await expectPieceOnSquare(page, 'e4');

      // Wait for AI (black) to respond
      await expect(async () => {
        const blackPieceOnRank5or6 = page.locator(
          '[data-square$="5"] img[src*="/b"], [data-square$="6"] img[src*="/b"]'
        );
        const count = await blackPieceOnRank5or6.count();
        expect(count).toBeGreaterThan(0);
      }).toPass({ timeout: 15000 });
    } else if (playingBlack) {
      // Player is Black - AI moves first, then we respond with e7-e5
      // Wait for AI (white) to move first
      await expect(async () => {
        const whitePieceOnRank3or4 = page.locator(
          '[data-square$="3"] img[src*="/w"], [data-square$="4"] img[src*="/w"]'
        );
        const count = await whitePieceOnRank3or4.count();
        expect(count).toBeGreaterThan(0);
      }).toPass({ timeout: 15000 });

      // Now make our move: e7-e5
      await clickSquare(page, 'e7');
      await clickSquare(page, 'e5');

      // Verify move was made
      await expectPieceOnSquare(page, 'e5');
    } else {
      throw new Error('Could not determine player color');
    }
  });

  test('multiplayer: create game shows waiting overlay with share link', async ({ page }) => {
    // Navigate to home and open play modal via header
    await page.goto('/');

    // Click Play in header to open modal (it's a span, not a button)
    await page.locator('header').getByText('Play').click();

    // Modal should appear
    await expect(page.getByText('Play Against Computer')).toBeVisible();

    // Select Human opponent
    await page.getByRole('button', { name: 'Human' }).click();

    // Modal title should change
    await expect(page.getByText('Create Online Game')).toBeVisible();

    // Click Create Game button (the main action button, not the mode selector)
    // Use .last() since the mode button appears first, action button second
    await page.getByRole('button', { name: 'Create Game' }).last().click();

    // Should navigate to /play
    await expect(page).toHaveURL('/play');

    // Waiting overlay should appear
    await expect(page.getByText('Waiting for Opponent')).toBeVisible();

    // Share link should be visible (contains /play/ in the URL)
    await expect(page.locator('code')).toContainText('/play/');

    // Copy button should be present
    await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible();
  });

  test('training mode: starts game with eval bar', async ({ page }) => {
    await page.goto('/');

    // Click Training in header (it's a span, not a button)
    await page.locator('header').getByText('Training').click();

    // Training modal should appear
    await expect(page.getByText('Training Options')).toBeVisible();

    // Start the training game
    await page.getByRole('button', { name: 'Start Training' }).click();

    // Should navigate to /training
    await expect(page).toHaveURL('/training');

    // Wait for board to load
    await expect(page.locator('[data-square]')).toHaveCount(64);

    // Wait for engine
    await expect(page.locator('text=Loading')).not.toBeVisible({ timeout: 15000 });

    // Eval bar should be visible in training mode (it's a vertical bar next to the board)
    // The eval bar has a specific class structure - look for the eval container
    const evalBar = page.locator('[class*="evalBar"], [class*="EvalBar"]');
    await expect(evalBar).toBeVisible();
  });

  test('navigation: 404 page shows for invalid routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');

    // Should show 404 page
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Page not found')).toBeVisible();
  });
});
