import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const requestCounts = new Map<string, { count: number; resetAt: number }>();
function overLimit(key: string) {
  const now = Date.now(), current = requestCounts.get(key);
  if (!current || current.resetAt <= now) { requestCounts.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 }); return false; }
  current.count++;
  return current.count > 10;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const clientKey = (req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "anonymous").split(",")[0].trim().slice(0, 80);
  if (overLimit(clientKey)) return json({ error: "נשלחו יותר מדי בקשות. נסה שוב בעוד כמה דקות." }, 429);

  // Supabase secret name entered by the user (lowercase).
  const apiKey = Deno.env.get("gemini_api_key");
  if (!apiKey) return json({
    error: "AI provider is not configured yet. Add gemini_api_key to Supabase Edge Function secrets.",
  }, 503);

  let input: Record<string, unknown>;
  try { input = await req.json(); } catch { return json({ error: "Invalid JSON request." }, 400); }
  const businessName = String(input.businessName ?? "Your Business").slice(0, 80);
  const siteType = String(input.siteType ?? "Business website").slice(0, 60);
  const brief = String(input.brief ?? "").trim().slice(0, 1800);
  const contactUrl = String(input.contactUrl ?? "").slice(0, 500);
  if (!brief) return json({ error: "Please describe the website first." }, 400);

  const outputLanguage = /[\\u0590-\\u05FF]/.test(`${businessName} ${brief}`) ? "Hebrew" : "English";
  const prompt = `You are a professional website copywriter. Return only JSON matching the requested schema. Write concise, persuasive, truthful website copy in ${outputLanguage}. If the input is Hebrew, use natural Hebrew and do not translate the business name unnecessarily. Do not invent awards, guarantees, prices, testimonials, credentials, or facts not present in the brief. Business name: ${businessName}. Site type: ${siteType}. Business brief: ${brief}. Contact URL provided: ${contactUrl || "none"}. Create one headline, a short CTA button label, exactly three service/value cards, and a contact heading and sentence. Do not generate HTML, CSS, or JavaScript.`;
  try {
    const requestAi = (modelName: string) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              headline: { type: "STRING" },
              buttonText: { type: "STRING" },
              sections: {
                type: "ARRAY",
                minItems: 3,
                maxItems: 3,
                items: { type: "OBJECT", properties: { title: { type: "STRING" }, text: { type: "STRING" } }, required: ["title", "text"] }
              },
              contactHeading: { type: "STRING" },
              contactText: { type: "STRING" }
            },
            required: ["headline", "buttonText", "sections", "contactHeading", "contactText"]
          }
        }
      }),
    });
    let response = await requestAi("gemini-3.8-flash");
    for (const modelName of ["gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"]) {
      if (response.ok || ![404, 429, 503].includes(response.status)) break;
      console.warn("Website generation switching fallback model", modelName, "after", response.status);
      response = await requestAi(modelName);
    }
    if (!response.ok) {
      const detail = await response.text();
      console.error("Gemini request failed", response.status, detail.slice(0, 500));
      return json({ error: response.status === 429 ? "AI usage limit reached. Try again later." : "AI provider request failed. Check the provider key and project limits." }, 502);
    }
    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.map((part: {text?: string}) => part.text || "").join("");
    if (!text) return json({ error: "The AI provider returned an empty response." }, 502);
    const website = JSON.parse(text);
    if (!Array.isArray(website.sections) || website.sections.length !== 3) return json({ error: "The AI provider returned an incomplete website draft." }, 502);
    return json({ website });
  } catch (error) {
    console.error("Website generation failed", error);
    return json({ error: "Could not generate the website right now. Please try again." }, 502);
  }
});