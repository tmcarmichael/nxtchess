import { createEffect, on, type Accessor } from 'solid-js';
import { audioService } from '../../../../services/audio/AudioService';
import type { Square } from '../../../../types/chess';
import type { GameLifecycle, GameMode, Side } from '../../../../types/game';

export function useAudioFeedback(params: {
  moveHistoryLength: Accessor<number>;
  moveHistory: Accessor<string[]>;
  checkedKingSquare: Accessor<Square | null>;
  lifecycle: Accessor<GameLifecycle>;
  mode: Accessor<GameMode>;
  playerColor: Accessor<Side>;
  whiteTime: Accessor<number | undefined>;
  blackTime: Accessor<number | undefined>;
  setGameEventAnnouncement: (msg: string) => void;
}): void {
  let lowTimeWarningPlayed = false;
  const LOW_TIME_THRESHOLD = 10000;

  // Play sound when a move is made
  createEffect(
    on(params.moveHistoryLength, (length, prevLength) => {
      if (length > 0 && prevLength !== undefined && length > prevLength) {
        const lastMove = params.moveHistory()[length - 1];
        const isCapture = lastMove?.includes('x') ?? false;
        const isCheck = params.checkedKingSquare() !== null;

        if (isCapture && isCheck) {
          audioService.playMoveSound(true);
          setTimeout(() => audioService.playCheck(), 80);
        } else if (isCheck) {
          audioService.playCheck();
        } else {
          audioService.playMoveSound(isCapture);
        }

        if (isCheck) {
          params.setGameEventAnnouncement('Check');
          setTimeout(() => params.setGameEventAnnouncement(''), 1000);
        }
      }
    })
  );

  // Play sound when game starts or ends
  createEffect(
    on(params.lifecycle, (lifecycle, prevLifecycle) => {
      if (params.mode() === 'analysis') return;
      if (lifecycle === 'playing' && prevLifecycle !== 'playing') {
        audioService.playGameStart();
      }
      if (lifecycle === 'ended' && prevLifecycle === 'playing') {
        audioService.playGameEnd();
      }
    })
  );

  // Reset low-time warning when new game starts
  createEffect(
    on(params.lifecycle, (lifecycle) => {
      if (lifecycle === 'playing') {
        lowTimeWarningPlayed = false;
      }
    })
  );

  // Low time warning
  createEffect(
    on(
      () => {
        const color = params.playerColor();
        return color === 'w' ? params.whiteTime() : params.blackTime();
      },
      (playerTime, prevTime) => {
        if (
          playerTime !== undefined &&
          prevTime !== undefined &&
          params.lifecycle() === 'playing' &&
          !lowTimeWarningPlayed &&
          prevTime > LOW_TIME_THRESHOLD &&
          playerTime <= LOW_TIME_THRESHOLD
        ) {
          audioService.playLowTime();
          lowTimeWarningPlayed = true;
        }
      }
    )
  );
}
