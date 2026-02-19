List<String> parsePgnToSanTokens(String pgn) {
  final lines = pgn.split('\n');
  final moveLines = <String>[];
  for (final line in lines) {
    if (line.startsWith('[')) continue;
    if (line.trim().isEmpty) continue;
    moveLines.add(line.trim());
  }

  final moveText = moveLines.join(' ');
  final cleaned = moveText
      .replaceAll(RegExp(r'\{[^}]*\}'), '')
      .replaceAll(RegExp(r'1-0|0-1|1/2-1/2|\*'), '')
      .replaceAll(RegExp(r'\d+\.+'), '')
      .trim();
  return cleaned.split(RegExp(r'\s+')).where((s) => s.isNotEmpty).toList();
}
