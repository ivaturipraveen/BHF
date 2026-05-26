import { NextResponse, type NextRequest } from 'next/server';
import { adminGuard } from '@/lib/adminGuard';
import {
  exportEnrollmentsCsv,
  listAllEnrollments,
  listEnrollmentsByProgram,
} from '@/lib/queries/admin/youthRegistrations';
import { uuidParamSchema } from '@/lib/adminValidation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await adminGuard(req, { roles: ['super_admin', 'editor'] });
  if (!guard.ok) return guard.response;
  const url = new URL(req.url);
  const programId = url.searchParams.get('program_id');
  const format = url.searchParams.get('format');
  let programIdValidated: string | undefined;
  if (programId) {
    const parsed = uuidParamSchema.safeParse(programId);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid program_id.' }, { status: 400 });
    programIdValidated = parsed.data;
  }
  if (format === 'csv') {
    const csv = await exportEnrollmentsCsv(programIdValidated);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="youth-enrollments.csv"',
      },
    });
  }
  const enrollments = programIdValidated
    ? await listEnrollmentsByProgram(programIdValidated)
    : await listAllEnrollments();
  return NextResponse.json({ enrollments }, { status: 200 });
}
