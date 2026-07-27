export async function onRequest(context: any) {
  const { request, env } = context;

  if (request.method === 'GET') {
    try {
      // In a real app we'd fetch these from the Questions table.
      // For now we'll serve the same questions but from the API so it's a "real backend".
      const questions = [
        {
          id: 'q1',
          question: 'Which accounting statement presents a snapshot of a company’s financial position at a specific point in time?',
          options: ['Income Statement', 'Balance Sheet', 'Statement of Cash Flows', 'Statement of Retained Earnings'],
          correctAnswer: 1,
          explanation: 'The Balance Sheet lists assets, liabilities, and equity at a specific point in time, providing a financial position snapshot.'
        },
        {
          id: 'q2',
          question: 'In modern business management, what does the acronym SWOT stand for?',
          options: ['Strengths, Weaknesses, Opportunities, Threats', 'Strategy, Workforce, Objectives, Tactics', 'Sales, Wealth, Operations, Targets', 'System, Web, Optimization, Testing'],
          correctAnswer: 0,
          explanation: 'SWOT stands for Strengths, Weaknesses, Opportunities, and Threats — a key framework for strategic analysis.'
        },
        {
          id: 'q3',
          question: 'What is the primary function of a Central Bank in a modern monetary economy?',
          options: ['Provide retail loans to private consumers', 'Regulate national money supply and interest rates', 'Sell corporate stock shares directly to investors', 'Manage municipal waste services'],
          correctAnswer: 1,
          explanation: 'Central banks control monetary policy, interest rates, and currency issuance.'
        },
        {
          id: 'q4',
          question: 'Which marketing mix component involves pricing strategies, discounts, and credit terms?',
          options: ['Product', 'Place', 'Price', 'Promotion'],
          correctAnswer: 2,
          explanation: 'The Price component of the 4 Ps deals with setting price points, discounts, financing, and payment structures.'
        },
        {
          id: 'q5',
          question: 'In Database Management Systems (DBMS), what does SQL stand for?',
          options: ['Systemic Query Logic', 'Structured Query Language', 'Sequential Queue Listing', 'Standardized Quality Metric'],
          correctAnswer: 1,
          explanation: 'SQL stands for Structured Query Language, the standard domain-specific language used in relational databases.'
        }
      ];

      return new Response(JSON.stringify({ success: true, data: questions }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch evaluations' }), { status: 500 });
    }
  }

  if (request.method === 'POST') {
    try {
      const data = await request.json();
      const { studentId, evaluationId, score, answers, timeSpent } = data;
      
      const id = 'attempt-' + Date.now();

      await env.DB.prepare(
        `INSERT INTO EvaluationAttempts (id, evaluationId, studentId, score, answers, timeSpent) VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(id, evaluationId, studentId, score, JSON.stringify(answers), timeSpent).run();

      return new Response(JSON.stringify({ success: true, attemptId: id }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to submit evaluation' }), { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
