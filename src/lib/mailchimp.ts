import 'server-only';
import { createHash } from 'crypto';

const API_KEY = process.env.MAILCHIMP_API_KEY;
const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
// Mailchimp keys end with '-usX' (datacenter / server prefix).
const SERVER = API_KEY?.split('-').pop() || '';

export const MAILCHIMP_ENABLED = !!(API_KEY && AUDIENCE_ID && SERVER);

interface MailchimpListsApi {
  setListMember: (
    audienceId: string,
    subscriberHash: string,
    body: {
      email_address: string;
      status?: 'subscribed' | 'unsubscribed' | 'pending';
      status_if_new?: 'subscribed' | 'pending';
      merge_fields?: Record<string, string>;
      tags?: string[];
    },
  ) => Promise<unknown>;
}

let client: { lists: MailchimpListsApi } | null = null;
if (MAILCHIMP_ENABLED) {
  try {
    const mailchimp = require('@mailchimp/mailchimp_marketing');
    mailchimp.setConfig({ apiKey: API_KEY, server: SERVER });
    client = mailchimp;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[mailchimp] failed to initialise client', err);
    client = null;
  }
}

export type MailchimpSyncStatus =
  | 'subscribed'
  | 'pending'
  | 'already'
  | 'stub'
  | 'error';

export interface MailchimpSyncResult {
  status: MailchimpSyncStatus;
  error?: string;
}

export async function syncNewsletterSubscription(
  email: string,
  source?: string,
  tags?: string[],
): Promise<MailchimpSyncResult> {
  if (!MAILCHIMP_ENABLED || !client || !AUDIENCE_ID) {
    return { status: 'stub' };
  }
  try {
    const subscriberHash = createHash('md5')
      .update(email.toLowerCase())
      .digest('hex');
    await client.lists.setListMember(AUDIENCE_ID, subscriberHash, {
      email_address: email,
      status_if_new: 'subscribed',
      merge_fields: source ? { SOURCE: source } : {},
      tags,
    });
    return { status: 'subscribed' };
  } catch (err) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err);
    // eslint-disable-next-line no-console
    console.error('[mailchimp]', message);
    return { status: 'error', error: message };
  }
}

export async function unsubscribeFromNewsletter(
  email: string,
): Promise<MailchimpSyncResult> {
  if (!MAILCHIMP_ENABLED || !client || !AUDIENCE_ID) {
    return { status: 'stub' };
  }
  try {
    const subscriberHash = createHash('md5')
      .update(email.toLowerCase())
      .digest('hex');
    await client.lists.setListMember(AUDIENCE_ID, subscriberHash, {
      email_address: email,
      status: 'unsubscribed',
      status_if_new: 'subscribed',
    });
    return { status: 'subscribed' };
  } catch (err) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err);
    // eslint-disable-next-line no-console
    console.error('[mailchimp][unsubscribe]', message);
    return { status: 'error', error: message };
  }
}
