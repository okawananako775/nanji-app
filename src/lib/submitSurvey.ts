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

async function submitWithCors(endpoint: string, body: string): Promise<void> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body,
    redirect: "follow",
  });

  const text = await res.text();
  try {
    const data = JSON.parse(text) as { ok?: boolean; error?: string };
    if (data.ok === false) {
      throw new Error(data.error || "Survey submit rejected by endpoint");
    }
  } catch (err) {
    if (!(err instanceof SyntaxError)) throw err;
    if (!res.ok) throw new Error(`Survey submit failed (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(`Survey submit failed (${res.status})`);
  }
}

/**
 * Apps Script web apps respond with a cross-origin 302. Browsers often fail the
 * followed request with CORS even though doPost already ran. `no-cors` still
 * delivers the POST body; the response is opaque so we treat network success as OK.
 */
async function submitAppsScript(endpoint: string, body: string): Promise<void> {
  try {
    await submitWithCors(endpoint, body);
  } catch {
    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body,
    });
  }
}

export async function submitSurvey(payload: SurveyPayload): Promise<void> {
  const endpoint = import.meta.env.VITE_SURVEY_ENDPOINT as string | undefined;
  if (!endpoint) {
    console.warn("[survey] VITE_SURVEY_ENDPOINT is not set; saving locally only");
    return;
  }

  const body = JSON.stringify(payload);

  if (isGoogleAppsScriptUrl(endpoint)) {
    await submitAppsScript(endpoint, body);
    return;
  }

  await submitWithCors(endpoint, body);
}
