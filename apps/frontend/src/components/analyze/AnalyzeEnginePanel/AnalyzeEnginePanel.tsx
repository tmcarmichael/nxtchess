import { For, Show, type Component } from 'solid-js';
import styles from './AnalyzeEnginePanel.module.css';
import type { EngineAnalysis, EngineInfo } from '../../../services/engine/analysisEngineService';

interface AnalyzeEnginePanelProps {
  engineInfo: EngineInfo;
  analysis: EngineAnalysis | null;
  enabled: boolean;
  onToggle: () => void;
  isLoading: boolean;
  onPlayMove?: (uciMove: string) => void;
}

const AnalyzeEnginePanel: Component<AnalyzeEnginePanelProps> = (props) => {
  const formatScore = (score: number, mate: number | null): string => {
    if (mate !== null) {
      return mate > 0 ? `M${mate}` : `M${Math.abs(mate)}`;
    }
    const sign = score >= 0 ? '+' : '';
    return `${sign}${score.toFixed(2)}`;
  };

  const getScoreClass = (score: number, mate: number | null): string => {
    if (mate !== null) {
      return mate > 0 ? styles.scoreWhiteWinning : styles.scoreBlackWinning;
    }
    if (score > 0.5) return styles.scoreWhiteWinning;
    if (score < -0.5) return styles.scoreBlackWinning;
    return styles.scoreEqual;
  };

  const formatMoves = (moves: string[], maxMoves: number = 6): string => {
    if (moves.length === 0) return '';
    return moves.slice(0, maxMoves).join(' ') + (moves.length > maxMoves ? '...' : '');
  };

  const getDisplayMoves = (line: { pvSan: string[]; pv: string[] }): string[] => {
    // Use SAN if available, otherwise fall back to UCI notation
    return line.pvSan.length > 0 ? line.pvSan : line.pv;
  };

  const handleLineClick = (line: { pv: string[] }) => {
    if (props.onPlayMove && line.pv.length > 0) {
      props.onPlayMove(line.pv[0]);
    }
  };

  return (
    <div class={styles.panel}>
      <div class={styles.header}>
        <div class={styles.engineInfo}>
          <span class={styles.engineName}>{props.engineInfo.name}</span>
          <Show when={props.analysis && props.enabled}>
            <span class={styles.depth}>Depth {props.analysis?.depth ?? 0}</span>
          </Show>
        </div>
        <button
          class={styles.toggleButton}
          classList={{ [styles.toggleActive]: props.enabled }}
          onClick={() => props.onToggle()}
          aria-label={props.enabled ? 'Disable engine' : 'Enable engine'}
        >
          <span class={styles.toggleTrack}>
            <span class={styles.toggleThumb} />
          </span>
        </button>
      </div>

      <Show when={props.enabled}>
        <div class={styles.linesContainer}>
          <Show
            when={props.analysis && props.analysis.lines.length > 0}
            fallback={
              <div class={styles.loadingState}>
                <Show when={props.isLoading} fallback={<span>Waiting for position...</span>}>
                  <span class={styles.thinkingIndicator}>Analyzing...</span>
                </Show>
              </div>
            }
          >
            <For each={props.analysis?.lines ?? []}>
              {(line, index) => (
                <div
                  class={styles.line}
                  classList={{ [styles.clickable]: !!props.onPlayMove && line.pv.length > 0 }}
                  onClick={() => handleLineClick(line)}
                >
                  <span class={styles.lineIndex}>{index() + 1}.</span>
                  <span
                    classList={{
                      [styles.lineScore]: true,
                      [getScoreClass(line.score, line.mate)]: true,
                    }}
                  >
                    {formatScore(line.score, line.mate)}
                  </span>
                  <span class={styles.lineMoves}>{formatMoves(getDisplayMoves(line))}</span>
                </div>
              )}
            </For>
          </Show>
        </div>
      </Show>

      <Show when={!props.enabled}>
        <div class={styles.disabledState}>
          <span>Engine analysis disabled</span>
        </div>
      </Show>
    </div>
  );
};

export default AnalyzeEnginePanel;
