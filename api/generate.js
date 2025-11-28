// --- Archivo: api/generate.js ---
export default async function handler(req, res) {
  // Configuración de CORS para que tu página pueda llamar a esta función
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Responder a la "pre-flight" request (necesario para seguridad del navegador)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Falta la API Key en el servidor." });
  }

  // En Vercel, req.body ya viene procesado si es JSON
  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: "El prompt está vacío." });
  }

  const promptCompleto = `
    Toma la siguiente idea y conviértela en una descripción de proyecto profesional y atractiva de 2 o 3 frases.
    Idea: "${prompt}"
  `;

  try {
    // Usamos el modelo ACTUAL: gemini-2.5-flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptCompleto }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return res.status(response.status).json({ error: `Error de Google: ${errorData}` });
    }

    const data = await response.json();
    const textoIA = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ texto: textoIA });

  } catch (error) {
    return res.status(500).json({ error: `Error del servidor: ${error.message}` });
  }
}