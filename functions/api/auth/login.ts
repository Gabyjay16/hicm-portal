export async function onRequestPost(context: any) {
  const { request, env } = context;
  const db = env.DB;

  try {
    const data = await request.json();
    const { email, password } = data;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Missing credentials" }), { status: 400 });
    }

    const passwordHash = btoa(password); // Simple mock hash to match registration

    const user = await db.prepare(
      `SELECT id, name, email, role, matricNo, department, level, status, plagiarismTokens FROM Users WHERE email = ? AND passwordHash = ?`
    ).bind(email, passwordHash).first();

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });
    }

    // In a real app, generate a JWT or Session token here and set it in a secure cookie.
    // For now, we just return the user object to the client for state-based auth.
    return new Response(JSON.stringify({ message: "Login successful", user }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
