const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const generateCareerIntelligence = async (prompt) => {
    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: process.env.AI_MODEL || 'anthropic/claude-3.5-sonnet',
                messages: [{ role: 'user', content: prompt }],
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://smaart-platform.com', // Optional
                    'X-Title': 'SMAART Platform', // Optional
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('AI Intelligence Generation Error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to generate career intelligence');
    }
};

module.exports = { generateCareerIntelligence };
