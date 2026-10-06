import type { Config, Context } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Méthode non autorisée" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: "Clé GEMINI_API_KEY manquante. Veuillez définir GEMINI_API_KEY dans vos variables d'environnement Netlify (Site settings > Environment variables)." 
        }), 
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { 
      messages, 
      systemInstruction, 
      model = "gemini-3.5-flash", 
      temperature = 0.8 
    } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Le tableau de messages est requis." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature,
      },
    });

    const reply = response.text || "";
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Netlify Function Chat Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Erreur interne serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = {
  path: "/api/chat",
};
