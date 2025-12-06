import { ChargingSession } from '../types/charging';
import * as XLSX from 'xlsx';
import { formatJakartaDateShort, formatJakartaTimeOnly } from './dateUtils';

export interface BackupData {
  version: string;
  exportDate: string;
  sessions: ChargingSession[];
}

export const createBackup = (sessions: ChargingSession[]): void => {
  const excelData = sessions.map((session, index) => {
    const duration = session.endTime
      ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000)
      : 0;
    const batteryGain = session.endBattery
      ? session.endBattery - session.startBattery
      : 0;

    return {
      'No': index + 1,
      'Tanggal': formatJakartaDateShort(session.startTime),
      'Waktu Mulai': formatJakartaTimeOnly(session.startTime),
      'Waktu Selesai': session.endTime ? formatJakartaTimeOnly(session.endTime) : '-',
      'Durasi (menit)': session.endTime ? duration : '-',
      'Baterai Awal (%)': session.startBattery,
      'Baterai Akhir (%)': session.endBattery || '-',
      'Penambahan (%)': session.endBattery ? batteryGain : '-',
      'Lokasi': session.location || '-',
      'ID': session.id,
      'Start Time ISO': session.startTime.toISOString(),
      'End Time ISO': session.endTime ? session.endTime.toISOString() : '',
      'Is Active': session.isActive ? 'Ya' : 'Tidak',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  const colWidths = [
    { wch: 5 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 25 },
    { wch: 25 },
    { wch: 10 },
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Pengisian');

  const fileName = `CLA_Backup_${new Date().getFullYear()}_${(new Date().getMonth() + 1).toString().padStart(2, '0')}_${new Date().getDate().toString().padStart(2, '0')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const restoreBackup = (file: File): Promise<ChargingSession[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonData || jsonData.length === 0) {
          throw new Error('File Excel kosong atau tidak valid');
        }

        const sessions: ChargingSession[] = jsonData.map((row: any) => {
          const startTimeISO = row['Start Time ISO'];
          const endTimeISO = row['End Time ISO'];

          if (!startTimeISO) {
            throw new Error('Data tidak lengkap: Start Time ISO tidak ditemukan');
          }

          return {
            id: row['ID'] || Date.now().toString() + Math.random(),
            startTime: new Date(startTimeISO),
            startBattery: Number(row['Baterai Awal (%)']) || 0,
            endTime: endTimeISO ? new Date(endTimeISO) : undefined,
            endBattery: row['Baterai Akhir (%)'] !== '-' ? Number(row['Baterai Akhir (%)']) : undefined,
            isActive: row['Is Active'] === 'Ya',
            location: row['Lokasi'] !== '-' ? row['Lokasi'] : undefined,
          };
        });

        resolve(sessions);
      } catch (error) {
        reject(new Error('Gagal membaca file Excel. Pastikan file valid'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file'));
    };

    reader.readAsArrayBuffer(file);
  });
};
