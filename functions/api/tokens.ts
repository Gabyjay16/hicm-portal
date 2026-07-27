export async function onRequest(context: any) {
  const { request, env } = context;

  if (request.method === 'GET') {
    try {
      const url = new URL(request.url);
      const studentId = url.searchParams.get('studentId');
      
      let query = `
        SELECT t.*, u.name as studentName, u.studentId as matriculation 
        FROM TokenRequests t
        JOIN Users u ON t.studentId = u.id
      `;
      let params: string[] = [];

      if (studentId) {
        query += ` WHERE t.studentId = ?`;
        params.push(studentId);
      }
      
      query += ` ORDER BY t.createdAt DESC`;

      const stmt = env.DB.prepare(query);
      const results = studentId ? await stmt.bind(...params).all() : await stmt.all();

      return new Response(JSON.stringify({ success: true, data: results.results }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch token requests' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (request.method === 'POST') {
    try {
      const { studentId, amount, amountPaid } = await request.json();
      
      if (!studentId || !amount) {
         return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
      }

      const id = 'req-' + Date.now();
      await env.DB.prepare(
        `INSERT INTO TokenRequests (id, studentId, amount, amountPaid) VALUES (?, ?, ?, ?)`
      ).bind(id, studentId, amount, amountPaid || 0).run();

      return new Response(JSON.stringify({ success: true, id }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to request tokens' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (request.method === 'PATCH') {
    try {
      const { requestId, status } = await request.json();
      
      if (!requestId || !status) {
         return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
      }

      const req = await env.DB.prepare(`SELECT * FROM TokenRequests WHERE id = ?`).bind(requestId).first();
      if (!req) {
         return new Response(JSON.stringify({ success: false, error: 'Request not found' }), { status: 404 });
      }

      await env.DB.prepare(`UPDATE TokenRequests SET status = ? WHERE id = ?`).bind(status, requestId).run();

      if (status === 'approved') {
        await env.DB.prepare(`UPDATE Users SET plagiarismTokens = plagiarismTokens + ? WHERE id = ?`).bind(req.amount, req.studentId).run();
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to update token request' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
