import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore({ name: "tournaments", consistency: "strong" });
  const url = new URL(req.url);
  const code = (url.searchParams.get("code") || "").toUpperCase().trim();

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  // GET — load tournament by code
  if (req.method === "GET") {
    if (!code) return new Response(JSON.stringify({ error: "Missing code" }), { status: 400 });
    const data = await store.get(code, { type: "json" });
    if (!data) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    return Response.json(data);
  }

  // PUT — save/update tournament
  if (req.method === "PUT") {
    const body = await req.json();
    if (!body?.code) return new Response(JSON.stringify({ error: "Missing code" }), { status: 400 });
    body.updatedAt = Date.now();
    await store.setJSON(body.code.toUpperCase(), body);
    return Response.json({ ok: true });
  }

  // DELETE — remove tournament
  if (req.method === "DELETE") {
    if (!code) return new Response(JSON.stringify({ error: "Missing code" }), { status: 400 });
    await store.delete(code);
    return Response.json({ ok: true });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
};

export const config = { path: "/api/tournament" };
