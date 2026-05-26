import 'server-only';
import { query } from '@/lib/db';
import type { AnnualReport } from '@/types/db';

const COLUMNS = `
  id, year, title, pdf_url, cover_image_url, display_order, created_at
`;

export async function listAnnualReports(): Promise<AnnualReport[]> {
  return query<AnnualReport>(
    `SELECT ${COLUMNS} FROM annual_reports
      ORDER BY year DESC, display_order ASC`,
  );
}
