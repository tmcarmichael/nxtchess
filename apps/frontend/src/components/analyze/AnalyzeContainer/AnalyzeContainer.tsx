import { type ParentComponent, createSignal, onMount } from 'solid-js';
import { AnalyzeGameProvider, useAnalyzeGame } from '../../../store/game/AnalyzeGameContext';
import ChessBoardController from '../../chess/ChessBoardController/ChessBoardController';
import GameContainer from '../../game/GameContainer/GameContainer';
import AnalyzeControlPanel from '../AnalyzeControlPanel/AnalyzeControlPanel';
import AnalyzeEnginePanel from '../AnalyzeEnginePanel/AnalyzeEnginePanel';
import AnalyzeImportModal from '../AnalyzeImportModal/AnalyzeImportModal';
import AnalyzeNavigationPanel from '../AnalyzeNavigationPanel/AnalyzeNavigationPanel';
import styles from './AnalyzeContainer.module.css';
import type { PromotionPiece, Square } from '../../../types/chess';

const AnalyzeContainerInner: ParentComponent = () => {
  const { chess, actions, analyzeEngine } = useAnalyzeGame();
  const [showImportModal, setShowImportModal] = createSignal(false);

  // Initialize with standard starting position on mount
  onMount(() => {
    if (chess.state.lifecycle === 'idle') {
      actions.resetToStart();
    }
  });

  const handleOpenImportModal = () => {
    setShowImportModal(true);
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
  };

  const handlePlayEngineMove = (uciMove: string) => {
    if (!uciMove || uciMove.length < 4) return;
    const from = uciMove.slice(0, 2) as Square;
    const to = uciMove.slice(2, 4) as Square;
    const promotion = uciMove.length === 5 ? (uciMove[4] as PromotionPiece) : undefined;
    actions.applyMove(from, to, promotion);
  };

  // Compose engine panel + control panel as right panel
  const RightPanelContent = () => (
    <div class={styles.rightPanelStack}>
      <AnalyzeEnginePanel
        engineInfo={analyzeEngine.engineInfo()}
        analysis={analyzeEngine.analysis()}
        enabled={analyzeEngine.enabled()}
        onToggle={analyzeEngine.toggleEngine}
        isLoading={analyzeEngine.isAnalyzing()}
        onPlayMove={handlePlayEngineMove}
      />
      <AnalyzeControlPanel onImport={handleOpenImportModal} />
    </div>
  );

  return (
    <GameContainer
      layout="three-column"
      showModal={showImportModal()}
      modalContent={<AnalyzeImportModal onClose={handleCloseImportModal} />}
      leftPanel={<AnalyzeNavigationPanel />}
      boardContent={<ChessBoardController />}
      rightPanel={<RightPanelContent />}
    />
  );
};

// Wrap with provider
const AnalyzeContainer: ParentComponent = () => {
  return (
    <AnalyzeGameProvider>
      <AnalyzeContainerInner />
    </AnalyzeGameProvider>
  );
};

export default AnalyzeContainer;
