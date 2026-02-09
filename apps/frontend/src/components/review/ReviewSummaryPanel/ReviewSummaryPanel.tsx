import { For, Show, type Component } from 'solid-js';
import styles from './ReviewSummaryPanel.module.css';
import type { Side } from '../../../types/game';
import type { MoveQuality } from '../../../types/moveQuality';
import type { QualityDistribution, ReviewSummary } from '../../../types/review';

interface ReviewSummaryPanelProps {
  summary: ReviewSummary | null;
  playerColor: Side;
}

const QUALITY_ORDER: MoveQuality[] = [
  'best',
  'excellent',
  'good',
  'inaccuracy',
  'mistake',
  'blunder',
];

const QUALITY_LABELS: Record<MoveQuality, string> = {
  best: 'Best',
  excellent: 'Excellent',
  good: 'Good',
  inaccuracy: 'Inaccuracy',
  mistake: 'Mistake',
  blunder: 'Blunder',
};

const AccuracyRing: Component<{ accuracy: number; label: string; side: 'white' | 'black' }> = (
  props
) => {
  const circumference = 2 * Math.PI * 28;
  const offset = () => circumference - (props.accuracy / 100) * circumference;

  return (
    <div class={styles.accuracyRing}>
      <svg viewBox="0 0 64 64" class={styles.ringSvg}>
        <circle cx="32" cy="32" r="28" class={styles.ringTrack} />
        <circle
          cx="32"
          cy="32"
          r="28"
          class={styles.ringFill}
          classList={{
            [styles.ringWhite]: props.side === 'white',
            [styles.ringBlack]: props.side === 'black',
          }}
          stroke-dasharray={String(circumference)}
          stroke-dashoffset={String(offset())}
        />
      </svg>
      <div class={styles.accuracyValue}>{props.accuracy.toFixed(1)}%</div>
      <div class={styles.accuracyLabel}>{props.label}</div>
    </div>
  );
};

const QualityBar: Component<{ distribution: QualityDistribution; total: number }> = (props) => {
  return (
    <div class={styles.qualityBar}>
      <For each={QUALITY_ORDER}>
        {(quality) => {
          const count = () => props.distribution[quality];
          const pct = () => (props.total > 0 ? (count() / props.total) * 100 : 0);
          return (
            <Show when={count() > 0}>
              <div
                class={styles.qualitySegment}
                classList={{ [styles[quality]]: true }}
                style={{ width: `${pct()}%` }}
                title={`${QUALITY_LABELS[quality]}: ${count()}`}
              />
            </Show>
          );
        }}
      </For>
    </div>
  );
};

const ReviewSummaryPanel: Component<ReviewSummaryPanelProps> = (props) => {
  const whiteTotal = () => {
    if (!props.summary) return 0;
    const d = props.summary.qualityDistribution.white;
    return QUALITY_ORDER.reduce((sum, q) => sum + d[q], 0);
  };

  const blackTotal = () => {
    if (!props.summary) return 0;
    const d = props.summary.qualityDistribution.black;
    return QUALITY_ORDER.reduce((sum, q) => sum + d[q], 0);
  };

  return (
    <Show when={props.summary}>
      {(summary) => (
        <div class={styles.summaryContainer}>
          <div class={styles.sectionTitle}>Accuracy</div>
          <div class={styles.accuracyRow}>
            <AccuracyRing accuracy={summary().whiteAccuracy} label="White" side="white" />
            <AccuracyRing accuracy={summary().blackAccuracy} label="Black" side="black" />
          </div>

          <div class={styles.distributionSection}>
            <div class={styles.sectionTitle}>Move Quality</div>
            <div class={styles.distributionRow}>
              <span class={styles.distributionLabel}>White</span>
              <QualityBar distribution={summary().qualityDistribution.white} total={whiteTotal()} />
            </div>
            <div class={styles.distributionRow}>
              <span class={styles.distributionLabel}>Black</span>
              <QualityBar distribution={summary().qualityDistribution.black} total={blackTotal()} />
            </div>
          </div>

          <div class={styles.legendRow}>
            <For each={QUALITY_ORDER}>
              {(quality) => (
                <div class={styles.legendItem}>
                  <span class={styles.legendDot} classList={{ [styles[quality]]: true }} />
                  <span class={styles.legendText}>{QUALITY_LABELS[quality]}</span>
                </div>
              )}
            </For>
          </div>
        </div>
      )}
    </Show>
  );
};

export default ReviewSummaryPanel;
