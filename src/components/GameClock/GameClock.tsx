import { useGameStore } from '../../store/game/GameContext';

const GameClock = () => {
  const { whiteTime, blackTime } = useGameStore();

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style="display: flex; gap: 1rem;">
      <div>White: {formatTime(whiteTime())}</div>
      <div>Black: {formatTime(blackTime())}</div>
    </div>
  );
};

export default GameClock;
