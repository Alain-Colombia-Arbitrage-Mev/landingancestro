const AIRTABLE_API = 'https://api.airtable.com/v0';

export interface AirtableResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface AirtableConfig {
  token: string;
  baseId: string;
}

export function getAirtableEnv(locals: App.Locals): AirtableConfig {
  const runtime = (locals as any).runtime;
  const env = runtime?.env ?? {};

  return {
    token: env.AIRTABLE_TOKEN ?? import.meta.env.AIRTABLE_TOKEN ?? '',
    baseId: env.AIRTABLE_BASE_ID ?? import.meta.env.AIRTABLE_BASE_ID ?? '',
  };
}

export function getTableId(locals: App.Locals, key: string): string {
  const runtime = (locals as any).runtime;
  const env = runtime?.env ?? {};
  return env[key] ?? import.meta.env[key] ?? '';
}

export async function createRecord(
  config: AirtableConfig,
  tableId: string,
  fields: Record<string, unknown>,
): Promise<AirtableResult> {
  if (!config.token || !config.baseId) {
    return { success: false, error: 'Missing Airtable configuration' };
  }

  if (!tableId) {
    return { success: false, error: 'Missing table ID' };
  }

  const url = `${AIRTABLE_API}/${config.baseId}/${tableId}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { success: false, error: `Airtable ${res.status}: ${body}` };
  }

  const data = (await res.json()) as { id: string };
  return { success: true, id: data.id };
}
