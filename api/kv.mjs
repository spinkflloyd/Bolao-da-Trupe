import { neon } from '@neondatabase/serverless';

// Só estas chaves podem ser lidas/gravadas (as que o bolão usa).
const ALLOWED_KEYS = new Set(['users', 'rounds', 'picks', 'seededPlayersV1']);

export default async function handler(req, res) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'DATABASE_URL não configurada na Vercel.' });
    }
    const sql = neon(process.env.DATABASE_URL);

    if (req.method === 'GET') {
      const key = String(req.query.key || '');
      if (!ALLOWED_KEYS.has(key)) {
        return res.status(400).json({ error: 'Chave inválida.' });
      }
      const rows = await sql`select value from kv_store where key = ${key}`;
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ value: rows.length ? rows[0].value : null });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const key = String(body.key || '');
      if (!ALLOWED_KEYS.has(key)) {
        return res.status(400).json({ error: 'Chave inválida.' });
      }
      if (body.value === undefined) {
        return res.status(400).json({ error: 'Valor ausente.' });
      }
      await sql`
        insert into kv_store (key, value, updated_at)
        values (${key}, ${JSON.stringify(body.value)}::jsonb, now())
        on conflict (key) do update
        set value = excluded.value, updated_at = now()
      `;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (e) {
    console.error('kv error:', e);
    return res.status(500).json({ error: e && e.message ? e.message : 'Erro interno.' });
  }
}
