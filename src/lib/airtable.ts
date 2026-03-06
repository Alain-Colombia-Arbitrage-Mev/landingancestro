const AIRTABLE_API = 'https://api.airtable.com/v0';

export interface AirtableResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function createRecord(
  tableId: string,
  fields: Record<string, unknown>,
): Promise<AirtableResult> {
  const token = import.meta.env.AIRTABLE_TOKEN;
  const baseId = import.meta.env.AIRTABLE_BASE_ID;

  console.log('[Airtable] token exists:', !!token, '| baseId:', baseId, '| tableId:', tableId);
  console.log('[Airtable] fields:', JSON.stringify(fields));

  if (!token || !baseId) {
    return { success: false, error: `Missing Airtable configuration (token: ${!!token}, baseId: ${!!baseId})` };
  }

  if (!tableId) {
    return { success: false, error: 'Missing table ID' };
  }

  const url = `${AIRTABLE_API}/${baseId}/${tableId}`;
  console.log('[Airtable] POST', url);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('[Airtable] Error:', res.status, body);
    return { success: false, error: `Airtable ${res.status}: ${body}` };
  }

  const data = (await res.json()) as { id: string };
  console.log('[Airtable] Created record:', data.id);
  return { success: true, id: data.id };
}
