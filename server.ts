import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

// Lazy Google GenAI Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey: key || '' });
  }
  return genAIClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// Server-side Repertorize API
app.post('/api/repertorize', async (req, res) => {
  try {
    const { prompt, method, customApiKey } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKeyToUse = (customApiKey && String(customApiKey).trim()) || process.env.GEMINI_API_KEY;

    if (!apiKeyToUse) {
      return res.status(401).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY or provide a key in settings.'
      });
    }

    const ai = new GoogleGenAI({ apiKey: apiKeyToUse });

    // Call Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 4096
      }
    });

    const text = response.text || '';
    if (!text) {
      return res.status(502).json({ error: 'Gemini returned an empty response.' });
    }

    return res.json({ result: text, method });
  } catch (error: any) {
    console.error('Gemini repertorization error:', error);
    const msg = error?.message || 'Gemini API execution failed';
    return res.status(500).json({ error: msg });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dr. Bharat's Aroga Homeopathy server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
