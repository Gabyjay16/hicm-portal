export async function onRequest(context: any) {
  const { request, env } = context;

  if (request.method === 'GET') {
    try {
      // In a real app we would get the userId from session/token
      // For this prototype, we'll pass studentId as a query param
      const url = new URL(request.url);
      const studentId = url.searchParams.get('studentId');
      
      let query;
      let params: string[] = [];

      if (studentId) {
        query = `SELECT * FROM Complaints WHERE studentId = ? ORDER BY createdAt DESC`;
        params = [studentId];
      } else {
        // Admin view - get all
        query = `
          SELECT c.*, u.name as studentName 
          FROM Complaints c
          JOIN Users u ON c.studentId = u.id
          ORDER BY c.createdAt DESC
        `;
      }

      const stmt = env.DB.prepare(query);
      const { results } = await (params.length > 0 ? stmt.bind(...params) : stmt).all();

      return new Response(JSON.stringify({ success: true, data: results }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch complaints' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (request.method === 'POST') {
    try {
      const { studentId, subject, description, category } = await request.json();
      
      if (!studentId || !subject || !description || !category) {
         return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
      }

      const id = 'cmp-' + Date.now();
      await env.DB.prepare(
        `INSERT INTO Complaints (id, studentId, subject, description, category) VALUES (?, ?, ?, ?, ?)`
      ).bind(id, studentId, subject, description, category).run();

      return new Response(JSON.stringify({ success: true, id }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to submit complaint' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  
  if (request.method === 'PATCH') {
    try {
      // Admin updating a complaint status/response
      const { complaintId, status, adminResponse } = await request.json();
      
      if (!complaintId || !status) {
         return new Response(JSON.stringify({ success: false, error: 'Missing fields' }), { status: 400 });
      }

      await env.DB.prepare(
        `UPDATE Complaints SET status = ?, adminResponse = ? WHERE id = ?`
      ).bind(status, adminResponse || null, complaintId).run();

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to update complaint' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
