export async function onRequest(context: any) {
  const { request, env } = context;

  if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      const file = formData.get('file');
      const studentId = formData.get('studentId');

      if (!file || !studentId) {
        return new Response(JSON.stringify({ success: false, error: 'File and studentId are required.' }), { status: 400 });
      }

      // Check tokens
      const user = await env.DB.prepare(`SELECT plagiarismTokens FROM Users WHERE id = ?`).bind(studentId).first();
      if (!user || user.plagiarismTokens < 1) {
        return new Response(JSON.stringify({ success: false, error: 'Insufficient tokens.' }), { status: 403 });
      }

      // Deduct token
      await env.DB.prepare(`UPDATE Users SET plagiarismTokens = plagiarismTokens - 1 WHERE id = ?`).bind(studentId).run();

      // Mock analysis (in reality we would parse the file and call an AI/plagiarism API)
      const mockScore = Math.floor(Math.random() * 18) + 4; // 4% to 22% similarity
      const mockSources = [
        {
          source: 'HICM Academic Archive - Research Vol 4 (2023)',
          similarity: Math.floor(mockScore * 0.6),
          snippet: '...strategic management frameworks applied to West African commercial enterprises...',
        },
        {
          source: 'Global Business Review Journal (ISSN 0972-1509)',
          similarity: Math.ceil(mockScore * 0.4),
          snippet: '...financial ratio analysis demonstrates consistent liquidity trends across quarters...',
        },
      ];

      const id = 'plag-' + Date.now();
      await env.DB.prepare(
        `INSERT INTO PlagiarismTests (id, studentId, fileName, score, matchingSourcesJSON) VALUES (?, ?, ?, ?, ?)`
      ).bind(id, studentId, (file as File).name, mockScore, JSON.stringify(mockSources)).run();

      return new Response(JSON.stringify({
        success: true,
        data: {
          id,
          name: (file as File).name,
          score: mockScore,
          matchingSources: mockSources,
          remainingTokens: user.plagiarismTokens - 1
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Analysis failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (request.method === 'GET') {
    try {
      const url = new URL(request.url);
      const studentId = url.searchParams.get('studentId');
      
      if (!studentId) {
        return new Response(JSON.stringify({ success: false, error: 'studentId required' }), { status: 400 });
      }

      const user = await env.DB.prepare(`SELECT plagiarismTokens FROM Users WHERE id = ?`).bind(studentId).first();
      
      const { results: tests } = await env.DB.prepare(`
        SELECT * FROM PlagiarismTests WHERE studentId = ? ORDER BY createdAt DESC
      `).bind(studentId).all();

      return new Response(JSON.stringify({ 
        success: true, 
        tokens: user ? user.plagiarismTokens : 0,
        tests 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch plagiarism data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
