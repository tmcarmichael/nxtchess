import {
  createContext,
  useContext,
  onCleanup,
  onMount,
  createSignal,
  createEffect,
  on,
  type JSX,
} from 'solid-js';
import {
  analysisEngine,
  type EngineAnalysis,
  type EngineInfo,
} from '../../services/engine/analysisEngineService';
import { sessionManager } from '../../services/game/session/SessionManager';
import { createAnalyzeActions } from './actions/createAnalyzeActions';
import { createCoreActions } from './actions/createCoreActions';
import { createChessStore } from './stores/createChessStore';
import { createEngineStore } from './stores/createEngineStore';
import { createTimerStore } from './stores/createTimerStore';
import { createUIStore } from './stores/createUIStore';
import { UnifiedGameContextInstance, type UnifiedGameContext } from './useGameContext';
import type { AnalyzeGameContextValue } from './types';

// ============================================================================
// Context
// ============================================================================

const AnalyzeGameContext = createContext<AnalyzeGameContextValue>();

// ============================================================================
// Extended Context Value for Analyze Mode
// ============================================================================

export interface AnalyzeEngineState {
  enabled: () => boolean;
  analysis: () => EngineAnalysis | null;
  engineInfo: () => EngineInfo;
  isAnalyzing: () => boolean;
  toggleEngine: () => void;
}

// ============================================================================
// Piece Values for Material Calculation
// ============================================================================

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };

// ============================================================================
// Analysis Debounce
// ============================================================================

const ANALYSIS_DEBOUNCE_MS = 300;

// ============================================================================
// Analyze Game Provider
// ============================================================================

export const AnalyzeGameProvider = (props: { children: JSX.Element }) => {
  // Create stores (timer created but never started, no multiplayer needed)
  const chess = createChessStore();
  const timer = createTimerStore();
  const engine = createEngineStore();
  const ui = createUIStore();

  // Engine analysis state
  const [engineEnabled, setEngineEnabled] = createSignal(true);
  const [analysis, setAnalysis] = createSignal<EngineAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = createSignal(false);
  const [engineInfo] = createSignal<EngineInfo>(analysisEngine.getEngineInfo());

  // Analysis debounce timer
  let analysisDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Initialize analysis engine on mount
  onMount(() => {
    analysisEngine.init().catch(() => {
      console.warn('Analysis engine init failed');
    });
  });

  // Track current analysis FEN to avoid stale updates
  let currentAnalysisFen: string | null = null;

  // Run analysis when position changes (debounced)
  // Uses viewFen so analysis updates when navigating history
  createEffect(
    on(
      () => [chess.state.viewFen, engineEnabled(), chess.state.lifecycle] as const,
      ([currentFen, enabled, lifecycle]) => {
        // Clear pending analysis
        if (analysisDebounceTimer) {
          clearTimeout(analysisDebounceTimer);
          analysisDebounceTimer = null;
        }

        // Stop any running analysis when position changes
        analysisEngine.stopAnalysis();

        if (!enabled || lifecycle !== 'playing') {
          setAnalysis(null);
          setIsAnalyzing(false);
          currentAnalysisFen = null;
          return;
        }

        setIsAnalyzing(true);
        currentAnalysisFen = currentFen;

        analysisDebounceTimer = setTimeout(() => {
          const fenToAnalyze = currentFen;

          analysisEngine
            .analyze(fenToAnalyze, {
              onProgress: (progressAnalysis) => {
                // Only update if this is still the current analysis
                if (currentAnalysisFen === fenToAnalyze) {
                  setAnalysis(progressAnalysis);
                }
              },
            })
            .then((result) => {
              // Only update if this is still the current analysis
              if (currentAnalysisFen === fenToAnalyze) {
                setAnalysis(result);
                setIsAnalyzing(false);
              }
            })
            .catch(() => {
              if (currentAnalysisFen === fenToAnalyze) {
                setIsAnalyzing(false);
              }
            });
        }, ANALYSIS_DEBOUNCE_MS);
      }
    )
  );

  // ============================================================================
  // Engine Actions
  // ============================================================================

  const toggleEngine = () => {
    const newEnabled = !engineEnabled();
    setEngineEnabled(newEnabled);
    if (!newEnabled) {
      analysisEngine.stopAnalysis();
      setAnalysis(null);
    }
  };

  // ============================================================================
  // Create Actions
  // ============================================================================

  const coreActions = createCoreActions({ chess, ui });
  const actions = createAnalyzeActions({ chess, ui }, coreActions);

  // ============================================================================
  // Derived State
  // ============================================================================

  const derived = {
    isEngineReady: () => analysisEngine.initialized,
    isEngineLoading: () => engine.state.status === 'loading',
    hasEngineError: () => engine.state.status === 'error',
    isPlaying: () => chess.state.lifecycle === 'playing',
    material: () => {
      const blackGained = chess.state.capturedWhite.reduce(
        (sum, p) => sum + (PIECE_VALUES[p[1]?.toLowerCase()] ?? 0),
        0
      );
      const whiteGained = chess.state.capturedBlack.reduce(
        (sum, p) => sum + (PIECE_VALUES[p[1]?.toLowerCase()] ?? 0),
        0
      );
      return { diff: whiteGained - blackGained };
    },
  };

  // ============================================================================
  // Engine State Object
  // ============================================================================

  const analyzeEngine: AnalyzeEngineState = {
    enabled: engineEnabled,
    analysis,
    engineInfo,
    isAnalyzing,
    toggleEngine,
  };

  // ============================================================================
  // Cleanup
  // ============================================================================

  onCleanup(() => {
    if (analysisDebounceTimer) {
      clearTimeout(analysisDebounceTimer);
    }
    analysisEngine.terminate();
    timer.stop();
    engine.terminate();
    ui.cleanup();
    sessionManager.destroyAllSessions();
  });

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: AnalyzeGameContextValue & { analyzeEngine: AnalyzeEngineState } = {
    chess,
    timer,
    ui,
    engine,
    actions,
    derived,
    analyzeEngine,
  };

  // Unified context for shared components like ChessBoardController
  const unifiedValue: UnifiedGameContext = {
    chess,
    ui,
    engine: {
      state: {
        isThinking: false,
        error: null,
      },
    },
    timer: {
      timeControl: 0,
    },
    multiplayer: null,
    actions: {
      jumpToPreviousMove: actions.jumpToPreviousMove,
      jumpToNextMove: actions.jumpToNextMove,
      flipBoard: actions.flipBoard,
      exitGame: actions.exitGame,
      retryEngineInit: async () => {},
      applyPlayerMove: actions.applyMove,
    },
    derived: {
      isEngineLoading: () => false,
      hasEngineError: () => false,
      isMultiplayer: () => false,
      showEvalBar: engineEnabled, // Dynamic based on toggle
      allowBothSides: () => true,
      // Provide eval score from analysis engine for the eval bar
      getEvalScore: () => analysis()?.score ?? null,
    },
  };

  return (
    <AnalyzeGameContext.Provider value={value}>
      <UnifiedGameContextInstance.Provider value={unifiedValue}>
        {props.children}
      </UnifiedGameContextInstance.Provider>
    </AnalyzeGameContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export const useAnalyzeGame = () => {
  const ctx = useContext(AnalyzeGameContext);
  if (!ctx) {
    throw new Error('useAnalyzeGame must be used within <AnalyzeGameProvider>');
  }
  return ctx as AnalyzeGameContextValue & { analyzeEngine: AnalyzeEngineState };
};

/**
 * Optional variant that returns null when outside provider.
 */
export const useAnalyzeGameOptional = () => {
  return useContext(AnalyzeGameContext) as
    | (AnalyzeGameContextValue & { analyzeEngine: AnalyzeEngineState })
    | undefined;
};
