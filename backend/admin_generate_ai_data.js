require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'anthropic/claude-3.5-sonnet';

async function generateKnowledgeGraph() {
  console.log('🤖 Starting AI Knowledge Graph Generation (Admin Script)...');
  console.log(`Using Model: ${AI_MODEL}`);

  if (!OPENROUTER_API_KEY) {
    console.error('❌ OPENROUTER_API_KEY is missing from .env');
    process.exit(1);
  }

  const prompt = `
    You are an AI career intelligence mapping system. 
    Generate a JSON database of 5 high-demand tech roles and their required skills. 
    Format identically to this example structure:
    {
      "roles": [
        {
          "title": "Cloud Architect",
          "requiredMatchScore": 0.65,
          "tech_skills": [
            { "skill_name": "AWS/Azure", "priority": "CRITICAL" },
            { "skill_name": "Terraform", "priority": "HIGH" }
          ]
        }
      ]
    }
    Only output valid JSON. No markdown.
  `;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: AI_MODEL,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let rawData = response.data.choices[0].message.content.trim();
    // remove markdown code blocks if the AI ignored instructions
    if (rawData.startsWith('```json')) {
        rawData = rawData.substring(7);
        if (rawData.endsWith('```')) rawData = rawData.slice(0, -3);
    }
    
    const parsedData = JSON.parse(rawData);
    const dbPath = path.join(__dirname, 'data', 'ai_generated_db.json');
    
    fs.writeFileSync(dbPath, JSON.stringify(parsedData, null, 2));
    
    console.log(`✅ Successfully generated new knowledge graph payload at ${dbPath}`);
    console.log('You can now use seed.js to upsert this payload into PostgreSQL.');

  } catch (error) {
    console.error('❌ AI Generation Failed:', error?.response?.data || error.message);
  }
}

generateKnowledgeGraph();
