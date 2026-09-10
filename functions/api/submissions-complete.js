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

  const { id, pricedBy, pricedAt, customerCurrency, rates, items } = body || {};
  if (!id) return json({ error: 'id is required' }, 400);

  try {
    const existing = await env.DB.prepare('SELECT id FROM submissions WHERE id = ?').bind(id).first();
    if (!existing) return json({ error: 'Not found' }, 404);

    const now = Date.now();
    await env.DB.prepare(
      `UPDATE submissions SET status = 'completed', priced_by = ?, priced_at = ?, customer_currency = ?, rates_json = ?, items_json = ?, completed_at = ?
       WHERE id = ?`
    ).bind(
      pricedBy || '',
      pricedAt || now,
      customerCurrency || '',
      JSON.stringify(rates || {}),
      JSON.stringify(items || []),
      now,
      id
    ).run();

    return json({ ok: true });
  } catch (err) {
    return json({ error: 'Failed to complete submission: ' + err.message }, 500);
  }
}
