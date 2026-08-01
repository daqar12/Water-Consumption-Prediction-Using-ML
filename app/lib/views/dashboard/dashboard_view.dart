import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:provider/provider.dart';
import 'package:app/config/app_theme.dart';
import 'package:app/controllers/dashboard_controller.dart';
import 'package:app/views/widgets/section_card.dart';
import 'package:app/views/widgets/stat_card.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({super.key});

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardController>().load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final c = context.watch<DashboardController>();

    if (c.loading && c.totalCustomers == 0) {
      return const LoadingView();
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: c.load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
        children: [
          _DashboardHeader(loading: c.loading),
          const SizedBox(height: 20),
          if (c.error != null) ...[
            ErrorBanner(message: c.error!),
            const SizedBox(height: 12),
          ],
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 14,
            crossAxisSpacing: 14,
            childAspectRatio: 1.5,
            children: [
              StatCard(
                title: 'Customers',
                value: c.totalCustomers.toString(),
                icon: Icons.groups_rounded,
              ),
              StatCard(
                title: 'Users',
                value: c.totalUsers.toString(),
                icon: Icons.handshake_rounded,
                accent: AppColors.secondary,
              ),
              StatCard(
                title: 'Highest Pred.',
                value: '${c.highestPrediction.toStringAsFixed(1)} m³',
                icon: Icons.trending_up_rounded,
                accent: AppColors.success,
              ),
              StatCard(
                title: 'Lowest Pred.',
                value: '${c.lowestPrediction.toStringAsFixed(1)} m³',
                icon: Icons.trending_down_rounded,
                accent: AppColors.danger,
              ),
            ],
          ),
          const SizedBox(height: 20),
          SectionCard(
            title: 'Branch Overview',
            child: SizedBox(
              height: 260,
              child: c.branchOverview.isEmpty
                  ? const EmptyState(
                      icon: Icons.bar_chart_rounded,
                      message: 'No branch data yet',
                    )
                  : Padding(
                      padding: const EdgeInsets.only(top: 8, right: 8),
                      child: BarChart(
                        BarChartData(
                          alignment: BarChartAlignment.spaceAround,
                          maxY:
                              (c.branchOverview
                                          .map((e) => e.total.toDouble())
                                          .fold<double>(
                                            0,
                                            (a, b) => a > b ? a : b,
                                          ) *
                                      1.2)
                                  .clamp(1, double.infinity),
                          barTouchData: BarTouchData(
                            enabled: true,
                            touchTooltipData: BarTouchTooltipData(
                              getTooltipColor: (_) => AppColors.primary,
                              tooltipRoundedRadius: 10,
                              tooltipPadding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 6,
                              ),
                              getTooltipItem:
                                  (group, groupIndex, rod, rodIndex) {
                                    final name =
                                        c.branchOverview[groupIndex].name;
                                    return BarTooltipItem(
                                      '$name\n',
                                      const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w600,
                                        fontSize: 12,
                                      ),
                                      children: [
                                        TextSpan(
                                          text: rod.toY.toStringAsFixed(0),
                                          style: const TextStyle(
                                            color: Colors.white70,
                                            fontWeight: FontWeight.w400,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    );
                                  },
                            ),
                          ),
                          gridData: FlGridData(
                            show: true,
                            drawVerticalLine: false,
                            horizontalInterval:
                                (c.branchOverview
                                            .map((e) => e.total.toDouble())
                                            .fold<double>(
                                              0,
                                              (a, b) => a > b ? a : b,
                                            ) *
                                        1.2)
                                    .clamp(1, double.infinity) /
                                4,
                            getDrawingHorizontalLine: (v) => FlLine(
                              color: AppColors.border.withOpacity(0.6),
                              strokeWidth: 1,
                              dashArray: [4, 4],
                            ),
                          ),
                          borderData: FlBorderData(show: false),
                          titlesData: FlTitlesData(
                            topTitles: const AxisTitles(
                              sideTitles: SideTitles(showTitles: false),
                            ),
                            rightTitles: const AxisTitles(
                              sideTitles: SideTitles(showTitles: false),
                            ),
                            leftTitles: AxisTitles(
                              sideTitles: SideTitles(
                                showTitles: true,
                                reservedSize: 32,
                                getTitlesWidget: (v, _) => Text(
                                  v.toInt().toString(),
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w500,
                                    color: AppColors.textMuted,
                                  ),
                                ),
                              ),
                            ),
                            bottomTitles: AxisTitles(
                              sideTitles: SideTitles(
                                showTitles: true,
                                getTitlesWidget: (v, meta) {
                                  final i = v.toInt();
                                  if (i < 0 || i >= c.branchOverview.length) {
                                    return const SizedBox.shrink();
                                  }
                                  final name = c.branchOverview[i].name;
                                  final short = name.length > 6
                                      ? '${name.substring(0, 5)}…'
                                      : name;
                                  return Padding(
                                    padding: const EdgeInsets.only(top: 8),
                                    child: Text(
                                      short,
                                      style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w500,
                                        color: AppColors.textMuted,
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                          barGroups: [
                            for (var i = 0; i < c.branchOverview.length; i++)
                              BarChartGroupData(
                                x: i,
                                barRods: [
                                  BarChartRodData(
                                    toY: c.branchOverview[i].total.toDouble(),
                                    width: 16,
                                    borderRadius: const BorderRadius.vertical(
                                      top: Radius.circular(8),
                                    ),
                                    gradient: LinearGradient(
                                      begin: Alignment.bottomCenter,
                                      end: Alignment.topCenter,
                                      colors: [
                                        AppColors.primary,
                                        AppColors.primary.withOpacity(0.55),
                                      ],
                                    ),
                                    backDrawRodData: BackgroundBarChartRodData(
                                      show: true,
                                      toY:
                                          (c.branchOverview
                                                      .map(
                                                        (e) =>
                                                            e.total.toDouble(),
                                                      )
                                                      .fold<double>(
                                                        0,
                                                        (a, b) => a > b ? a : b,
                                                      ) *
                                                  1.2)
                                              .clamp(1, double.infinity),
                                      color: AppColors.border.withOpacity(0.25),
                                    ),
                                  ),
                                ],
                              ),
                          ],
                        ),
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Modern header: gradient icon badge + title/subtitle + a subtle "live" indicator.
/// Purely presentational — carries no state or logic of its own.
class _DashboardHeader extends StatelessWidget {
  const _DashboardHeader({required this.loading});

  final bool loading;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [AppColors.primary, AppColors.primary.withOpacity(0.7)],
            ),
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.35),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: const Icon(
            Icons.water_drop_rounded,
            color: Colors.white,
            size: 24,
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Dashboard Overview',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'Live insights from your water prediction system',
                style: Theme.of(
                  context,
                ).textTheme.bodySmall?.copyWith(color: AppColors.textMuted),
              ),
            ],
          ),
        ),
        _LiveBadge(loading: loading),
      ],
    );
  }
}

/// Small pill showing sync status. Purely visual — reflects the same
/// `loading` flag already exposed by the controller.
class _LiveBadge extends StatelessWidget {
  const _LiveBadge({required this.loading});

  final bool loading;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: (loading ? AppColors.textMuted : AppColors.success).withOpacity(
          0.12,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (loading)
            const SizedBox(
              width: 8,
              height: 8,
              child: CircularProgressIndicator(strokeWidth: 1.5),
            )
          else
            Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: AppColors.success,
                shape: BoxShape.circle,
              ),
            ),
          const SizedBox(width: 6),
          Text(
            loading ? 'Syncing' : 'Live',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: loading ? AppColors.textMuted : AppColors.success,
            ),
          ),
        ],
      ),
    );
  }
}
