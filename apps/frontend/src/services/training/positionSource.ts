import { BACKEND_URL } from '../../shared/config/env';
import type { PositionSource, ResolvedPosition } from './types';

// ============================================================================
// Constants
// ============================================================================

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// ============================================================================
// Position Resolution
// ============================================================================

/**
 * Resolves a position source to an actual FEN string and metadata.
 * Handles fetching from backend APIs when needed.
 *
 * @param source - The position source configuration
 * @returns Promise resolving to FEN and metadata
 * @throws Error if position cannot be resolved
 */
export async function resolvePositionSource(source: PositionSource): Promise<ResolvedPosition> {
  switch (source.type) {
    case 'standard':
      return resolveStandardPosition();

    case 'fen':
      return resolveFenPosition(source.fen);

    case 'backend':
      return resolveBackendPosition(source.endpoint, source.params);

    default: {
      // Exhaustive check - TypeScript will error if we miss a case
      const exhaustiveCheck: never = source;
      throw new Error(`Unknown position source type: ${(exhaustiveCheck as PositionSource).type}`);
    }
  }
}

// ============================================================================
// Position Resolvers
// ============================================================================

/**
 * Returns the standard chess starting position
 */
function resolveStandardPosition(): ResolvedPosition {
  return {
    fen: INITIAL_FEN,
    metadata: {
      sideToMove: 'w',
    },
  };
}

/**
 * Returns the provided FEN with basic metadata extraction
 */
function resolveFenPosition(fen: string): ResolvedPosition {
  // Extract side to move from FEN (second field)
  const parts = fen.split(' ');
  const sideToMove = parts[1] === 'b' ? 'b' : 'w';

  return {
    fen,
    metadata: {
      sideToMove,
    },
  };
}

/**
 * Fetches a position from the backend API
 */
async function resolveBackendPosition(
  endpoint: string,
  params?: Record<string, string>
): Promise<ResolvedPosition> {
  const url = buildBackendUrl(endpoint, params);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include', // Include cookies for authenticated requests
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to fetch training position: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  return parseBackendResponse(data);
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Builds the full backend URL with query parameters
 */
function buildBackendUrl(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(`${BACKEND_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  return url.toString();
}

/**
 * Parses the backend response into ResolvedPosition format.
 * Handles the expected API response structure.
 */
function parseBackendResponse(data: BackendPositionResponse): ResolvedPosition {
  if (!data.fen) {
    throw new Error('Backend response missing required "fen" field');
  }

  // Extract side to move from FEN
  const parts = data.fen.split(' ');
  const sideToMove = parts[1] === 'b' ? 'b' : 'w';

  return {
    fen: data.fen,
    metadata: {
      positionId: data.position_id,
      theme: data.theme,
      difficulty: data.difficulty,
      startingEval: data.initial_eval,
      expectedResult: parseExpectedResult(data.expected_result),
      sideToMove,
    },
  };
}

/**
 * Backend API response structure for training positions
 */
interface BackendPositionResponse {
  position_id?: string;
  fen: string;
  initial_eval?: number;
  theme?: string;
  difficulty?: number;
  side_to_move?: string;
  expected_result?: string;
}

/**
 * Parses expected result string to typed value
 */
function parseExpectedResult(value?: string): 'win' | 'draw' | 'loss' | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === 'win') return 'win';
  if (normalized === 'draw') return 'draw';
  if (normalized === 'loss') return 'loss';
  return undefined;
}
