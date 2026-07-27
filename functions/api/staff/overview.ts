export async function onRequest(context: any) {
  const { request, env } = context;

  try {
    // In a real app we'd get the staff ID from the session token.
    // For now we'll just mock a staff ID or use a placeholder.
    const staffId = 'mock-staff-id'; 
    
    // Using D1 batching
    const notesCountQuery = env.DB.prepare(`SELECT COUNT(*) as count FROM LectureNotes`);
    const evalsCountQuery = env.DB.prepare(`SELECT COUNT(*) as count FROM Evaluations`);
    
    const [notesRes, evalsRes] = await env.DB.batch([notesCountQuery, evalsCountQuery]);
    
    const data = {
      notesCount: notesRes.results[0].count,
      evaluationsCount: evalsRes.results[0].count,
      recentNotes: [], // could add recent ones
    };

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
