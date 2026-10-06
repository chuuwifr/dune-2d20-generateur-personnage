import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK with required telemetry User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Chat endpoint (multi-turn)
app.post('/api/chat', async (req, res) => {
  try {
    const { 
      messages, 
      systemInstruction, 
      model = 'gemini-3.5-flash', 
      temperature = 0.8 
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Le tableau de messages est requis.' });
    }

    // Format for @google/genai SDK
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
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

    const reply = response.text || '';
    res.json({ reply });
  } catch (error: any) {
    console.error('Erreur API Chat Gemini :', error);
    res.status(500).json({ 
      error: error.message || 'Erreur lors du traitement de la requête IA.',
    });
  }
});

// Specialized Name Generation endpoint for Dune characters
app.post('/api/generate-name', async (req, res) => {
  try {
    const { 
      vocation = 'Standard', 
      archetype = 'Commandant', 
      house = 'Maison Atréides', 
      gender = 'Femme',
      style = 'Noble',
      model = 'gemini-3.1-flash-lite'
    } = req.body;

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

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.85,
      },
    });

    res.json({ reply: response.text || '' });
  } catch (error: any) {
    console.error('Erreur API Génération de Nom :', error);
    res.status(500).json({ 
      error: error.message || 'Impossible de générer le nom avec Gemini.',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`[Dune 2d20 Server] Serveur actif sur http://localhost:${port}`);
  });
}

startServer();
