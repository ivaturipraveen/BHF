import { Card } from '@/components/ui/Card';
import { EmptyStateIllustration } from '@/components/ui/EmptyState';

interface Props<Row> {
  rows: Row[];
  columns: Array<{
    header: string;
    cell: (row: Row) => React.ReactNode;
    className?: string;
  }>;
  emptyMessage?: string;
  rowKey: (row: Row) => string;
}

export function AdminTable<Row>({ rows, columns, emptyMessage = 'No items yet.', rowKey }: Props<Row>) {
  if (rows.length === 0) {
    return (
      <Card className="flex flex-col items-center text-center gap-3 py-10">
        <EmptyStateIllustration />
        <p className="font-display text-lg text-indigo">{emptyMessage}</p>
      </Card>
    );
  }
  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-2xl">
      <table className="min-w-full">
        <thead>
          <tr className="bg-indigo">
            {columns.map((col) => (
              <th
                key={col.header}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cream ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowKey(row)}
              className={`${rowIdx % 2 === 0 ? 'bg-white' : 'bg-cream/40'} hover:bg-cream/60 transition-colors`}
            >
              {columns.map((col, idx) => (
                <td
                  key={idx}
                  className={`px-4 py-3 text-sm text-indigo border-b border-gray-100 ${col.className ?? ''}`}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
