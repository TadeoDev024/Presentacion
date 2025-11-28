// --- Contenido para: generador.js ---

// 1. Obtenemos los elementos del DOM (del GeneradorIA.html)
const boton = document.getElementById("generateButton");
const resultado = document.getElementById("resultado");
const idea = document.getElementById("idea");

// 2. Usamos addEventListener, que es más moderno que "onclick"
boton.addEventListener("click", generarTexto);

async function generarTexto() {
  const ideaTexto = idea.value;

  if (!ideaTexto.trim()) {
    resultado.innerHTML = "⚠️ Escribí una idea primero.";
    return;
  }

  // Deshabilitamos el botón para evitar doble clic
  boton.disabled = true;
  resultado.innerHTML = "🤖 Conectando con el servidor... dame un segundo...";

  try {
    // 3. ¡LA PARTE CLAVE! Llamamos a NUESTRA función de Netlify, no a Google.
    // Esta URL es el "endpoint" estándar de Netlify para una función llamada "generate".
    const response = await fetch("/.netlify/functions/generate.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Enviamos el prompt en el body
      body: JSON.stringify({
        prompt: ideaTexto
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Si nuestra función (o Google) dio un error, lo mostramos
      throw new Error(data.error || "Ocurrió un error desconocido.");
    }

    // ¡Éxito! Mostramos el texto recibido desde nuestra función
    resultado.innerHTML = data.texto;

  } catch (error) {
    console.error("Error al llamar a la función de Netlify:", error);
    resultado.innerHTML = `❌ Hubo un error. (Detalle: ${error.message})`;
  } finally {
    // Volvemos a habilitar el botón
    boton.disabled = false;
  }
}