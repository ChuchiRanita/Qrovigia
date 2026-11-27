require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const VT_HEADERS = {
  "x-apikey": process.env.VT_API_KEY,
  Accept: "application/json",
};

// 1. Enviar URL a analizar en VirusTotal
app.post("/api/analizar", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Debes ingresar una URL" });
  }

  try {
    const body = new URLSearchParams({ url }).toString();
    const vtRes = await fetch("https://www.virustotal.com/api/v3/urls", {
      method: "POST",
      headers: {
        ...VT_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await vtRes.json();
    if (!vtRes.ok) {
      return res.status(vtRes.status).json({
        error: data.error?.message || "Error al enviar la URL a VirusTotal",
      });
    }

    return res.json({ analysisId: data.data.id });
  } catch (err) {
    return res.status(500).json({ error: "No se pudo conectar con VirusTotal" });
  }
});

// 2. Consultar resultado del análisis de URL
app.get("/api/resultado/:id", async (req, res) => {
  try {
    const vtRes = await fetch(
      `https://www.virustotal.com/api/v3/analyses/${req.params.id}`,
      { headers: VT_HEADERS }
    );

    const data = await vtRes.json();
    if (!vtRes.ok) {
      return res.status(vtRes.status).json({
        error: data.error?.message || "Error al consultar el análisis",
      });
    }

    const attributes = data.data.attributes;
    return res.json({
      status: attributes.status,
      stats: attributes.stats,
    });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener el resultado" });
  }
});

// 3. Analizar captura de mensaje o correo con IA
app.post("/api/analizar-imagen", async (req, res) => {
  const { imageBase64, mimeType } = req.body;

  if (!process.env.AI_API_KEY) {
    return res.status(500).json({ error: "Falta AI_API_KEY en el archivo .env" });
  }

  if (!imageBase64 || !mimeType) {
    return res.status(400).json({ error: "Debes subir una imagen válida" });
  }

  try {
    const prompt = `
Eres un asistente de protección ciudadana especializado en detectar phishing, fraudes, estafas y suplantación institucional.
Analiza esta imagen (captura de un mensaje, correo, chat o aviso) y responde ÚNICAMENTE en JSON válido con esta estructura exacta:
{
  "decision": "NO_ABRIR" | "PRECAUCION" | "PUEDE_SER_SEGURO",
  "titulo": "frase corta de máximo 6 palabras",
  "resumen": "explicación clara en español de qué se observa en la imagen",
  "senales": ["señal 1", "señal 2"],
  "recomendacion": "qué debe hacer la persona ahora mismo"
}
Evalúa señales como urgencia falsa, amenazas de bloqueo o multas, premios o reembolsos inesperados, enlaces sospechosos o acortados, remitentes dudosos o suplantación de bancos, paquetería o instituciones gubernamentales.
`;

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.AI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await aiRes.json();
    if (!aiRes.ok) {
      return res.status(aiRes.status).json({
        error: data.error?.message || "Error al analizar la imagen con IA",
      });
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);

    return res.json(parsed);
  } catch (err) {
    return res.status(500).json({ error: "No se pudo analizar la imagen con IA" });
  }
});

app.listen(3001, () => {
  console.log("Backend escuchando en http://localhost:3001");
});