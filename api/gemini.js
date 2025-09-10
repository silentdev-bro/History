// This is your new serverless function.
// It runs in a secure environment on Vercel, not in the user's browser.

export default async function handler(request, response) {
  // 1. We only want to handle POST requests, which is how our frontend will send data.
  if (request.method !== 'POST') {
    return response.status(405).json({ error: { message: 'Method Not Allowed' } });
  }

  // 2. Get the Gemini API Key from the environment variables.
  // This is the SECURE part. The key is stored on Vercel's servers, not in our code.
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: { message: 'API key not configured on the server.' } });
  }

  // 3. Construct the real API URL.
  const model = "gemini-2.5-flash-preview-05-20";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    // 4. Make the actual request to the Gemini API, passing along the payload from our frontend.
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.body), // request.body contains the 'payload' from our index.html
    });
    
    // Check if the response from Gemini is okay. If not, forward the error.
    if (!geminiResponse.ok) {
        const errorData = await geminiResponse.json();
        console.error('Gemini API Error:', errorData);
        return response.status(geminiResponse.status).json(errorData);
    }

    const geminiData = await geminiResponse.json();

    // 5. Send the successful response from Gemini back to our frontend.
    return response.status(200).json(geminiData);

  } catch (error) {
    console.error('Internal Server Error:', error);
    return response.status(500).json({ error: { message: 'An internal error occurred.' } });
  }
}
