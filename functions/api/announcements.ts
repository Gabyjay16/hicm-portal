export async function onRequest(context: any) {
  const { env } = context;

  try {
    const { results } = await env.DB.prepare(
      `SELECT * FROM Announcements ORDER BY createdAt DESC LIMIT 5`
    ).all();

    return new Response(JSON.stringify({ success: true, data: results }), {
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
