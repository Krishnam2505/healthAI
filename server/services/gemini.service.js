import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Google Generative AI SDK
// What the API key does:
// The GEMINI_API_KEY acts as our server's private password to authenticate with Google's servers. 
// It proves to Google that we have permission to use their AI services. Without it, the request would be instantly rejected.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the specific model we want to use.
// Why use 'gemini-1.5-flash' over 'gemini-1.5-pro'?
// - 'gemini-1.5-pro' is Google's most capable model, designed for complex reasoning, math, and massive coding tasks. But it is slightly slower.
// - 'gemini-1.5-flash' is a lightweight, blazing-fast model optimized for speed and high-volume tasks (like generating quick text summaries or plans).
// Since we want our Health Tracker to generate a weekly plan almost instantly without making the user wait, 'flash' is the perfect choice!
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// This function takes all the user's data and asks Gemini to build a custom 7-day plan
async function generateWeeklyPlan(userData) {
  try {
    // 1. Build the prompt. We use Template Literals (`) to inject the user's variables directly into the string.
    const prompt = `
      You are an expert fitness and nutrition coach.
      Generate a customized 7-day health plan for a user based on their data.
      
      User Data:
      Name: ${userData.name}
      Goal: ${userData.goal} weight
      Daily Calorie Target: ${userData.dailyCalorieTarget} kcal
      Recent Workouts: ${JSON.stringify(userData.last7DaysWorkouts)}
      Recent Meals: ${JSON.stringify(userData.last7DaysMeals)}

      CRITICAL: You MUST respond with ONLY a raw JSON object. Do not include markdown formatting, backticks, or any conversational text.
      The JSON structure MUST perfectly match this format:
      {
        "weeklyPlan": [
          {
            "day": "Monday",
            "workout": {
              "type": "string",
              "duration": number,
              "exercises": ["exercise 1", "exercise 2", "exercise 3"]
            },
            "meals": {
              "breakfast": { "name": "string", "calories": number, "protein": number },
              "lunch": { "name": "string", "calories": number, "protein": number },
              "dinner": { "name": "string", "calories": number, "protein": number },
              "snack": { "name": "string", "calories": number, "protein": number }
            },
            "totalCalories": number,
            "tip": "string"
          }
        ]
      }
    `;

    // 2. Send the giant prompt to Google's servers
    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // 3. Clean the response
    // AI models are stubborn and sometimes wrap JSON in markdown (like \`\`\`json) even when explicitly told not to. 
    // This Regex removes those markdown blocks so our code doesn't crash when trying to parse it.
    text = text.replace(/```json|```/g, '').trim();

    // 4. Convert the raw string into a real Javascript Object
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini parsing error:', error);
    // If Gemini hallucinates and returns broken JSON, we throw an error so our server doesn't crash
    throw new Error('Gemini returned invalid JSON');
  }
}

// This function allows the user to have a back-and-forth conversation with a Nutritionist AI.
// Difference between generateContent() and startChat():
// - model.generateContent() is for a single, one-off task. The AI does the job and instantly forgets everything.
// - model.startChat() is for an ongoing conversation. We pass in the entire `history` array so the AI remembers what you said 5 minutes ago!
async function chatWithNutritionist(messages, userContext) {
  try {
    // 1. Build the secret instructions (System Context)
    const systemContext = `
      You are a concise, friendly nutritionist chatbot. The user's fitness goal is to ${userContext.goal} weight.
      Their daily calorie target is ${userContext.dailyCalorieTarget} kcal and they have consumed ${userContext.todayCalories} kcal today.
      Answer nutrition questions in 2-4 sentences. Be specific with numbers when relevant. Never give medical advice.
    `;

    // 2. If this is the start of the conversation, secretly tape our hidden instructions to the top of the user's first message!
    if (messages.length === 1) {
      messages[0].parts[0].text = `${systemContext}\n\nUser Question: ${messages[0].parts[0].text}`;
    }

    // 3. The history is every message EXCEPT the one they just typed right now
    const history = messages.slice(0, -1);
    const lastMessage = messages[messages.length - 1];

    // 4. Start the chat session with the historical memory
    const chat = model.startChat({ history });

    // 5. Send the new message
    const result = await chat.sendMessage(lastMessage.parts[0].text);

    return result.response.text();
  } catch (error) {
    console.error('Gemini chat error:', error);
    throw new Error('AI chat failed to respond');
  }
}

export { model, generateWeeklyPlan, chatWithNutritionist };
