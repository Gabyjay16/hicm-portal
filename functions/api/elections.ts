export async function onRequest(context: any) {
  const { request, env } = context;

  if (request.method === 'GET') {
    try {
      const url = new URL(request.url);
      const studentId = url.searchParams.get('studentId');
      
      // Get all active elections
      const { results: elections } = await env.DB.prepare(`
        SELECT * FROM Elections ORDER BY startDate DESC
      `).all();

      // For each election, fetch candidates
      for (const election of elections) {
        const { results: candidates } = await env.DB.prepare(`
          SELECT c.*, u.name as studentName 
          FROM Candidates c
          JOIN Users u ON c.studentId = u.id
          WHERE c.electionId = ?
        `).bind(election.id).all();

        election.candidates = candidates;

        if (studentId) {
          // Check if student has voted in this election
          const voteCheck = await env.DB.prepare(`
            SELECT id FROM Votes WHERE electionId = ? AND voterId = ?
          `).bind(election.id, studentId).first();
          
          election.hasVoted = !!voteCheck;
        }
      }

      return new Response(JSON.stringify({ success: true, data: elections }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch elections' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (request.method === 'POST') {
    // Submit a vote
    try {
      const { electionId, candidateId, voterId } = await request.json();
      
      if (!electionId || !candidateId || !voterId) {
         return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
      }

      // Check if already voted
      const voteCheck = await env.DB.prepare(`
        SELECT id FROM Votes WHERE electionId = ? AND voterId = ?
      `).bind(electionId, voterId).first();

      if (voteCheck) {
        return new Response(JSON.stringify({ success: false, error: 'You have already voted in this election.' }), { status: 403 });
      }

      const id = 'vote-' + Date.now();
      await env.DB.prepare(
        `INSERT INTO Votes (id, electionId, candidateId, voterId) VALUES (?, ?, ?, ?)`
      ).bind(id, electionId, candidateId, voterId).run();

      return new Response(JSON.stringify({ success: true, id }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to cast vote' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
