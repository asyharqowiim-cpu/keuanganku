import { jsPDF } from 'jspdf';
import { TransactionItem } from '../types/finance';
import {
  formatIDR,
  formatDateID,
  formatMonthLabel,
  getTodayDateString,
} from './formatters';

export interface ExportPDFReportParams {
  activeMonth: string;
  monthTransactions: TransactionItem[];
  totalIncomeMonth: number;
  totalExpenseMonth: number;
  netCashflowMonth: number;
  totalSavingsAccumulated: number;
  totalNetWorth: number;
  isVaultLocked: boolean;
  userName?: string | null;
  userEmail?: string | null;
}

export function generateFinancialReportPDF({
  activeMonth,
  monthTransactions,
  totalIncomeMonth,
  totalExpenseMonth,
  netCashflowMonth,
  totalSavingsAccumulated,
  totalNetWorth,
  isVaultLocked,
  userName,
  userEmail,
}: ExportPDFReportParams): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  let y = 16;

  const todayStr = getTodayDateString();
  const periodLabel = formatMonthLabel(activeMonth);
  const totalOverallVolume = totalIncomeMonth + totalExpenseMonth;

  const incomeList = [...monthTransactions]
    .filter((t) => t.type === 'income')
    .sort((a, b) => a.date.localeCompare(b.date));

  const expenseList = [...monthTransactions]
    .filter((t) => t.type === 'expense')
    .sort((a, b) => a.date.localeCompare(b.date));

  const drawHorizontalSeparator = (
    yPos: number,
    thickness = 0.4,
    color: [number, number, number] = [148, 163, 184]
  ) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(thickness);
    doc.line(marginX, yPos, pageWidth - marginX, yPos);
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - 18) {
      doc.addPage();
      y = 16;
      // Top mini-header on continuation pages
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `LAPORAN KEUANGAN KEUANGANKU — PERIODE ${periodLabel.toUpperCase()}`,
        marginX,
        y
      );
      y += 3;
      drawHorizontalSeparator(y, 0.35, [203, 213, 225]);
      y += 6;
    }
  };

  // =========================================================================
  // 1. HEADER & JUDUL REPORT DENGAN GARIS PEMISAH
  // =========================================================================
  doc.setFillColor(15, 23, 42); // Slate-900 header banner
  doc.roundedRect(marginX, y, contentWidth, 26, 2.5, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('LAPORAN KEUANGAN BULANAN — KEUANGANKU', marginX + 6, y + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(186, 230, 253);
  doc.text(
    'Laporan Rincian Pemasukan, Pengeluaran, dan Rekapitulasi Total Keseluruhan',
    marginX + 6,
    y + 15.5
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(
    `Periode: ${periodLabel}   |   Tanggal Cetak: ${formatDateID(todayStr)}`,
    marginX + 6,
    y + 21.5
  );

  y += 30;

  // Sub-header metadata & account info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const accountLabel = userName
    ? `${userName}${userEmail ? ` (${userEmail})` : ''}`
    : userEmail || 'Penyimpanan Lokal / Pengguna Keuanganku';
  doc.text(`Akun Pengguna : ${accountLabel}`, marginX, y);
  doc.text(
    `Total Catatan : ${monthTransactions.length} Transaksi (${incomeList.length} Pemasukan, ${expenseList.length} Pengeluaran)`,
    pageWidth - marginX,
    y,
    { align: 'right' }
  );

  y += 3.5;
  // Double separator line below report title & metadata
  drawHorizontalSeparator(y, 0.7, [30, 64, 175]);
  drawHorizontalSeparator(y + 1.2, 0.25, [148, 163, 184]);
  y += 7;

  // =========================================================================
  // 2. RINGKASAN EKSEKUTIF (PEMASUKAN, PENGELUARAN & TOTAL KESELURUHAN)
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('I. RINGKASAN TOTAL KEUANGAN BULAN INI', marginX, y);
  y += 2.5;
  drawHorizontalSeparator(y, 0.4, [37, 99, 235]);
  y += 4;

  // 3 Summary Cards side-by-side
  const cardGap = 4;
  const cardW = (contentWidth - cardGap * 2) / 3;
  const cardH = 20;

  // Card 1: Total Pemasukan
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(167, 243, 208);
  doc.setLineWidth(0.35);
  doc.roundedRect(marginX, y, cardW, cardH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(21, 128, 61);
  doc.text('TOTAL PEMASUKAN (INCOME)', marginX + 3.5, y + 6);
  doc.setFontSize(11);
  doc.text(
    `+ ${formatIDR(totalIncomeMonth, isVaultLocked)}`,
    marginX + 3.5,
    y + 12.5
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`${incomeList.length} transaksi masuk`, marginX + 3.5, y + 17.2);

  // Card 2: Total Pengeluaran
  const card2X = marginX + cardW + cardGap;
  doc.setFillColor(255, 241, 242);
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(card2X, y, cardW, cardH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(190, 18, 60);
  doc.text('TOTAL PENGELUARAN (EXPENSE)', card2X + 3.5, y + 6);
  doc.setFontSize(11);
  doc.text(
    `- ${formatIDR(totalExpenseMonth, isVaultLocked)}`,
    card2X + 3.5,
    y + 12.5
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`${expenseList.length} transaksi keluar`, card2X + 3.5, y + 17.2);

  // Card 3: Total Keseluruhan / Saldo Kas Bersih
  const card3X = marginX + (cardW + cardGap) * 2;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(card3X, y, cardW, cardH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(29, 78, 216);
  doc.text('SALDO BERSIH (SURPLUS / DEFISIT)', card3X + 3.5, y + 6);
  doc.setFontSize(11);
  const netSign = netCashflowMonth >= 0 ? '+' : '';
  doc.text(
    `${netSign}${formatIDR(netCashflowMonth, isVaultLocked)}`,
    card3X + 3.5,
    y + 12.5
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    `Total Volume: ${formatIDR(totalOverallVolume, isVaultLocked)}`,
    card3X + 3.5,
    y + 17.2
  );

  y += cardH + 6;
  drawHorizontalSeparator(y, 0.3, [203, 213, 225]);
  y += 6;

  // =========================================================================
  // HELPER UNTUK MENGGAMBAR TABEL RINCIAN TRANSAKSI
  // =========================================================================
  const drawTransactionTable = (
    sectionTitle: string,
    items: TransactionItem[],
    subtotalAmount: number,
    subtotalLabel: string,
    accentRGB: [number, number, number],
    lightBgRGB: [number, number, number],
    signPrefix: string
  ) => {
    ensureSpace(32);

    // Section Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(sectionTitle, marginX, y);
    y += 2.5;
    drawHorizontalSeparator(y, 0.5, accentRGB);
    y += 3.5;

    // Column layout (Total = 182mm)
    // No (10) | Tanggal (25) | Kategori (34) | Deskripsi & Catatan (53) | Rekening (26) | Nominal (34)
    const colNoX = marginX + 2;
    const colDateX = marginX + 11;
    const colCatX = marginX + 36;
    const colDescX = marginX + 70;
    const colAccX = marginX + 123;
    const colAmtRightX = pageWidth - marginX - 2;

    const drawTableHeader = () => {
      doc.setFillColor(accentRGB[0], accentRGB[1], accentRGB[2]);
      doc.rect(marginX, y, contentWidth, 7.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('No', colNoX, y + 5);
      doc.text('Tanggal', colDateX, y + 5);
      doc.text('Kategori', colCatX, y + 5);
      doc.text('Deskripsi / Catatan', colDescX, y + 5);
      doc.text('Rekening', colAccX, y + 5);
      doc.text('Nominal (IDR)', colAmtRightX, y + 5, { align: 'right' });
      y += 7.5;
      drawHorizontalSeparator(y, 0.4, accentRGB);
    };

    drawTableHeader();

    if (items.length === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, y, contentWidth, 9, 'F');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'Belum ada catatan transaksi pada bagian ini untuk periode terpilih.',
        marginX + 4,
        y + 5.8
      );
      y += 9;
      drawHorizontalSeparator(y, 0.3, [203, 213, 225]);
    } else {
      items.forEach((tx, idx) => {
        const descText = isVaultLocked
          ? 'TERKUNCI'
          : tx.notes
          ? `${tx.title} (${tx.notes})`
          : tx.title;

        const wrappedDesc = doc.splitTextToSize(descText || '-', 50);
        const wrappedCat = doc.splitTextToSize(tx.category || '-', 32);
        const wrappedAcc = doc.splitTextToSize(tx.account || '-', 24);

        const maxLines = Math.max(
          wrappedDesc.length,
          wrappedCat.length,
          wrappedAcc.length,
          1
        );
        const rowHeight = Math.max(7.5, maxLines * 4.2 + 2.8);

        if (y + rowHeight > pageHeight - 22) {
          doc.addPage();
          y = 16;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);
          doc.text(`${sectionTitle} (Lanjutan)`, marginX, y);
          y += 3;
          drawTableHeader();
        }

        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(marginX, y, contentWidth, rowHeight, 'F');
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);

        const textBaseY = y + 4.8;
        doc.text(String(idx + 1), colNoX, textBaseY);
        doc.text(formatDateID(tx.date), colDateX, textBaseY);
        doc.text(wrappedCat, colCatX, textBaseY);
        doc.text(wrappedDesc, colDescX, textBaseY);
        doc.text(wrappedAcc, colAccX, textBaseY);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(accentRGB[0], accentRGB[1], accentRGB[2]);
        doc.text(
          `${signPrefix}${formatIDR(tx.amount, isVaultLocked)}`,
          colAmtRightX,
          textBaseY,
          { align: 'right' }
        );

        y += rowHeight;
        // Garis pemisah antar baris transaksi
        drawHorizontalSeparator(y, 0.2, [226, 232, 240]);
      });
    }

    // Garis pemisah tebal sebelum baris Subtotal/Total
    ensureSpace(12);
    drawHorizontalSeparator(y, 0.5, accentRGB);
    doc.setFillColor(lightBgRGB[0], lightBgRGB[1], lightBgRGB[2]);
    doc.rect(marginX, y, contentWidth, 8.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `${subtotalLabel} (${items.length} Transaksi)`,
      marginX + 3,
      y + 5.7
    );

    doc.setTextColor(accentRGB[0], accentRGB[1], accentRGB[2]);
    doc.text(
      `${signPrefix}${formatIDR(subtotalAmount, isVaultLocked)}`,
      colAmtRightX,
      y + 5.7,
      { align: 'right' }
    );

    y += 8.5;
    drawHorizontalSeparator(y, 0.5, accentRGB);
    y += 8;
  };

  // =========================================================================
  // 3. TABEL RINCIAN PEMASUKAN LENGKAP
  // =========================================================================
  drawTransactionTable(
    `II. RINCIAN LENGKAP PEMASUKAN (INCOME) — ${periodLabel.toUpperCase()}`,
    incomeList,
    totalIncomeMonth,
    'TOTAL PEMASUKAN',
    [5, 150, 105], // Emerald-600
    [236, 253, 245], // Emerald-50
    '+ '
  );

  // =========================================================================
  // 4. TABEL RINCIAN PENGELUARAN LENGKAP
  // =========================================================================
  drawTransactionTable(
    `III. RINCIAN LENGKAP PENGELUARAN (EXPENSE) — ${periodLabel.toUpperCase()}`,
    expenseList,
    totalExpenseMonth,
    'TOTAL PENGELUARAN',
    [225, 29, 72], // Rose-600
    [255, 241, 242], // Rose-50
    '- '
  );

  // =========================================================================
  // 5. REKAPITULASI TOTAL KESELURUHAN DENGAN GARIS PEMISAH
  // =========================================================================
  ensureSpace(58);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `IV. REKAPITULASI AKHIR & TOTAL KESELURUHAN (${periodLabel.toUpperCase()})`,
    marginX,
    y
  );
  y += 2.5;
  drawHorizontalSeparator(y, 0.55, [15, 23, 42]);
  y += 3.5;

  const summaryRows: Array<{
    label: string;
    value: string;
    bold?: boolean;
    color?: [number, number, number];
    highlightBg?: [number, number, number];
  }> = [
    {
      label: `1. Total Pemasukan (${incomeList.length} transaksi masuk)`,
      value: `+ ${formatIDR(totalIncomeMonth, isVaultLocked)}`,
      color: [5, 150, 105],
    },
    {
      label: `2. Total Pengeluaran (${expenseList.length} transaksi keluar)`,
      value: `- ${formatIDR(totalExpenseMonth, isVaultLocked)}`,
      color: [225, 29, 72],
    },
    {
      label: `3. Total Keseluruhan Nilai Transaksi (Pemasukan + Pengeluaran)`,
      value: formatIDR(totalOverallVolume, isVaultLocked),
      bold: true,
      color: [30, 41, 59],
    },
    {
      label: `4. Total Keseluruhan Arus Kas Bersih (Total Pemasukan - Total Pengeluaran)`,
      value: `${netCashflowMonth >= 0 ? '+ ' : ''}${formatIDR(
        netCashflowMonth,
        isVaultLocked
      )}`,
      bold: true,
      color: netCashflowMonth >= 0 ? [29, 78, 216] : [190, 18, 60],
      highlightBg: [239, 246, 255],
    },
    {
      label: `5. Total Saldo Tabungan & Dana Darurat Terkumpul`,
      value: formatIDR(totalSavingsAccumulated, isVaultLocked),
      color: [30, 41, 59],
    },
    {
      label: `6. Estimasi Total Kekayaan Bersih Akun`,
      value: formatIDR(totalNetWorth, isVaultLocked),
      bold: true,
      color: [15, 23, 42],
    },
  ];

  summaryRows.forEach((row) => {
    const rowH = row.bold ? 8.2 : 7.2;
    if (row.highlightBg) {
      doc.setFillColor(
        row.highlightBg[0],
        row.highlightBg[1],
        row.highlightBg[2]
      );
      doc.rect(marginX, y, contentWidth, rowH, 'F');
    }
    doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
    doc.setFontSize(row.bold ? 9 : 8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(row.label, marginX + 3, y + 5);

    const valColor = row.color || [15, 23, 42];
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(valColor[0], valColor[1], valColor[2]);
    doc.text(row.value, pageWidth - marginX - 3, y + 5, { align: 'right' });

    y += rowH;
    drawHorizontalSeparator(
      y,
      row.bold ? 0.45 : 0.25,
      row.bold ? [100, 116, 139] : [203, 213, 225]
    );
  });

  // Footer with page numbers & separator line on every page
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawHorizontalSeparator(pageHeight - 13, 0.35, [203, 213, 225]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Keuanganku — Laporan Keuangan Resmi (${periodLabel}) · Dicetak pada ${formatDateID(
        todayStr
      )}`,
      marginX,
      pageHeight - 8.5
    );
    doc.text(
      `Halaman ${p} dari ${totalPages}`,
      pageWidth - marginX,
      pageHeight - 8.5,
      { align: 'right' }
    );
  }

  doc.save(`Laporan_Keuanganku_${activeMonth}.pdf`);
}
