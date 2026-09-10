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

  const { id, assignedTo } = body || {};
  if (!id) return json({ error: 'id is required' }, 400);

  try {
    const existing = await env.DB.prepare('SELECT id FROM submissions WHERE id = ?').bind(id).first();
    if (!existing) return json({ error: 'Not found' }, 404);

    await env.DB.prepare('UPDATE submissions SET assigned_to = ? WHERE id = ?')
      .bind(assignedTo || '', id).run();

    return json({ ok: true });
  } catch (err) {
    return json({ error: 'Failed to assign: ' + err.message }, 500);
  }
}
