function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const MAX_BYTES = 3.7 * 1024 * 1024;

function base64ToBytes(base64) {
  const binStr = atob(base64);
  const bytes = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
  return bytes;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { filename, contentType, dataBase64 } = body || {};
  if (!filename || !dataBase64) {
    return json({ error: 'filename and dataBase64 are required' }, 400);
  }

  let bytes;
  try {
    bytes = base64ToBytes(dataBase64);
  } catch (err) {
    return json({ error: 'Invalid file data' }, 400);
  }

  if (bytes.length > MAX_BYTES) {
    return json({ error: 'File too large — max 3.5MB per file' }, 413);
  }

  try {
    const fileId = crypto.randomUUID();
    await env.ATTACHMENTS.put(fileId, bytes, {
      httpMetadata: { contentType: contentType || 'application/octet-stream' },
      customMetadata: { filename },
    });
    return json({ fileId, filename, size: bytes.length, contentType: contentType || 'application/octet-stream' }, 201);
  } catch (err) {
    return json({ error: 'Failed to store file: ' + err.message }, 500);
  }
}
