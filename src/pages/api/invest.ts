export const prerender = false;

import type { APIRoute } from 'astro';
import { createRecord, getAirtableEnv, getTableId } from '../../lib/airtable';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { name, email, phone, amount, message } = body as Record<string, string>;

    if (!email?.trim()) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fields: Record<string, string> = {
      'Full Name': name?.trim() || '',
      'Email': email.trim(),
      'Investment Range (USD)': amount?.trim() || '',
      'Message': message?.trim() || '',
    };

    if (phone?.trim()) fields['Phone'] = phone.trim();

    const config = getAirtableEnv(locals);
    const tableId = getTableId(locals, 'AIRTABLE_INVEST_FORM');
    const result = await createRecord(config, tableId, fields);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: result.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
