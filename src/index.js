import * as submissionsCreate from '../functions/api/submissions-create.js';
import * as submissionsList from '../functions/api/submissions-list.js';
import * as submissionsGet from '../functions/api/submissions-get.js';
import * as submissionsComplete from '../functions/api/submissions-complete.js';
import * as submissionsAssign from '../functions/api/submissions-assign.js';
import * as attachmentUpload from '../functions/api/attachment-upload.js';
import * as attachmentGet from '../functions/api/attachment-get.js';

const ROUTES = {
  'POST /api/submissions-create': submissionsCreate.onRequestPost,
  'GET /api/submissions-list': submissionsList.onRequestGet,
  'GET /api/submissions-get': submissionsGet.onRequestGet,
  'POST /api/submissions-complete': submissionsComplete.onRequestPost,
  'POST /api/submissions-assign': submissionsAssign.onRequestPost,
  'POST /api/attachment-upload': attachmentUpload.onRequestPost,
  'GET /api/attachment-get': attachmentGet.onRequestGet,
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const key = `${request.method} ${url.pathname}`;
    const handler = ROUTES[key];

    if (handler) {
      try {
        return await handler({ request, env, ctx, params: {} });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Server error: ' + err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Anything not matched above is a static file (index.html, queue.html, export.html, etc.)
    return env.ASSETS.fetch(request);
  },
};
