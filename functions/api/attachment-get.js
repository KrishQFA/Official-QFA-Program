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
    const object = await env.ATTACHMENTS.get(id);
    if (!object) return json({ error: 'Not found' }, 404);

    const filename = (object.customMetadata && object.customMetadata.filename) || 'file';
    const contentType = (object.httpMetadata && object.httpMetadata.contentType) || 'application/octet-stream';

    return new Response(object.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename.replace(/"/g, '')}"`,
      },
    });
  } catch (err) {
    return json({ error: 'Failed to fetch file: ' + err.message }, 500);
  }
}
