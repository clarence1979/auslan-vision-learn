import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured on server" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action, payload } = body;

    if (action === "analyze-gesture") {
      const { imageData, expectedGesture } = payload;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
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
          model: "gpt-4o",
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
          model: "gpt-4o",
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
