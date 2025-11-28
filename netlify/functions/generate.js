// --- Contenido para: netlify/functions/generate.js ---
exports.handler = async (event) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Falta la API Key en Netlify." }) };
  }

  let promptDelUsuario;
  try {
    const body = JSON.parse(event.body);
    promptDelUsuario = body.prompt;
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "JSON inválido." }) };
  }

  if (!promptDelUsuario) {
    return { statusCode: 400, body: JSON.stringify({ error: "El prompt está vacío." }) };
  }

  const promptCompleto = `
    Toma la siguiente idea y conviértela en una descripción de proyecto profesional y atractiva de 2 o 3 frases.
    Idea: "${promptDelUsuario}"
  `;

  try {
    // CAMBIO CLAVE: Usamos 'gemini-1.5-flash-latest' para evitar el error 404
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptCompleto }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return { statusCode: response.status, body: JSON.stringify({ error: `Google API Error: ${errorData}` }) };
    }

    const data = await response.json();
    const textoIA = data.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      body: JSON.stringify({ texto: textoIA })
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: `Server Error: ${error.message}` }) };
  }
};