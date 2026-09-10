import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Translation endpoint
app.post("/api/translate", async (req, res) => {
  try {
    const { text, sourceLang, targetLang, targetDialect, registerPreference } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Please provide text to translate." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are the world's most authentic Mother Tongue Translator.
Your mission is to translate speech and text into someone's genuine "mother tongue" (native, heartfelt language) — exactly how native speakers, grandmothers, families, and locals express it at home, NOT like stiff textbook or cold machine translation.

Languages include regional dialects, vernacular scripts, and indigenous idioms (e.g. Telugu, Hindi, Spanish, Tagalog/Filipino, Vietnamese, Arabic, Bengali, Tamil, Urdu, Japanese, Korean, Yoruba, Swahili, Cantonese, Punjabi, Marathi, French, German, Italian, etc.).

For the target mother tongue "${targetLang}" ${targetDialect ? `(Dialect/Region: ${targetDialect})` : ""}:
1. Deliver the authentic native mother tongue translation using proper native script.
2. Provide an accurate, easy-to-read Latin phonetic transliteration/romanization so heritage speakers and diaspora who understand the spoken tongue can read and pronounce it naturally.
3. Contrast it with the cold/literal textbook translation to highlight the native difference.
4. Provide 3 distinct formality registers:
   - "colloquial" (intimate, family, dinner table, close friends, informal hometown warmth)
   - "respectful" (warm respect for elders, parents, in-laws, teachers, esteemed guests)
   - "formal" (polite, professional, public address, official writing)
5. Explain the cultural sentiment & context (why locals say it this way, emotional weight, gestures, cultural etiquette).
6. Provide a concise word-by-word / idiom breakdown.
7. Include 2-3 related authentic idioms or vernacular proverbs related to the theme.`;

    const prompt = `Translate the following source text into ${targetLang} ${targetDialect ? `(${targetDialect})` : ""}:
Source Language: ${sourceLang || "Auto-detect"}
Target Mother Tongue: ${targetLang}
Preferred Register: ${registerPreference || "all"}
Source Text: "${text.trim()}"

Provide the output strictly in the requested JSON structure.`;

    const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
    let lastError: any = null;
    let response: any = null;

    for (const modelName of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.3,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                detectedSourceLang: {
                  type: Type.STRING,
                  description: "The detected or confirmed language of the source text",
                },
                targetLang: {
                  type: Type.STRING,
                  description: "The target mother tongue name",
                },
                targetScript: {
                  type: Type.STRING,
                  description: "The name of the native script (e.g., Devanagari, Telugu, Cyrillic, Kanji/Hiragana, Arabic, Latin)",
                },
                motherTongueText: {
                  type: Type.STRING,
                  description: "The natural, authentic native translation in the native script",
                },
                phoneticScript: {
                  type: Type.STRING,
                  description: "Latin alphabet transliteration / phonetic pronunciation guide",
                },
                literalTranslation: {
                  type: Type.STRING,
                  description: "What a stiff/literal machine translation would look like, for contrast",
                },
                registers: {
                  type: Type.OBJECT,
                  properties: {
                    colloquial: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        phonetic: { type: Type.STRING },
                        whenToUse: { type: Type.STRING },
                      },
                      required: ["text", "phonetic", "whenToUse"],
                    },
                    respectful: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        phonetic: { type: Type.STRING },
                        whenToUse: { type: Type.STRING },
                      },
                      required: ["text", "phonetic", "whenToUse"],
                    },
                    formal: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        phonetic: { type: Type.STRING },
                        whenToUse: { type: Type.STRING },
                      },
                      required: ["text", "phonetic", "whenToUse"],
                    },
                  },
                  required: ["colloquial", "respectful", "formal"],
                },
                culturalNote: {
                  type: Type.STRING,
                  description: "Cultural context, emotional nuance, or etiquette regarding this expression in native culture",
                },
                wordBreakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      originalWord: { type: Type.STRING },
                      romanized: { type: Type.STRING },
                      meaning: { type: Type.STRING },
                      nuanceNote: { type: Type.STRING },
                    },
                    required: ["originalWord", "meaning"],
                  },
                },
                nativeIdioms: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      phrase: { type: Type.STRING },
                      phonetic: { type: Type.STRING },
                      meaning: { type: Type.STRING },
                      usageNote: { type: Type.STRING },
                    },
                    required: ["phrase", "meaning"],
                  },
                },
              },
              required: [
                "targetLang",
                "motherTongueText",
                "phoneticScript",
                "registers",
                "culturalNote",
                "wordBreakdown",
              ],
            },
          },
        });
        if (response && response.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed or busy, trying next model:`, err.message || err);
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("All translation models were unavailable.");
    }

    const rawText = response.text || "{}";
    const data = JSON.parse(rawText);

    return res.json({
      success: true,
      data: {
        ...data,
        sourceText: text.trim(),
      },
    });
  } catch (error: any) {
    console.error("Translation error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate mother tongue translation.",
    });
  }
});

// TTS endpoint using Gemini TTS
app.post("/api/tts", async (req, res) => {
  try {
    const { text, language } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text for TTS" });
    }

    const ai = getGeminiClient();

    // Use gemini-3.1-flash-tts-preview
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [
        {
          parts: [
            {
              text: `Speak in clear native ${language || "natural"} accent: ${text}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      return res.json({ success: true, audioBase64: base64Audio });
    }

    return res.status(500).json({ success: false, error: "No audio data returned" });
  } catch (error: any) {
    console.warn("TTS error (frontend will fallback to Web Speech API):", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Vite middleware and static serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mother Tongue Translator server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
