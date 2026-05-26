import Link from 'next/link';

interface Props {
  action: string;
  defaultValue?: string;
  placeholder?: string;
  filters?: Array<{ name: string; value: string }>;
  clearHref?: string;
}

export function AdminSearchForm({ action, defaultValue, placeholder = 'Search…', filters, clearHref }: Props) {
  return (
    <form action={action} method="GET" className="flex items-center gap-2 w-full sm:max-w-sm">
      <input
        type="search"
        name="search"
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className="flex-1 h-11 rounded-md border border-gray-300 bg-white px-3 text-sm text-indigo focus:outline-none focus:ring-2 focus:ring-saffron focus:border-saffron"
      />
      {filters?.map((f) => (
        <input key={f.name} type="hidden" name={f.name} value={f.value} />
      ))}
      <button
        type="submit"
        className="px-4 h-11 min-h-[44px] rounded-md bg-indigo text-white text-sm font-medium hover:bg-indigo/90"
      >
        Search
      </button>
      {clearHref && defaultValue && (
        <Link
          href={clearHref}
          className="px-4 h-11 min-h-[44px] inline-flex items-center rounded-md text-sm text-warm-gray hover:bg-gray-100"
        >
          Clear
        </Link>
      )}
    </form>
  );
}
