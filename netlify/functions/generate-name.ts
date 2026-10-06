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
          error: "Clé GEMINI_API_KEY manquante. Veuillez définir GEMINI_API_KEY dans vos variables d'environnement Netlify." 
        }), 
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { 
      vocation = "Standard", 
      archetype = "Commandant", 
      house = "Maison Atréides", 
      gender = "Femme",
      style = "Noble",
      model = "gemini-3.1-flash-lite"
    } = body;

    const systemInstruction = `Tu es un archiviste et héraut officiel de l'Imperium dans l'univers de Dune (Frank Herbert).
Tu dois suggérer des noms de personnages authentiques et immersifs respectant les faufreluches, les Maisons nobles, le dialecte Chakobsa des Fremen, ou les codes des Grandes Écoles (Bene Gesserit, Mentat, École Suk, Guilde Spatiale).

Pour chaque suggestion, fournis le prénom, le nom de famille ou d'adoption, son sens ou étymologie dans le contexte de Dune, et une citation ou anecdote brève sur son lignage.`;

    const prompt = `Génère 5 suggestions de noms distinctifs pour un personnage de Dune : Aventures dans l'Imperium avec les critères suivants :
- Genre : ${gender}
- Vocation / Faction : ${vocation}
- Archétype : ${archetype}
- Allégeance : ${house}
- Style recherché : ${style}

Réponds avec un texte soigné et propose clairement 5 noms complets que le joueur peut choisir et adopter pour sa fiche de personnage.`;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.85,
      },
    });

    const reply = response.text || "";
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Netlify Function Generate-Name Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Erreur interne" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = {
  path: "/api/generate-name",
};
