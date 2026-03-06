export const prerender = false;

import type { APIRoute } from 'astro';
import { createRecord } from '../../lib/airtable';

const TABLE_ID = import.meta.env.AIRTABLE_WAITLIST_FORM;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, phone, country } = body as Record<string, string>;

    if (!email?.trim()) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fields: Record<string, unknown> = {
      'Email': email.trim(),
      'Accepted Terms': true,
    };

    if (name?.trim()) fields['Full Name'] = name.trim();
    if (phone?.trim()) fields['Phone'] = phone.trim();
    if (country?.trim()) fields['Country of Residence'] = country.trim();

    const result = await createRecord(TABLE_ID, fields);

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
