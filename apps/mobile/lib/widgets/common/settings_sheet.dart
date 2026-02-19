import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/settings/settings_provider.dart';
import '../../providers/user/user_provider.dart';
import '../../theme/app_colors.dart';
import '../auth/sign_in_sheet.dart';

class SettingsSheet extends ConsumerWidget {
  const SettingsSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);
    final userState = ref.watch(userProvider);
    final settingsNotifier = ref.read(settingsProvider.notifier);

    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.textMuted,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Settings',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),

          if (userState.isLoggedIn) ...[
            ListTile(
              leading: CircleAvatar(
                backgroundColor: AppColors.primary,
                child: Text(
                  (userState.username?.isNotEmpty ?? false)
                      ? userState.username![0].toUpperCase()
                      : '?',
                  style: const TextStyle(color: Colors.white),
                ),
              ),
              title: Text(
                userState.username ?? 'User',
                style: const TextStyle(color: AppColors.textPrimary),
              ),
              subtitle: userState.rating != null
                  ? Text(
                      'Rating: ${userState.rating}',
                      style: const TextStyle(color: AppColors.textMuted),
                    )
                  : null,
              contentPadding: EdgeInsets.zero,
            ),
            const Divider(color: AppColors.surfaceCard),
          ],

          SwitchListTile(
            title: const Text(
              'Sound',
              style: TextStyle(color: AppColors.textPrimary),
            ),
            value: settings.soundEnabled,
            onChanged: (_) => settingsNotifier.toggleSound(),
            activeThumbColor: AppColors.primary,
            contentPadding: EdgeInsets.zero,
          ),
          SwitchListTile(
            title: const Text(
              'Haptics',
              style: TextStyle(color: AppColors.textPrimary),
            ),
            value: settings.hapticsEnabled,
            onChanged: (_) => settingsNotifier.toggleHaptics(),
            activeThumbColor: AppColors.primary,
            contentPadding: EdgeInsets.zero,
          ),
          SwitchListTile(
            title: const Text(
              'Board Coordinates',
              style: TextStyle(color: AppColors.textPrimary),
            ),
            value: settings.showCoordinates,
            onChanged: (_) => settingsNotifier.toggleCoordinates(),
            activeThumbColor: AppColors.primary,
            contentPadding: EdgeInsets.zero,
          ),
          SwitchListTile(
            title: const Text(
              'Show Legal Moves',
              style: TextStyle(color: AppColors.textPrimary),
            ),
            value: settings.showLegalMoves,
            onChanged: (_) => settingsNotifier.toggleLegalMoves(),
            activeThumbColor: AppColors.primary,
            contentPadding: EdgeInsets.zero,
          ),
          SwitchListTile(
            title: const Text(
              'Auto Queen',
              style: TextStyle(color: AppColors.textPrimary),
            ),
            subtitle: const Text(
              'Skip promotion dialog',
              style: TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
            value: settings.autoQueen,
            onChanged: (_) => settingsNotifier.toggleAutoQueen(),
            activeThumbColor: AppColors.primary,
            contentPadding: EdgeInsets.zero,
          ),
          const Divider(color: AppColors.surfaceCard),

          if (userState.isLoggedIn)
            ListTile(
              leading: const Icon(Icons.logout, color: AppColors.error),
              title: const Text(
                'Sign Out',
                style: TextStyle(color: AppColors.error),
              ),
              contentPadding: EdgeInsets.zero,
              onTap: () {
                ref.read(userProvider.notifier).logout();
                Navigator.of(context).pop();
              },
            )
          else
            ListTile(
              leading: const Icon(Icons.login, color: AppColors.primary),
              title: const Text(
                'Sign In',
                style: TextStyle(color: AppColors.textPrimary),
              ),
              contentPadding: EdgeInsets.zero,
              onTap: () {
                Navigator.of(context).pop();
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  builder: (_) => const SignInSheet(),
                );
              },
            ),

          SizedBox(height: MediaQuery.of(context).viewInsets.bottom + 16),
        ],
      ),
    );
  }
}
