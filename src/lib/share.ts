export interface ShareTarget {
  url: string;
  title?: string;
  text?: string;
}

export function twitterShareUrl({ url, text }: ShareTarget): string {
  const params = new URLSearchParams({ url });
  if (text) params.set("text", text);
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function facebookShareUrl({ url }: ShareTarget): string {
  const params = new URLSearchParams({ u: url });
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

export function mailtoShareUrl({ url, title, text }: ShareTarget): string {
  const subject = title ?? "Bharatiya Heritage Foundation";
  const body = `${text ? `${text}\n\n` : ""}${url}`;
  const params = new URLSearchParams({ subject, body });
  return `mailto:?${params.toString()}`;
}

export function copyLinkUrl({ url }: ShareTarget): string {
  return url;
}
