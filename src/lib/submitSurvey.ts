export interface SurveyPayload {
  rating: number;
  comment: string;
  locale: "ja" | "en";
  submittedAt: string;
  appVersion: string;
}

async function readGasResult(res: Response): Promise<void> {
  const text = await res.text();
  try {
    const data = JSON.parse(text) as { ok?: boolean; error?: string };
    if (data.ok === false) {
      throw new Error(data.error || "Survey submit rejected by endpoint");
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      // Non-JSON body (e.g. HTML redirect page) — treat HTTP status as source of truth
      if (!res.ok) throw new Error(`Survey submit failed (${res.status})`);
      return;
    }
    throw err;
  }
  if (!res.ok) {
    throw new Error(`Survey submit failed (${res.status})`);
  }
}

export async function submitSurvey(payload: SurveyPayload): Promise<void> {
  const endpoint = import.meta.env.VITE_SURVEY_ENDPOINT as string | undefined;
  if (!endpoint) {
    console.warn("[survey] VITE_SURVEY_ENDPOINT is not set; saving locally only");
    return;
  }

  // Apps Script returns 302 → echo URL with the JSON body. Follow redirects and
  // validate `{ ok: true }` so sheet/script errors surface in the UI.
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });

  await readGasResult(res);
}
