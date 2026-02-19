({String from, String to, String? promotion}) parseUciMove(String uci) {
  assert(uci.length >= 4, 'UCI move must be at least 4 characters: $uci');
  return (
    from: uci.substring(0, 2),
    to: uci.substring(2, 4),
    promotion: uci.length == 5 ? uci[4] : null,
  );
}

bool matchesSolution(
  String expectedUci,
  String from,
  String to,
  String? promotion,
) {
  final expected = parseUciMove(expectedUci);
  if (expected.from != from || expected.to != to) return false;
  if (expected.promotion != null && expected.promotion != promotion) {
    return false;
  }
  return true;
}
