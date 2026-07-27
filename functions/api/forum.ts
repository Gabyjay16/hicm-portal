export async function onRequest(context: any) {
  const { request, env } = context;

  if (request.method === 'GET') {
    try {
      // In SQLite we can do a JOIN to get user names
      const query = `
        SELECT f.id, f.messageText as text, f.createdAt, u.name as author, u.role
        FROM ForumMessages f
        JOIN Users u ON f.authorId = u.id
        ORDER BY f.createdAt ASC
        LIMIT 50
      `;
      const { results } = await env.DB.prepare(query).all();

      const messages = results.map((msg: any) => ({
        id: msg.id,
        author: msg.author,
        role: msg.role,
        text: msg.text,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));

      return new Response(JSON.stringify({ success: true, data: messages }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch messages' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (request.method === 'POST') {
    try {
      const { text, authorId } = await request.json();
      
      if (!text || !authorId) {
         return new Response(JSON.stringify({ success: false, error: 'Missing fields' }), { status: 400 });
      }

      // Re-validate links on server side just in case
      const forbiddenRegex = /(http:\/\/|https:\/\/|www\.|[a-zA-Z0-9-]+\.(com|org|net|edu|gov|io|co|uk|us|ng|cm))/i;
      if (forbiddenRegex.test(text)) {
         return new Response(JSON.stringify({ success: false, error: 'Web links are strictly forbidden.' }), { status: 403 });
      }

      const id = 'msg-' + Date.now(); // UUID would be better but this works for demo
      await env.DB.prepare(
        `INSERT INTO ForumMessages (id, authorId, messageText) VALUES (?, ?, ?)`
      ).bind(id, authorId, text).run();

      return new Response(JSON.stringify({ success: true }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to post message' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
