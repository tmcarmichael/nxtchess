import {
  createContext,
  useContext,
  onCleanup,
  onMount,
  createSignal,
  createMemo,
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
import { computeMaterialDiff } from '../../types/chess';
import { createAnalyzeActions } from './actions/createAnalyzeActions';
import { createCoreActions } from './actions/createCoreActions';
import { createChessStore } from './stores/createChessStore';
import { createEngineStore } from './stores/createEngineStore';
import { createTimerStore } from './stores/createTimerStore';
import { createUIStore } from './stores/createUIStore';
import { UnifiedGameContextInstance, type UnifiedGameContext } from './useGameContext';
import type { AnalyzeGameContextValue } from './types';

const AnalyzeGameContext = createContext<AnalyzeGameContextValue>();

export interface AnalyzeEngineState {
  enabled: () => boolean;
  analysis: () => EngineAnalysis | null;
  engineInfo: () => EngineInfo;
  isAnalyzing: () => boolean;
  toggleEngine: () => void;
}

const ANALYSIS_DEBOUNCE_MS = 300;

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
    analysisEngine.init().catch(() => {});
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

        const isActive =
          lifecycle === 'playing' || (lifecycle === 'ended' && chess.derived.isViewingHistory());
        if (!enabled || !isActive) {
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

  const toggleEngine = () => {
    const newEnabled = !engineEnabled();
    setEngineEnabled(newEnabled);
    if (!newEnabled) {
      analysisEngine.stopAnalysis();
      setAnalysis(null);
    }
  };

  const coreActions = createCoreActions({ chess, ui });
  const actions = createAnalyzeActions({ chess, ui }, coreActions);

  const material = createMemo(() =>
    computeMaterialDiff(chess.state.capturedWhite, chess.state.capturedBlack)
  );

  const derived = {
    isEngineReady: () => analysisEngine.initialized,
    isEngineLoading: () => engine.state.status === 'loading',
    hasEngineError: () => engine.state.status === 'error',
    isPlaying: () => chess.state.lifecycle === 'playing',
    material,
  };

  const analyzeEngine: AnalyzeEngineState = {
    enabled: engineEnabled,
    analysis,
    engineInfo,
    isAnalyzing,
    toggleEngine,
  };

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
      jumpToFirstMove: actions.jumpToFirstMove,
      jumpToPreviousMove: actions.jumpToPreviousMove,
      jumpToNextMove: actions.jumpToNextMove,
      jumpToLastMove: actions.jumpToLastMove,
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
