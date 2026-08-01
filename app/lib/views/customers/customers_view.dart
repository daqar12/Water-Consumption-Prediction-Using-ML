import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:app/config/app_theme.dart';
import 'package:app/controllers/customer_controller.dart';
import 'package:app/models/customer_model.dart';
import 'package:app/views/widgets/section_card.dart';

class CustomersView extends StatefulWidget {
  const CustomersView({super.key});

  @override
  State<CustomersView> createState() => _CustomersViewState();
}

class _CustomersViewState extends State<CustomersView> {
  final _search = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CustomerController>().load(pageNumber: 1);
    });
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _upload() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: const ['csv', 'xlsx', 'xls'],
      withData: true,
    );
    if (result == null || result.files.isEmpty) return;
    if (!mounted) return;
    final file = result.files.first;
    if (file.bytes == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not read file bytes')),
      );
      return;
    }
    final controller = context.read<CustomerController>();
    final ok = await controller.upload(fileName: file.name, bytes: file.bytes!);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(ok ? 'Upload successful' : 'Upload failed'),
        backgroundColor: ok ? AppColors.success : AppColors.danger,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = context.watch<CustomerController>();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _search,
                  decoration: InputDecoration(
                    hintText: 'Filter this page...',
                    prefixIcon: const Icon(Icons.search_rounded),
                    suffixIcon: _search.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded),
                            onPressed: () {
                              _search.clear();
                              c.load(query: '');
                              setState(() {});
                            },
                          )
                        : null,
                  ),
                  onChanged: (_) => setState(() {}),
                  onSubmitted: (v) => c.load(query: v, pageNumber: c.page),
                ),
              ),
              const SizedBox(width: 10),
              // FilledButton.icon(
              //   onPressed: c.uploading ? null : _upload,
              //   style: FilledButton.styleFrom(
              //     backgroundColor: const Color.fromARGB(255, 198, 201, 234),
              //     foregroundColor: Colors.white,
              //     padding: const EdgeInsets.symmetric(
              //       horizontal: 14,
              //       vertical: 14,
              //     ),
              //     shape: RoundedRectangleBorder(
              //       borderRadius: BorderRadius.circular(12),
              //     ),
              //   ),
              //   icon: c.uploading
              //       ? const SizedBox(
              //           width: 16,
              //           height: 16,
              //           child: CircularProgressIndicator(
              //             strokeWidth: 2,
              //             color: Colors.white,
              //           ),
              //         )
              //       : const Icon(Icons.upload_file_rounded, size: 18),
              //   label: const Text('Upload'),
              // ),
            ],
          ),
        ),
        if (c.error != null)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: ErrorBanner(message: c.error!),
          ),
        Expanded(
          child: c.loading
              ? const LoadingView()
              : RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: () =>
                      c.load(query: _search.text, pageNumber: c.page),
                  child: c.customers.isEmpty
                      ? ListView(
                          children: const [
                            SizedBox(height: 80),
                            EmptyState(
                              icon: Icons.groups_outlined,
                              message: 'No customers found',
                            ),
                          ],
                        )
                      : ListView(
                          padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                          children: [
                            _CustomersTable(controller: c),
                            const SizedBox(height: 14),
                            _PaginationBar(controller: c),
                          ],
                        ),
                ),
        ),
      ],
    );
  }
}

class _CustomersTable extends StatelessWidget {
  const _CustomersTable({required this.controller});

  final CustomerController controller;

  static const _headers = [
    'ID',
    'Customer Name',
    'Branch',
    'Zone',
    'September',
    'October',
    'November',
  ];

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final startId = ((c.page - 1) * CustomerController.pageSize) + 1;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: ConstrainedBox(
          constraints: BoxConstraints(
            minWidth: MediaQuery.of(context).size.width - 32,
          ),
          child: Table(
            defaultVerticalAlignment: TableCellVerticalAlignment.middle,
            columnWidths: const {
              0: FixedColumnWidth(56),
              1: FixedColumnWidth(160),
              2: FixedColumnWidth(120),
              3: FixedColumnWidth(110),
              4: FixedColumnWidth(100),
              5: FixedColumnWidth(100),
              6: FixedColumnWidth(100),
            },
            children: [
              TableRow(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF0B1FF6), Color(0xFF3B82F6)],
                  ),
                ),
                children: [
                  for (final h in _headers)
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 14,
                      ),
                      child: Text(
                        h,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ),
                ],
              ),
              for (var i = 0; i < c.customers.length; i++)
                _dataRow(
                  index: startId + i,
                  customer: c.customers[i],
                  striped: i.isOdd,
                ),
            ],
          ),
        ),
      ),
    );
  }

  TableRow _dataRow({
    required int index,
    required CustomerModel customer,
    required bool striped,
  }) {
    return TableRow(
      decoration: BoxDecoration(
        color: striped ? const Color(0xFFF8FAFF) : Colors.white,
      ),
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Container(
              width: 28,
              height: 28,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '$index',
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w800,
                  fontSize: 12,
                ),
              ),
            ),
          ),
        ),
        _cell(customer.customerName, bold: true),
        _cell(customer.branch),
        _cell(customer.zone),
        _valueCell(customer.september),
        _valueCell(customer.october),
        _valueCell(customer.november),
      ],
    );
  }

  Widget _cell(String text, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      child: Text(
        text,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          fontSize: 13,
          fontWeight: bold ? FontWeight.w600 : FontWeight.w500,
          color: AppColors.textMain,
        ),
      ),
    );
  }

  Widget _valueCell(num value) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.slate100,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            value.toString(),
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.slate800,
            ),
          ),
        ),
      ),
    );
  }
}

class _PaginationBar extends StatelessWidget {
  const _PaginationBar({required this.controller});

  final CustomerController controller;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final pages = _visiblePages(c.page, c.totalPages);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Text(
            'Showing ${c.fromRow}–${c.toRow} of ${c.total}',
            style: Theme.of(
              context,
            ).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                tooltip: 'Previous',
                onPressed: c.hasPrev ? c.prevPage : null,
                icon: const Icon(Icons.chevron_left_rounded),
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.slate100,
                ),
              ),
              const SizedBox(width: 4),
              Flexible(
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      for (final p in pages)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 2),
                          child: _PageButton(
                            page: p,
                            selected: p == c.page,
                            onTap: () => c.goToPage(p),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 4),
              IconButton(
                tooltip: 'Next',
                onPressed: c.hasNext ? c.nextPage : null,
                icon: const Icon(Icons.chevron_right_rounded),
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.slate100,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  List<int> _visiblePages(int current, int total) {
    if (total <= 5) {
      return [for (var i = 1; i <= total; i++) i];
    }
    var start = current - 2;
    var end = current + 2;
    if (start < 1) {
      end += 1 - start;
      start = 1;
    }
    if (end > total) {
      start -= end - total;
      end = total;
      if (start < 1) start = 1;
    }
    return [for (var i = start; i <= end; i++) i];
  }
}

class _PageButton extends StatelessWidget {
  const _PageButton({
    required this.page,
    required this.selected,
    required this.onTap,
  });

  final int page;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.primary : AppColors.slate100,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: selected ? null : onTap,
        borderRadius: BorderRadius.circular(10),
        child: SizedBox(
          width: 36,
          height: 36,
          child: Center(
            child: Text(
              '$page',
              style: TextStyle(
                color: selected ? Colors.white : AppColors.textMain,
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
