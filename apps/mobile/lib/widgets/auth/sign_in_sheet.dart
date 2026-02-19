import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/user/user_provider.dart';
import '../../theme/app_colors.dart';

class SignInSheet extends ConsumerWidget {
  const SignInSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userState = ref.watch(userProvider);

    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
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
            'Sign In',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Sign in to save your progress and play rated games',
            style: TextStyle(color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),

          if (userState.error != null) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                userState.error!,
                style: const TextStyle(color: AppColors.error, fontSize: 13),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 16),
          ],

          _SignInButton(
            label: 'Continue with Google',
            icon: Icons.g_mobiledata,
            isLoading: userState.isLoading,
            onPressed: () => _signIn(ref, context, 'google'),
          ),
          const SizedBox(height: 12),
          _SignInButton(
            label: 'Continue with GitHub',
            icon: Icons.code,
            isLoading: userState.isLoading,
            onPressed: () => _signIn(ref, context, 'github'),
          ),
          const SizedBox(height: 12),
          _SignInButton(
            label: 'Continue with Discord',
            icon: Icons.chat_bubble,
            isLoading: userState.isLoading,
            onPressed: () => _signIn(ref, context, 'discord'),
          ),

          SizedBox(height: MediaQuery.of(context).viewInsets.bottom + 16),
        ],
      ),
    );
  }

  Future<void> _signIn(
    WidgetRef ref,
    BuildContext context,
    String provider,
  ) async {
    final success = await ref.read(userProvider.notifier).signIn(provider);
    if (success && context.mounted) {
      Navigator.of(context).pop();
      final needsUsername = ref.read(userProvider).needsUsername;
      if (needsUsername) {
        context.go('/auth/username-setup');
      }
    }
  }
}

class _SignInButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isLoading;
  final VoidCallback onPressed;

  const _SignInButton({
    required this.label,
    required this.icon,
    required this.isLoading,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: isLoading ? null : onPressed,
        icon: isLoading
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Icon(icon),
        label: Text(label),
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.textPrimary,
          side: const BorderSide(color: AppColors.surfaceCard),
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
    );
  }
}
