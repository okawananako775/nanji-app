export interface SurveyPayload {
  rating: number;
  comment: string;
  locale: "ja" | "en";
  submittedAt: string;
  appVersion: string;
}

function isGoogleAppsScriptUrl(url: string): boolean {
  return /script\.google\.com\/macros\//.test(url);
}

/** Local/dev direct call (Vite has no CSP). Production uses /api/survey. */
async function submitDirect(endpoint: string, payload: SurveyPayload): Promise<void> {
  const body = JSON.stringify(payload);

  if (!isGoogleAppsScriptUrl(endpoint)) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body,
    });
    if (!res.ok) throw new Error(`Survey submit failed (${res.status})`);
    return;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body,
      redirect: "follow",
    });
    const text = await res.text();
    try {
      const data = JSON.parse(text) as { ok?: boolean; error?: string };
      if (data.ok === false) throw new Error(data.error || "Survey submit rejected");
    } catch (err) {
      if (!(err instanceof SyntaxError)) throw err;
      if (!res.ok) throw new Error(`Survey submit failed (${res.status})`);
    }
    if (!res.ok) throw new Error(`Survey submit failed (${res.status})`);
  } catch {
    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body,
    });
  }
}

async function submitViaApi(payload: SurveyPayload): Promise<void> {
  const res = await fetch("/api/survey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: { ok?: boolean; error?: string } = {};
  try {
    data = (await res.json()) as { ok?: boolean; error?: string };
  } catch {
    // ignore
  }

  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `Survey submit failed (${res.status})`);
  }
}

export async function submitSurvey(payload: SurveyPayload): Promise<void> {
  // Production CSP is default-src 'self', so the browser cannot call Apps Script
  // directly. Use the same-origin Vercel function instead.
  if (!import.meta.env.DEV) {
    await submitViaApi(payload);
    return;
  }

  const endpoint = import.meta.env.VITE_SURVEY_ENDPOINT;
  if (!endpoint) {
    console.warn("[survey] VITE_SURVEY_ENDPOINT is not set; saving locally only");
    return;
  }

  await submitDirect(endpoint, payload);
}
