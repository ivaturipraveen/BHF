import 'server-only';

export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  const dangerous = /^[=+\-@\t\r]/.test(s);
  const cell = dangerous ? `'${s}` : s;
  if (/[",\n]/.test(cell)) return '"' + cell.replace(/"/g, '""') + '"';
  return cell;
}
