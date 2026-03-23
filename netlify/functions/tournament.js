// netlify/functions/tournament.js
// Handles GET /api/tournament?code=XXXX
//         PUT /api/tournament        { body: tournament JSON }
//         DELETE /api/tournament?code=XXXX

import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const store = getStore("tournaments");
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  // GET — load tournament by code
  if (req.method === "GET") {
    if (!code) return new Response(JSON.stringify({ error: "Missing code" }), { status: 400, headers: cors });
    try {
      const data = await store.get(code.toUpperCase(), { type: "json" });
      if (!data) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: cors });
      return new Response(JSON.stringify(data), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Server error", detail: e.message }), { status: 500, headers: cors });
    }
  }

  // PUT — save/update tournament
  if (req.method === "PUT") {
    try {
      const body = await req.json();
      if (!body?.code) return new Response(JSON.stringify({ error: "Missing code in body" }), { status: 400, headers: cors });
      body.updatedAt = Date.now();
      await store.setJSON(body.code.toUpperCase(), body);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Server error", detail: e.message }), { status: 500, headers: cors });
    }
  }

  // DELETE — remove tournament
  if (req.method === "DELETE") {
    if (!code) return new Response(JSON.stringify({ error: "Missing code" }), { status: 400, headers: cors });
    try {
      await store.delete(code.toUpperCase());
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Server error", detail: e.message }), { status: 500, headers: cors });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: cors });
};

export const config = { path: "/api/tournament" };
