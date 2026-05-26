import { Card } from '@/components/ui/Card';

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
      <Card>
        <p className="text-sm text-warm-gray">{emptyMessage}</p>
      </Card>
    );
  }
  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-warm-gray ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-gray-50">
              {columns.map((col, idx) => (
                <td key={idx} className={`px-4 py-3 text-sm text-indigo ${col.className ?? ''}`}>
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
