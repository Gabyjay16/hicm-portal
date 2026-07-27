export async function onRequest(context: any) {
  const { request, env } = context;

  if (request.method === 'GET') {
    try {
      // Get all active lost and found items
      const query = `
        SELECT lf.*, u.name as reporterName
        FROM LostAndFound lf
        JOIN Users u ON lf.reporterId = u.id
        ORDER BY lf.createdAt DESC
      `;
      const { results } = await env.DB.prepare(query).all();

      return new Response(JSON.stringify({ success: true, data: results }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch items' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (request.method === 'POST') {
    try {
      const { reporterId, type, itemName, description, location, contactInfo } = await request.json();
      
      if (!reporterId || !type || !itemName || !description) {
         return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
      }

      const id = 'lf-' + Date.now();
      await env.DB.prepare(
        `INSERT INTO LostAndFound (id, reporterId, type, itemName, description, location, contactInfo) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, reporterId, type, itemName, description, location || null, contactInfo || null).run();

      return new Response(JSON.stringify({ success: true, id }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to post item' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
