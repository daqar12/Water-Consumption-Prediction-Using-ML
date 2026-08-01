import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:open_filex/open_filex.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:app/config/app_theme.dart';
import 'package:app/controllers/report_controller.dart';
import 'package:app/views/widgets/section_card.dart';
import 'package:app/views/widgets/stat_card.dart';

class ReportsView extends StatefulWidget {
  const ReportsView({super.key});

  @override
  State<ReportsView> createState() => _ReportsViewState();
}

class _ReportsViewState extends State<ReportsView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ReportController>().load();
    });
  }

  Future<void> _export(String format) async {
    final controller = context.read<ReportController>();
    final result = await controller.export(format);
    if (!mounted) return;

    if (result == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(controller.error ?? 'Export failed'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${format.toUpperCase()} saved: ${result.fileName}'),
        backgroundColor: AppColors.success,
        action: SnackBarAction(
          label: 'Open',
          textColor: Colors.white,
          onPressed: () => OpenFilex.open(result.path),
        ),
      ),
    );
  }

  Future<void> _shareLast() async {
    final last = context.read<ReportController>().lastExport;
    if (last == null) return;
    await Share.shareXFiles(
      [XFile(last.path, name: last.fileName)],
      text: 'Water prediction report (${last.format.toUpperCase()})',
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = context.watch<ReportController>();

    if (c.loading && c.summary == null) return const LoadingView();

    final summary = c.summary;
    final charts = c.charts;

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: c.load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Reports & Insights',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 4),
          Text(
            'Download prediction history as PDF, Excel, or CSV',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 16),
          if (c.error != null && !c.isExporting) ...[
            ErrorBanner(message: c.error!),
            const SizedBox(height: 12),
          ],
          if (summary != null)
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.45,
              children: [
                StatCard(
                  title: 'Accuracy',
                  value: summary.modelAccuracy,
                  icon: Icons.verified_rounded,
                  accent: AppColors.success,
                ),
                StatCard(
                  title: 'Predictions',
                  value: '${summary.predictionsMade}',
                  icon: Icons.water_drop_rounded,
                ),
                StatCard(
                  title: 'Anomalies',
                  value: '${summary.anomaliesDetected}',
                  icon: Icons.warning_amber_rounded,
                  accent: AppColors.secondary,
                ),
                StatCard(
                  title: 'Validated',
                  value: '${summary.validatedPredictions}',
                  icon: Icons.check_circle_rounded,
                  accent: const Color(0xFF0F766E),
                ),
              ],
            ),
          const SizedBox(height: 16),
          SectionCard(
            title: 'Download Reports',
            trailing: c.lastExport != null
                ? TextButton.icon(
                    onPressed: _shareLast,
                    icon: const Icon(Icons.share_rounded, size: 16),
                    label: const Text('Share'),
                  )
                : null,
            child: Column(
              children: [
                _ExportTile(
                  title: 'PDF Report',
                  subtitle: 'ML accuracy & prediction history',
                  icon: Icons.picture_as_pdf_rounded,
                  color: const Color(0xFFDC2626),
                  loading: c.exportingFormat == 'pdf',
                  disabled: c.isExporting,
                  onTap: () => _export('pdf'),
                ),
                const SizedBox(height: 10),
                _ExportTile(
                  title: 'Excel Report',
                  subtitle: 'Spreadsheet (.xlsx) export',
                  icon: Icons.table_chart_rounded,
                  color: const Color(0xFF059669),
                  loading: c.exportingFormat == 'excel',
                  disabled: c.isExporting,
                  onTap: () => _export('excel'),
                ),
                const SizedBox(height: 10),
                _ExportTile(
                  title: 'CSV Report',
                  subtitle: 'Comma-separated values',
                  icon: Icons.description_rounded,
                  color: const Color(0xFF2563EB),
                  loading: c.exportingFormat == 'csv',
                  disabled: c.isExporting,
                  onTap: () => _export('csv'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (charts != null && charts.zoneDistribution.isNotEmpty)
            SectionCard(
              title: 'Zone Distribution',
              child: SizedBox(
                height: 200,
                child: PieChart(
                  PieChartData(
                    sectionsSpace: 2,
                    centerSpaceRadius: 42,
                    sections: [
                      for (var i = 0;
                          i < charts.zoneDistribution.length;
                          i++)
                        PieChartSectionData(
                          value: charts.zoneDistribution[i].value,
                          title: charts.zoneDistribution[i].name.length > 8
                              ? charts.zoneDistribution[i].name.substring(0, 7)
                              : charts.zoneDistribution[i].name,
                          radius: 48,
                          color: _palette[i % _palette.length],
                          titleStyle: const TextStyle(
                            fontSize: 10,
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          const SizedBox(height: 16),
          if (charts != null && charts.branchSummary.isNotEmpty)
            SectionCard(
              title: 'Branch Avg Consumption',
              child: SizedBox(
                height: 220,
                child: BarChart(
                  BarChartData(
                    alignment: BarChartAlignment.spaceAround,
                    maxY: charts.branchSummary
                            .map((e) => e.november)
                            .fold<double>(1, (a, b) => a > b ? a : b) *
                        1.25,
                    gridData: FlGridData(
                      show: true,
                      drawVerticalLine: false,
                      getDrawingHorizontalLine: (_) => const FlLine(
                        color: AppColors.border,
                        strokeWidth: 1,
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
                          reservedSize: 28,
                          getTitlesWidget: (v, _) => Text(
                            v.toInt().toString(),
                            style: const TextStyle(
                              fontSize: 10,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ),
                      ),
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (v, _) {
                            final i = v.toInt();
                            if (i < 0 || i >= charts.branchSummary.length) {
                              return const SizedBox.shrink();
                            }
                            final n = charts.branchSummary[i].name;
                            return Padding(
                              padding: const EdgeInsets.only(top: 6),
                              child: Text(
                                n.length > 5 ? '${n.substring(0, 4)}…' : n,
                                style: const TextStyle(
                                  fontSize: 10,
                                  color: AppColors.textMuted,
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                    barGroups: [
                      for (var i = 0; i < charts.branchSummary.length; i++)
                        BarChartGroupData(
                          x: i,
                          barRods: [
                            BarChartRodData(
                              toY: charts.branchSummary[i].november,
                              color: AppColors.primary,
                              width: 12,
                              borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(5),
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ExportTile extends StatelessWidget {
  const _ExportTile({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.loading,
    required this.disabled,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final bool loading;
  final bool disabled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: color.withValues(alpha: 0.08),
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: disabled ? null : onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: color.withValues(alpha: 0.2)),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: loading
                    ? const Padding(
                        padding: EdgeInsets.all(12),
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: Colors.white,
                        ),
                      )
                    : Icon(icon, color: Colors.white),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                    Text(
                      loading ? 'Downloading...' : subtitle,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.download_rounded,
                color: disabled ? AppColors.textMuted : color,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

const _palette = [
  Color(0xFF0F766E),
  Color(0xFFF59E0B),
  Color(0xFF3B82F6),
  Color(0xFFEC4899),
  Color(0xFF8B5CF6),
  Color(0xFF10B981),
];
