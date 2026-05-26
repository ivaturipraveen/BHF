import 'server-only';
import { query } from '@/lib/db';
import type { AnnualReport } from '@/types/db';

const COLUMNS = `id, year, title, pdf_url, cover_image_url, display_order, created_at`;

export interface AnnualReportCreateInput {
  year: number;
  title?: string | null;
  pdf_url: string;
  cover_image_url?: string | null;
  display_order?: number;
}
export type AnnualReportUpdateInput = Partial<AnnualReportCreateInput>;

const UPDATABLE_FIELDS: ReadonlySet<string> = new Set([
  'year',
  'title',
  'pdf_url',
  'cover_image_url',
  'display_order',
]);

export async function listAllAnnualReports(): Promise<AnnualReport[]> {
  return query<AnnualReport>(
    `SELECT ${COLUMNS} FROM annual_reports ORDER BY year DESC`,
  );
}

export async function getAnnualReportById(id: string): Promise<AnnualReport | null> {
  const rows = await query<AnnualReport>(
    `SELECT ${COLUMNS} FROM annual_reports WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createAnnualReport(input: AnnualReportCreateInput): Promise<AnnualReport> {
  const rows = await query<AnnualReport>(
    `INSERT INTO annual_reports (year, title, pdf_url, cover_image_url, display_order)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING ${COLUMNS}`,
    [
      input.year,
      input.title ?? null,
      input.pdf_url,
      input.cover_image_url ?? null,
      input.display_order ?? 0,
    ],
  );
  return rows[0];
}

export async function updateAnnualReport(
  id: string,
  input: AnnualReportUpdateInput,
): Promise<AnnualReport | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    if (!UPDATABLE_FIELDS.has(k)) continue;
    fields.push(`${k} = $${idx}`);
    values.push(v);
    idx++;
  }
  if (fields.length === 0) return getAnnualReportById(id);
  values.push(id);
  const rows = await query<AnnualReport>(
    `UPDATE annual_reports SET ${fields.join(', ')} WHERE id = $${idx} RETURNING ${COLUMNS}`,
    values,
  );
  return rows[0] ?? null;
}

export async function deleteAnnualReport(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM annual_reports WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows.length > 0;
}
