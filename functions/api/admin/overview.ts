export async function onRequest(context: any) {
  const { env } = context;

  try {
    const studentsQuery = env.DB.prepare(`SELECT COUNT(*) as count FROM Users WHERE role = 'student'`);
    const staffQuery = env.DB.prepare(`SELECT COUNT(*) as count FROM Users WHERE role = 'staff'`);
    const complaintsQuery = env.DB.prepare(`SELECT COUNT(*) as count FROM Complaints WHERE status != 'resolved' AND status != 'closed'`);
    const activeEvalsQuery = env.DB.prepare(`SELECT COUNT(*) as count FROM Evaluations WHERE status = 'active'`);
    
    const [studentsRes, staffRes, complaintsRes, evalsRes] = await env.DB.batch([
      studentsQuery, staffQuery, complaintsQuery, activeEvalsQuery
    ]);
    
    const data = {
      totalStudents: studentsRes.results[0].count,
      totalStaff: staffRes.results[0].count,
      activeComplaints: complaintsRes.results[0].count,
      activeEvaluations: evalsRes.results[0].count,
    };

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
