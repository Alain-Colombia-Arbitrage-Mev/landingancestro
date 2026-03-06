export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as any).runtime;
  const cfEnv = runtime?.env ?? {};

  const keys = [
    'AIRTABLE_TOKEN',
    'AIRTABLE_BASE_ID',
    'AIRTABLE_CONTACT_FORM',
    'AIRTABLE_WAITLIST_FORM',
    'AIRTABLE_INVEST_FORM',
  ];

  const debug: Record<string, any> = {
    hasRuntime: !!runtime,
    hasRuntimeEnv: !!runtime?.env,
    runtimeEnvKeys: runtime?.env ? Object.keys(runtime.env) : [],
    vars: {},
  };

  for (const key of keys) {
    const cfVal = cfEnv[key];
    const metaVal = import.meta.env[key];
    debug.vars[key] = {
      fromCfEnv: cfVal ? `${cfVal.substring(0, 4)}...` : null,
      fromMetaEnv: metaVal ? `${metaVal.substring(0, 4)}...` : null,
      resolved: cfVal ?? metaVal ? 'OK' : 'MISSING',
    };
  }

  return new Response(JSON.stringify(debug, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
