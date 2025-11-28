// --- Contenido para: netlify/functions/generate.js ---

// Usamos el fetch nativo de Node.js (disponible en Netlify)
exports.handler = async (event) => {
  // 1. Obtener la clave de API (segura) desde las variables de entorno de Netlify
  // Nombraremos a nuestra variable "GEMINI_API_KEY"
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "La API Key no está configurada en el servidor." }),
    };
  }

  // 2. Obtener el "prompt" (la idea) que envió el frontend
  let promptDelUsuario;
  try {
    const body = JSON.parse(event.body);
    promptDelUsuario = body.prompt;
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "No se recibió un prompt válido." }) };
  }

  if (!promptDelUsuario) {
    return { statusCode: 400, body: JSON.stringify({ error: "El prompt está vacío." }) };
  }

  // 3. Construir el prompt para Gemini (como lo teníamos antes)
  const promptCompleto = `
    Toma la siguiente idea y conviértela en una descripción de proyecto profesional y atractiva de 2 o 3 frases.
    Idea: "${promptDelUsuario}"
  `;

  // 4. Llamar a la API de Google (esta es la parte segura)
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptCompleto }]
        }]
      })
    });

    if (!response.ok) {
      // Si Google da un error, lo pasamos al frontend
      const errorData = await response.text();
      return { statusCode: response.status, body: JSON.stringify({ error: `Error de la API de Google: ${errorData}` }) };
    }

    const data = await response.json();
    const textoIA = data.candidates[0].content.parts[0].text;

    // 5. Enviar la respuesta de vuelta al frontend
    return {
      statusCode: 200,
      body: JSON.stringify({
        texto: textoIA
      })
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: `Error interno del servidor: ${error.message}` }) };
  }
};