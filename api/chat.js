// --- Archivo: api/chat.js ---
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GEMINI_API_KEY;
  const { prompt, history } = req.body || {};

  // --- AQUÍ ESTÁ LA MAGIA: LA PERSONALIDAD ---
  const systemInstruction = `
    Eres "TadeoBot", el asistente virtual experto de la agencia de desarrollo web de Tadeo Garcia.
    Tu tono es: Profesional, amable y conciso.
    
    Tus conocimientos son:
    - Servicios: Landing pages ($150), E-commerce ($500), Chatbots con IA ($300).
    - Tiempos de entrega: 3 a 5 días hábiles.
    - Contacto: contacto.tadeodev@gmail.com
    
    Reglas:
    1. Si te preguntan algo fuera de desarrollo web, responde educadamente que solo hablas de servicios web.
    2. Intenta siempre cerrar la venta pidiendo que manden un correo.
    3. Respuestas cortas (máximo 2 párrafos).
  `;

  // Combinamos la instrucción con el mensaje del usuario
  // (Nota: En modelos pro se usa system_instruction, pero aquí lo inyectamos en el prompt para asegurar compatibilidad con Flash)
  const promptCompleto = `${systemInstruction}\n\nUsuario dice: "${prompt}"\n\nTadeoBot responde:`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptCompleto }] }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error?.message || "Error en Google API");
    
    const textoIA = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ texto: textoIA });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}