function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function rowToSubmission(row) {
  return {
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
  };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  try {
    let query = 'SELECT * FROM submissions WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (from) {
      query += ' AND created_at >= ?';
      params.push(Number(from));
    }
    if (to) {
      query += ' AND created_at <= ?';
      params.push(Number(to));
    }
    query += ' ORDER BY created_at DESC';

    const stmt = env.DB.prepare(query).bind(...params);
    const result = await stmt.all();
    const submissions = (result.results || []).map(rowToSubmission);

    return json({ submissions });
  } catch (err) {
    return json({ error: 'Failed to list submissions: ' + err.message }, 500);
  }
}
