import Link from 'next/link';

interface Props {
  title: string;
  description?: string;
  newHref?: string;
  newLabel?: string;
  extra?: React.ReactNode;
}

export function AdminListHeader({ title, description, newHref, newLabel = 'New', extra }: Props) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
      <div>
        <h1 className="font-display text-3xl text-indigo">{title}</h1>
        {description && <p className="text-sm text-warm-gray mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {extra}
        {newHref && (
          <Link
            href={newHref}
            className="inline-flex items-center px-4 h-11 min-h-[44px] rounded-full bg-saffron text-white text-sm font-semibold hover:bg-amber-burnt shadow"
          >
            {newLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
