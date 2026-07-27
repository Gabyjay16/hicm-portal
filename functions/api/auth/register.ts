export async function onRequestPost(context: any) {
  const { request, env } = context;
  const db = env.DB;

  try {
    const data = await request.json();
    const { name, email, password, matricNo, department, level, staffCode } = data;

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // Determine Role
    let role = 'student';
    if (staffCode) {
      // Very basic static check for now (as requested by user previously STF-123)
      // Ideally, we'd query the StaffCodes table here.
      if (staffCode === 'STF-123') {
        role = 'staff';
      } else if (staffCode === 'ADM-123') {
        role = 'admin';
      } else {
        return new Response(JSON.stringify({ error: "Invalid Staff Code" }), { status: 400 });
      }
    }

    const userId = `usr-${Date.now()}`;
    // TODO: implement real hashing with WebCrypto. For prototyping, we just store it (bad practice, but we'll fix later).
    const passwordHash = btoa(password); 

    await db.prepare(
      `INSERT INTO Users (id, name, email, role, matricNo, department, level, passwordHash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(userId, name, email, role, matricNo || null, department || null, level || null, passwordHash).run();

    return new Response(JSON.stringify({ message: "Registration successful", userId }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return new Response(JSON.stringify({ error: "Email already exists" }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
