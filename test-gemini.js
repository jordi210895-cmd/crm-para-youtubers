import { GoogleGenerativeAI } from '@google/generative-ai';
const apiKey = 'AIzaSyAaSPpqYDdz9KwVtacPP0mSDmKR08sQ54A';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run() {
  try {
    const prompt = `
                Eres un experto estratega de contenido para YouTube.
                El usuario te pide ideas de videos sobre esta temática: "gatos".
                Genera EXACTAMENTE 3 ideas de videos de alto rendimiento.
                Importante: Devuelve SOLO UN ARRAY JSON VÁLIDO. No pongas comillas invertidas (backticks) de markdown, ni la palabra json. SOLO el texto del array listo para parsear.
                Formato requerido:
                [
                  { "title": "Título llamativo (max 50 chars)", "description": "Concepto del video en 1 línea corta." },
                  { "title": "...", "description": "..." },
                  { "title": "...", "description": "..." }
                ]
            `;
    const result = await model.generateContent(prompt);
    console.log("Raw response:", result.response.text());
  } catch(e) {
    console.error("Error:", e);
  }
}
run();
