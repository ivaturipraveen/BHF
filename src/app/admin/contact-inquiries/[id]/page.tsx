import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdminPageSession } from '@/lib/adminSession';
import { getContactInquiryById } from '@/lib/queries/admin/contactInquiries';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Markdown } from '@/components/ui/Markdown';
import { InquiryStatusButtons } from '@/components/admin/InquiryStatusButtons';

export const dynamic = 'force-dynamic';

function formatDate(d: Date | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

export default async function AdminContactInquiryDetailPage({ params }: { params: { id: string } }) {
  await requireAdminPageSession();
  const inquiry = await getContactInquiryById(params.id);
  if (!inquiry) notFound();
  return (
    <div className="space-y-4 max-w-3xl">
      <Link href="/admin/contact-inquiries" className="text-xs text-warm-gray hover:text-indigo">← Back to inquiries</Link>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-indigo">{inquiry.name ?? '(no name)'}</h1>
          <p className="text-sm text-warm-gray">{inquiry.email ?? ''} · {inquiry.phone ?? ''}</p>
        </div>
        <Badge variant={inquiry.status === 'new' ? 'saffron' : inquiry.status === 'contacted' ? 'indigo' : 'gray'}>{inquiry.status}</Badge>
      </div>
      <Card>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
          <div>
            <dt className="text-warm-gray">Type</dt>
            <dd className="text-indigo">{inquiry.type}</dd>
          </div>
          <div>
            <dt className="text-warm-gray">Company</dt>
            <dd className="text-indigo">{inquiry.company ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-warm-gray">Submitted</dt>
            <dd className="text-indigo">{formatDate(inquiry.created_at)}</dd>
          </div>
          <div>
            <dt className="text-warm-gray">Handled at</dt>
            <dd className="text-indigo">{formatDate(inquiry.handled_at)}</dd>
          </div>
        </dl>
        <div>
          <p className="text-xs uppercase text-warm-gray mb-2">Message</p>
          <Markdown content={inquiry.message} />
        </div>
      </Card>
      <InquiryStatusButtons id={inquiry.id} status={inquiry.status} />
    </div>
  );
}
