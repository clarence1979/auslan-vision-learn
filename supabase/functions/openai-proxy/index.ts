import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const EXTERNAL_SUPABASE_URL = "https://qfitpwdrswvnbmzvkoyd.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaXRwd2Ryc3d2bmJtenZrb3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTc4NTIsImV4cCI6MjA3NjkzMzg1Mn0.owLaj3VrcyR7_LW9xMwOTTFQupbDKlvAlVwYtbidiNE";

async function fetchKeyFromSecrets(): Promise<string | null> {
  try {
    const res = await fetch(
      `${EXTERNAL_SUPABASE_URL}/rest/v1/secrets?key_name=eq.OPENAI_API_KEY&select=key_value`,
      { headers: { apikey: EXTERNAL_SUPABASE_ANON_KEY } }
    );
    const rows = await res.json();
    return rows?.[0]?.key_value ?? null;
  } catch {
    return null;
  }
}

async function resolveApiKey(clientKey?: string): Promise<string | null> {
  if (clientKey) return clientKey;
  const envKey = Deno.env.get("OPENAI_API_KEY");
  if (envKey) return envKey;
  return fetchKeyFromSecrets();
}

async function getLatestModel(apiKey: string): Promise<string> {
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });
    if (!res.ok) return "gpt-4o";
    const data = await res.json();
    // Vision-capable models: gpt-4o family, sorted newest first by created timestamp
    const visionModels = (data.data as Array<{ id: string; created: number }>)
      .filter(m => /^gpt-4o(?!.*audio|.*realtime|.*mini)/.test(m.id) || m.id === "gpt-4o")
      .sort((a, b) => b.created - a.created);
    return visionModels[0]?.id ?? "gpt-4o";
  } catch {
    return "gpt-4o";
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, payload, apiKey: clientApiKey } = body;

    const apiKey = await resolveApiKey(clientApiKey);
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured on server" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const model = await getLatestModel(apiKey);

    if (action === "analyze-gesture") {
      const { imageData, expectedGesture } = payload;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `You are an AUSLAN (Australian Sign Language) gesture recognition expert. Analyze the image and determine if the person is correctly performing the AUSLAN gesture for "${expectedGesture}".

Respond with a JSON object containing:
- recognized: boolean (true if gesture is correct)
- gesture: string (what gesture you think is being shown)
- confidence: number (0-100, confidence in your assessment)
- feedback: string (encouraging feedback about the attempt)
- suggestions: array of strings (specific tips for improvement if needed)

Be encouraging and educational in your feedback. Consider hand position, finger placement, and overall gesture form.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Please analyze this AUSLAN gesture attempt. The person is trying to sign "${expectedGesture}".`,
                },
                {
                  type: "image_url",
                  image_url: { url: imageData },
                },
              ],
            },
          ],
          max_tokens: 300,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return new Response(
          JSON.stringify({ error: `OpenAI error: ${response.status}`, detail: errText }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      const cleanContent = content.replace(/```json\s*|\s*```/g, "").trim();

      let result;
      try {
        result = JSON.parse(cleanContent);
      } catch {
        result = {
          recognized: false,
          gesture: "unknown",
          confidence: 50,
          feedback: content,
          suggestions: ["Try positioning your hand more clearly in view of the camera"],
        };
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "recognize-custom-gesture") {
      const { imageData, gestureNames } = payload;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `You are analyzing a hand gesture image. The user has trained the following custom gestures: ${gestureNames}.

Your task is to:
1. Identify which trained gesture this most closely matches
2. If uncertain, make your best guess from the trained gestures list
3. Provide a confidence score (0-100)

Respond with a JSON object:
{
  "recognizedGesture": "gesture_name",
  "confidence": number,
  "suggestions": ["helpful tip if confidence is low"]
}

Be helpful and encouraging. If the gesture is unclear, suggest improvements but still make your best match.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Which of my trained gestures (${gestureNames}) does this match?`,
                },
                {
                  type: "image_url",
                  image_url: { url: imageData },
                },
              ],
            },
          ],
          max_tokens: 300,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return new Response(
          JSON.stringify({ error: `OpenAI error: ${response.status}`, detail: errText }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      const cleanContent = content.replace(/```json\s*|\s*```/g, "").trim();
      const result = JSON.parse(cleanContent);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "build-sentence") {
      const { words } = payload;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `You are helping construct sentences from sign language gestures. The user has signed these words in sequence: ${words.join(", ")}.

Your task is to create a natural, grammatically correct sentence from these words. Fill in any missing articles, prepositions, or connecting words as needed to make the sentence flow naturally.

Respond with ONLY the complete sentence, nothing else. Keep it concise and natural.`,
            },
            {
              role: "user",
              content: `Create a natural sentence from these words: ${words.join(", ")}`,
            },
          ],
          max_tokens: 100,
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ sentence: words.join(" ") }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const sentence = data.choices[0]?.message?.content?.trim() || words.join(" ");

      return new Response(JSON.stringify({ sentence }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "check-config") {
      return new Response(JSON.stringify({ isConfigured: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
