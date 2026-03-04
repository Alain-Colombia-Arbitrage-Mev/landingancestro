export const prerender = false;

import type { APIRoute } from 'astro';
import pool from '../../../lib/db';
import { signPresaleToken } from '../../../lib/presale-auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { code } = body as { code?: string };

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Code is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const trimmed = code.trim().toUpperCase();

    const result = await pool.query(
      `SELECT id, code, max_uses, used_count, expires_at
       FROM presale_invite_codes
       WHERE UPPER(code) = $1
         AND used_count < max_uses
         AND (expires_at IS NULL OR expires_at > NOW())`,
      [trimmed]
    );

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'invalid_code' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const row = result.rows[0];

    await pool.query(
      'UPDATE presale_invite_codes SET used_count = used_count + 1 WHERE id = $1',
      [row.id]
    );

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await pool.query(
      'INSERT INTO presale_access_log (method, identifier, ip_address) VALUES ($1, $2, $3)',
      ['invite_code', trimmed, ip]
    );

    const accessToken = signPresaleToken(trimmed, 'invite_code');

    return new Response(
      JSON.stringify({ success: true, accessToken }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('verify-code error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'server_error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
