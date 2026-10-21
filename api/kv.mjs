import { neon } from '@neondatabase/serverless';

const ALLOWED_KEYS = new Set(['users', 'rounds', 'picks', 'seededPlayersV1']);

function send(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return send(res, 405, { error: 'Método não permitido.' });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return send(res, 500, { error: 'A variável DATABASE_URL não está configurada na Vercel.' });
  }

  try {
    const sql = neon(databaseUrl);

    if (req.method === 'GET') {
      const key = typeof req.query?.key === 'string' ? req.query.key : '';
      if (!ALLOWED_KEYS.has(key)) return send(res, 400, { error: 'Chave inválida ou não permitida.' });

      const rows = await sql`SELECT value FROM kv_store WHERE key = ${key} LIMIT 1`;
      return send(res, 200, { value: rows.length ? rows[0].value : null });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); }
      catch (_) { return send(res, 400, { error: 'JSON inválido no corpo da requisição.' }); }
    }

    const key = body?.key;
    if (typeof key !== 'string' || !ALLOWED_KEYS.has(key)) {
      return send(res, 400, { error: 'Chave inválida ou não permitida.' });
    }
    if (!Object.prototype.hasOwnProperty.call(body, 'value')) {
      return send(res, 400, { error: 'O campo value é obrigatório.' });
    }

    const value = JSON.stringify(body.value);
    await sql`
      INSERT INTO kv_store (key, value)
      VALUES (${key}, ${value}::jsonb)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
    return send(res, 200, { ok: true });
  } catch (error) {
    console.error('Erro na API /api/kv:', error);
    return send(res, 500, { error: 'Erro interno ao acessar o banco de dados.' });
  }
}