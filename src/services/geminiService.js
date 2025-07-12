const axios = require('axios');

async function sendToGemini(message) {
  try {
    const GEMINI_MODEL = 'gemini-1.0-pro-latest'; // or whatever is correct

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: message }],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    // Adjust this based on the actual Gemini API response structure
    return (
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No response from Gemini'
    );
  } catch (err) {
    console.error('Gemini API error:', err.response?.data || err.message);
    return 'Error contacting Gemini API';
  }
}

module.exports = { sendToGemini }; 