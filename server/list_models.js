import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/krishnamarora/Desktop/health/server/.env' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    console.log(JSON.stringify(data.models.map(m => m.name), null, 2));
  } catch (err) {
    console.error(err);
  }
}

listModels();
