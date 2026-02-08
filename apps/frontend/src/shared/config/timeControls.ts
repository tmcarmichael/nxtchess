export interface TimeControlOption {
  minutes: number;
  increment: number;
  label: string;
}

export interface TimeControlCategory {
  name: string;
  options: TimeControlOption[];
}

export const TIME_CONTROL_CATEGORIES: TimeControlCategory[] = [
  {
    name: 'Bullet',
    options: [
      { minutes: 1, increment: 0, label: '1+0' },
      { minutes: 2, increment: 0, label: '2+0' },
      { minutes: 2, increment: 1, label: '2+1' },
    ],
  },
  {
    name: 'Blitz',
    options: [
      { minutes: 3, increment: 0, label: '3+0' },
      { minutes: 3, increment: 2, label: '3+2' },
      { minutes: 5, increment: 3, label: '5+3' },
    ],
  },
  {
    name: 'Rapid',
    options: [
      { minutes: 10, increment: 0, label: '10+0' },
      { minutes: 10, increment: 5, label: '10+5' },
      { minutes: 15, increment: 10, label: '15+10' },
    ],
  },
  {
    name: 'Classical',
    options: [
      { minutes: 30, increment: 0, label: '30+0' },
      { minutes: 30, increment: 15, label: '30+15' },
      { minutes: 60, increment: 30, label: '60+30' },
    ],
  },
];

export const ALL_TIME_CONTROLS: TimeControlOption[] = TIME_CONTROL_CATEGORIES.flatMap(
  (c) => c.options
);

export const DEFAULT_TIME_CONTROL: TimeControlOption = { minutes: 5, increment: 3, label: '5+3' };

export function getTimeControlLabel(minutes: number, increment: number): string {
  return `${minutes}+${increment}`;
}

export function getTimeControlCategory(minutes: number, increment: number): string {
  for (const cat of TIME_CONTROL_CATEGORIES) {
    if (cat.options.some((o) => o.minutes === minutes && o.increment === increment)) {
      return cat.name;
    }
  }
  return 'Custom';
}

export function findTimeControl(minutes: number, increment: number): TimeControlOption | undefined {
  return ALL_TIME_CONTROLS.find((o) => o.minutes === minutes && o.increment === increment);
}
