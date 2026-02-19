class TimeControlOption {
  final int minutes;
  final int increment;

  String get label => '$minutes+$increment';

  const TimeControlOption({required this.minutes, required this.increment});
}

class TimeControlCategory {
  final String name;
  final List<TimeControlOption> options;

  const TimeControlCategory({required this.name, required this.options});
}

const List<TimeControlCategory> timeControlCategories = [
  TimeControlCategory(
    name: 'Bullet',
    options: [
      TimeControlOption(minutes: 1, increment: 0),
      TimeControlOption(minutes: 2, increment: 0),
      TimeControlOption(minutes: 2, increment: 1),
    ],
  ),
  TimeControlCategory(
    name: 'Blitz',
    options: [
      TimeControlOption(minutes: 3, increment: 0),
      TimeControlOption(minutes: 3, increment: 2),
      TimeControlOption(minutes: 5, increment: 3),
    ],
  ),
  TimeControlCategory(
    name: 'Rapid',
    options: [
      TimeControlOption(minutes: 10, increment: 0),
      TimeControlOption(minutes: 10, increment: 5),
      TimeControlOption(minutes: 15, increment: 10),
    ],
  ),
  TimeControlCategory(
    name: 'Classical',
    options: [
      TimeControlOption(minutes: 30, increment: 0),
      TimeControlOption(minutes: 30, increment: 15),
      TimeControlOption(minutes: 60, increment: 30),
    ],
  ),
];

final List<TimeControlOption> allTimeControls = timeControlCategories
    .expand((c) => c.options)
    .toList();

const TimeControlOption defaultTimeControl = TimeControlOption(
  minutes: 5,
  increment: 3,
);

String getTimeControlCategory(int minutes, int increment) {
  for (final cat in timeControlCategories) {
    if (cat.options.any(
      (o) => o.minutes == minutes && o.increment == increment,
    )) {
      return cat.name;
    }
  }
  return 'Custom';
}

TimeControlOption? findTimeControl(int minutes, int increment) {
  for (final tc in allTimeControls) {
    if (tc.minutes == minutes && tc.increment == increment) return tc;
  }
  return null;
}
