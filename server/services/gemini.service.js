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
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// This function takes all the user's data and asks Gemini to build a custom 7-day plan
async function generateWeeklyPlan(userData) {
  try {
    // 1. Build the prompt. We use Template Literals (`) to inject the user's variables directly into the string.
    const prompt = `
      You are an expert fitness and nutrition coach.
      Generate a customized 7-day health plan for a user based on their data.
      
      User Data:
      Name: ${userData.name}
      Gender: ${userData.gender}
      Goal: ${userData.goal} weight
      Daily Calorie Target: ${userData.dailyCalorieTarget} kcal
      Recent Workouts: ${JSON.stringify(userData.last7DaysWorkouts)}
      Recent Meals: ${JSON.stringify(userData.last7DaysMeals)}
      ${userData.gender === 'female' && userData.last7DaysCycle && userData.last7DaysCycle.length > 0 ? `Recent Cycle Symptoms: ${JSON.stringify(userData.last7DaysCycle)} (Consider this when recommending workouts or nutritional needs like iron/magnesium)` : ''}

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
    console.error('Gemini error, falling back to mock plan:', error.message);
    
    // IF THE API KEY FAILS, WE RETURN A HARDCODED MOCK PLAN SO YOU CAN STILL SEE THE APP WORK!
    return {
      weeklyPlan: [
        {
          day: "Monday",
          workout: { type: "Full Body Strength", duration: 45, exercises: ["Squats 3x10", "Pushups 3x12", "Dumbbell Rows 3x10"] },
          meals: {
            breakfast: { name: "Oatmeal with Protein Powder", calories: 350, protein: 30 },
            lunch: { name: "Grilled Chicken Salad", calories: 450, protein: 40 },
            dinner: { name: "Salmon and Quinoa", calories: 550, protein: 45 },
            snack: { name: "Greek Yogurt", calories: 150, protein: 15 }
          },
          totalCalories: 1500,
          tip: "Never skip Monday! A strong start sets the tone for the entire week."
        },
        {
          day: "Tuesday",
          workout: { type: "Active Recovery (Yoga)", duration: 30, exercises: ["Sun Salutations", "Hip Openers", "Core stretch"] },
          meals: {
            breakfast: { name: "Scrambled Eggs on Toast", calories: 400, protein: 25 },
            lunch: { name: "Turkey Wrap", calories: 500, protein: 35 },
            dinner: { name: "Beef Stir Fry", calories: 600, protein: 40 },
            snack: { name: "Almonds & Apple", calories: 200, protein: 5 }
          },
          totalCalories: 1700,
          tip: "Recovery is just as important as the workout. Drink plenty of water today!"
        },
        {
          day: "Wednesday",
          workout: { type: "HIIT Cardio", duration: 25, exercises: ["Burpees 4x30s", "Mountain Climbers 4x30s", "Jump Squats 4x30s"] },
          meals: {
            breakfast: { name: "Protein Smoothie", calories: 300, protein: 35 },
            lunch: { name: "Tuna Salad Bowl", calories: 450, protein: 38 },
            dinner: { name: "Chicken Breast & Asparagus", calories: 400, protein: 42 },
            snack: { name: "Protein Bar", calories: 220, protein: 20 }
          },
          totalCalories: 1370,
          tip: "HIIT burns calories even after you stop exercising. Keep pushing!"
        },
        {
          day: "Thursday",
          workout: { type: "Upper Body Power", duration: 50, exercises: ["Bench Press 4x8", "Pullups 4xMax", "Shoulder Press 3x10"] },
          meals: {
            breakfast: { name: "Avocado Toast with Eggs", calories: 450, protein: 22 },
            lunch: { name: "Chicken and Rice", calories: 550, protein: 45 },
            dinner: { name: "Lean Steak with Sweet Potato", calories: 650, protein: 50 },
            snack: { name: "Cottage Cheese", calories: 120, protein: 14 }
          },
          totalCalories: 1770,
          tip: "Make sure you are eating enough protein today to rebuild those muscle fibers."
        },
        {
          day: "Friday",
          workout: { type: "Lower Body Hypertrophy", duration: 50, exercises: ["Leg Press 4x12", "Romanian Deadlifts 4x10", "Calf Raises 4x15"] },
          meals: {
            breakfast: { name: "Oatmeal with Berries", calories: 300, protein: 10 },
            lunch: { name: "Chicken Salad", calories: 400, protein: 35 },
            dinner: { name: "Shrimp Pasta", calories: 600, protein: 40 },
            snack: { name: "Protein Shake", calories: 150, protein: 25 }
          },
          totalCalories: 1450,
          tip: "Friday grind! Don't let the weekend derail your incredible progress."
        },
        {
          day: "Saturday",
          workout: { type: "Long Run / Outdoor Activity", duration: 60, exercises: ["Steady state run", "Dynamic stretching"] },
          meals: {
            breakfast: { name: "Pancakes (Protein Batter)", calories: 500, protein: 30 },
            lunch: { name: "Turkey Burger (No Bun)", calories: 450, protein: 35 },
            dinner: { name: "Cheat Meal (Moderation)", calories: 800, protein: 25 },
            snack: { name: "Fruit Salad", calories: 150, protein: 2 }
          },
          totalCalories: 1900,
          tip: "Enjoy your cheat meal, you earned it! But stay hydrated."
        },
        {
          day: "Sunday",
          workout: { type: "Complete Rest", duration: 0, exercises: ["Sleep", "Relaxation", "Meal Prep"] },
          meals: {
            breakfast: { name: "Eggs and Bacon", calories: 400, protein: 25 },
            lunch: { name: "Leftover Steak", calories: 500, protein: 40 },
            dinner: { name: "Chicken Soup", calories: 350, protein: 25 },
            snack: { name: "Mixed Nuts", calories: 200, protein: 8 }
          },
          totalCalories: 1450,
          tip: "Spend 30 minutes today prepping your meals for Monday and Tuesday!"
        }
      ]
    };
  }
}

// This function allows the user to have a back-and-forth conversation with a Nutritionist AI.
// Difference between generateContent() and startChat():
// - model.generateContent() is for a single, one-off task. The AI does the job and instantly forgets everything.
// - model.startChat() is for an ongoing conversation. We pass in the entire `history` array so the AI remembers what you said 5 minutes ago!
async function chatWithNutritionist(messages, userContext) {
  // Ensure we never crash if userContext hasn't loaded yet
  const safeContext = userContext || { goal: 'maintain', dailyCalorieTarget: 2000, todayCalories: 0 };
  
  try {
    // 1. Build the secret instructions (System Context)
    const systemContext = `
      You are a concise, friendly nutritionist chatbot. The user's fitness goal is to ${safeContext.goal} weight.
      Their daily calorie target is ${safeContext.dailyCalorieTarget} kcal and they have consumed ${safeContext.todayCalories} kcal today.
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
    console.error('AI chat failed, falling back to mock response:', error.message);
    
    // MOCK RESPONSE
    return "I'm experiencing some trouble connecting to my Google brain right now because of the API key issue! But since your goal is to " + safeContext.goal + " weight, I highly recommend making sure you hit your " + safeContext.dailyCalorieTarget + " calorie target with whole, nutrient-dense foods! Ask me again once the API key is fixed!";
  }
}

export { generateWeeklyPlan, chatWithNutritionist };
