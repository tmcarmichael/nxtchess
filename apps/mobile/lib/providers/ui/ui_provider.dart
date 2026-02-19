import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'ui_state.dart';

export 'ui_state.dart';

class UINotifier extends Notifier<UIState> {
  @override
  UIState build() => const UIState();

  void showEndDialog() => state = state.copyWith(showEndDialog: true);
  void hideEndDialog() => state = state.copyWith(showEndDialog: false);

  void showResignDialog() => state = state.copyWith(showResignDialog: true);
  void hideResignDialog() => state = state.copyWith(showResignDialog: false);

  void showSetupSheet() => state = state.copyWith(showSetupSheet: true);
  void hideSetupSheet() => state = state.copyWith(showSetupSheet: false);

  void requestPromotion(String from, String to) {
    state = state.copyWith(
      showPromotionDialog: true,
      promotionFrom: from,
      promotionTo: to,
    );
  }

  void hidePromotionDialog() {
    state = state.copyWith(
      showPromotionDialog: false,
      promotionFrom: null,
      promotionTo: null,
    );
  }

  void flipBoard() => state = state.copyWith(boardFlipped: !state.boardFlipped);

  void reset() => state = const UIState();
}

final uiProvider = NotifierProvider<UINotifier, UIState>(UINotifier.new);
