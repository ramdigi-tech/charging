import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChargingSession, ChargingStats } from '../types/charging';
import { formatJakartaDateShort, formatJakartaTimeOnly, getTimezone } from './dateUtils';

const imageToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const exportToPDF = async (
  sessions: ChargingSession[],
  stats: ChargingStats
) => {
  const doc = new jsPDF();
  const logoBase64 = await imageToBase64('/Logo DIGI RAM.png');

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Laporan Pengisian Daya', pageWidth / 2, 20, { align: 'center' });

  const now = new Date();
  const timezone = getTimezone();
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tanggal Ekspor: ${formatJakartaDateShort(now)} ${formatJakartaTimeOnly(now)} ${timezone}`, pageWidth / 2, 28, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Statistik Pengisian', pageWidth / 2, 41, { align: 'center' });

  const statsData = [
    ['Periode', 'Jumlah Pengisian'],
    ['Hari Ini', stats.today.toString()],
    ['Minggu Ini', stats.thisWeek.toString()],
    ['Bulan Ini', stats.thisMonth.toString()],
    ['Tahun Ini', stats.thisYear.toString()],
  ];

  autoTable(doc, {
    startY: 45,
    head: [statsData[0]],
    body: statsData.slice(1),
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      halign: 'center',
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 80, halign: 'center' },
      1: { cellWidth: 80, halign: 'center' },
    },
    margin: { left: (pageWidth - 160) / 2, right: (pageWidth - 160) / 2 },
  });

  const completedSessions = sessions.filter(s => !s.isActive && s.endTime);

  if (completedSessions.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 52;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Riwayat Pengisian', pageWidth / 2, finalY + 15, { align: 'center' });

    const timezone = getTimezone();
    const historyData = completedSessions.map((session, index) => {
      const duration = session.endTime
        ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000)
        : 0;
      const batteryGain = session.endBattery
        ? session.endBattery - session.startBattery
        : 0;

      return [
        (index + 1).toString(),
        formatJakartaDateShort(session.startTime),
        `${formatJakartaTimeOnly(session.startTime)} ${timezone}`,
        `${formatJakartaTimeOnly(session.endTime!)} ${timezone}`,
        `${duration} menit`,
        `${session.startBattery}%`,
        `${session.endBattery}%`,
        `${batteryGain}%`,
        session.location || '-',
      ];
    });

    autoTable(doc, {
      startY: finalY + 19,
      head: [['No', 'Tanggal', 'Mulai', 'Selesai', 'Durasi', 'Awal', 'Akhir', 'Penambahan', 'Lokasi']],
      body: historyData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 28, halign: 'center' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 15, halign: 'center' },
        6: { cellWidth: 15, halign: 'center' },
        7: { cellWidth: 25, halign: 'center' },
        8: { cellWidth: 25, halign: 'center' },
      },
      margin: { left: (pageWidth - 178) / 2, right: (pageWidth - 178) / 2 },
    });
  }

  const totalPages = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
    doc.addImage(logoBase64, 'PNG', pageWidth / 2 - 35, pageHeight / 2 - 35, 70, 70);
    doc.setGState(new (doc as any).GState({ opacity: 1 }));

    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    doc.setFontSize(7);
    doc.setTextColor(180);
    doc.text(
      'Charging Log Application by Ram Digi Tech',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const printWindow = window.open(pdfUrl, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
