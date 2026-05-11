import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
// Note: In production, do not expose your API key in the frontend code.
// Consider using a Supabase Edge Function to proxy these requests safely.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const aiClient = new GoogleGenerativeAI(apiKey || 'placeholder');

export const generateCompletion = async (prompt, schema = null) => {
  if (!apiKey) {
    console.warn("Gemini API Key missing. Returning placeholder.");
    return schema ? null : "Gemini API Key missing.";
  }
  
  try {
    // Use gemini-1.5-flash which is fast and supports JSON schema
    const modelConfig = { model: 'gemini-1.5-flash' };
    
    if (schema) {
      modelConfig.generationConfig = {
        responseMimeType: 'application/json',
        responseSchema: schema
      };
    }
    
    const model = aiClient.getGenerativeModel(modelConfig);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    if (schema) {
      try {
        // Remove markdown formatting if present (Gemini sometimes adds it even in JSON mode)
        const cleanJson = text.replace(/```json\n?|```\n?/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (e) {
        console.error("Failed to parse AI JSON response:", text);
        return null;
      }
    }
    
    return text;
  } catch (error) {
    console.error('Error generating AI completion:', error);
    return schema ? null : "Error generating AI response.";
  }
};
export const verifyPaymentScreenshot = async (base64Image, planPrice) => {
  if (!apiKey) return { status: 'pending', reason: 'No API key' };
  
  try {
    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an advanced payment verification assistant. Analyze this screenshot of a payment receipt. 
    1. Check if the payment amount exactly matches Rs. ${planPrice}.
    2. Check if the payment status is successful.
    3. Check if the date is recent (must be within the last 24 hours).
    4. Extract the unique Transaction ID or Reference Number. If not found or illegible, return null.
    
    Respond in strict JSON format ONLY:
    {
      "status": "approved" | "pending" | "rejected",
      "amount": "detected amount or null",
      "transactionId": "detected transaction ID/reference number or null",
      "reason": "brief explanation"
    }`;

    // Extract the base64 part, removing the data URI prefix (e.g., data:image/jpeg;base64,)
    const base64Data = base64Image.split(',')[1];
    const mimeType = base64Image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1] || 'image/jpeg';

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    
    // Try to parse the JSON response
    try {
      // Find JSON block if it's wrapped in markdown
      const jsonStr = responseText.replace(/```json\n?|```\n?/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", responseText);
      return { status: 'pending', reason: 'AI response parsing failed' };
    }
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { status: 'pending', reason: 'Verification error' };
  }
};
