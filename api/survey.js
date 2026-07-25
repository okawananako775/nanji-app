/**
 * Same-origin proxy for the feedback survey.
 * Bypasses the app CSP (default-src 'self') and Apps Script CORS redirects.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const endpoint = process.env.SURVEY_ENDPOINT || process.env.VITE_SURVEY_ENDPOINT;
  if (!endpoint) {
    res.status(500).json({ ok: false, error: "Survey endpoint not configured" });
    return;
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const gasRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload ?? {}),
      redirect: "manual",
    });

    // Apps Script runs doPost then responds with 302 to an echo URL.
    if (gasRes.status === 302 || gasRes.status === 303) {
      const location = gasRes.headers.get("location");
      if (location) {
        const echoRes = await fetch(location);
        const text = await echoRes.text();
        try {
          const data = JSON.parse(text);
          if (data.ok === false) {
            res.status(502).json({ ok: false, error: data.error || "GAS rejected submission" });
            return;
          }
        } catch {
          // Non-JSON echo body; 302 still usually means doPost ran.
        }
      }
      res.status(200).json({ ok: true });
      return;
    }

    if (!gasRes.ok) {
      res.status(502).json({ ok: false, error: `GAS status ${gasRes.status}` });
      return;
    }

    const text = await gasRes.text();
    try {
      const data = JSON.parse(text);
      if (data.ok === false) {
        res.status(502).json({ ok: false, error: data.error || "GAS rejected submission" });
        return;
      }
    } catch {
      // ignore non-JSON success bodies
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
}
