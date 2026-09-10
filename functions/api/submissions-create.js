function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { sourcedBy, sourcedAt, items } = body || {};
  if (!sourcedBy || typeof sourcedBy !== 'string' || !sourcedBy.trim()) {
    return json({ error: 'sourcedBy is required' }, 400);
  }
  if (!Array.isArray(items) || items.length === 0) {
    return json({ error: 'At least one item is required' }, 400);
  }

  const id = crypto.randomUUID();
  const now = Date.now();
  const sourcedAtVal = sourcedAt || now;

  try {
    await env.DB.prepare(
      `INSERT INTO submissions (id, status, sourced_by, sourced_at, priced_by, priced_at, customer_currency, rates_json, items_json, assigned_to, created_at, completed_at)
       VALUES (?, 'pending', ?, ?, '', NULL, '', '{}', ?, '', ?, NULL)`
    ).bind(id, sourcedBy.trim(), sourcedAtVal, JSON.stringify(items), now).run();

    return json({ id }, 201);
  } catch (err) {
    return json({ error: 'Failed to save submission: ' + err.message }, 500);
  }
}
