export async function onRequest(context: any) {
  const { request, env } = context;

  if (request.method === 'GET') {
    try {
      const { results: notes } = await env.DB.prepare(`
        SELECT l.*, u.name as authorName 
        FROM LectureNotes l
        JOIN Users u ON l.lecturerId = u.id
        ORDER BY l.createdAt DESC
      `).all();

      return new Response(JSON.stringify({ success: true, data: notes }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch notes' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      const title = formData.get('title');
      const courseCode = formData.get('courseCode');
      const lecturerId = formData.get('lecturerId');
      const file = formData.get('file'); // In a real app we'd upload this to R2, for now we'll just store the name

      if (!title || !courseCode || !lecturerId || !file) {
         return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
      }

      const id = 'note-' + Date.now();
      const fileUrl = `/storage/notes/${(file as File).name}`; // Fake URL
      const fileSize = (file as File).size;

      await env.DB.prepare(
        `INSERT INTO LectureNotes (id, title, courseCode, lecturerId, fileUrl, fileSize) VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(id, title, courseCode, lecturerId, fileUrl, fileSize).run();

      return new Response(JSON.stringify({ success: true, id }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to create note' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
