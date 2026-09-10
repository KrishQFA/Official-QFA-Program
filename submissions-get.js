function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'id is required' }, 400);

  try {
    const row = await env.DB.prepare('SELECT * FROM submissions WHERE id = ?').bind(id).first();
    if (!row) return json({ error: 'Not found' }, 404);

    return json({
      submission: {
        id: row.id,
        status: row.status,
        sourcedBy: row.sourced_by,
        sourcedAt: row.sourced_at,
        pricedBy: row.priced_by,
        pricedAt: row.priced_at,
        customerCurrency: row.customer_currency,
        rates: row.rates_json ? JSON.parse(row.rates_json) : {},
        items: row.items_json ? JSON.parse(row.items_json) : [],
        assignedTo: row.assigned_to,
        createdAt: row.created_at,
        completedAt: row.completed_at,
      }
    });
  } catch (err) {
    return json({ error: 'Failed to fetch submission: ' + err.message }, 500);
  }
}
