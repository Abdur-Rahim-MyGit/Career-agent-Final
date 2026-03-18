const axios = require('axios');

async function testApi() {
  try {
    const res = await axios.post('http://localhost:5000/api/onboarding', {
      personalDetails: { name: 'Test User', email: 'test@example.com' },
      preferences: { 
        primary: { role: 'Software Engineer', sectors: ['IT'], salary: '12 LPA' },
        secondary: { role: 'Data Analyst' },
        tertiary: { role: 'Business Analyst' }
      },
      education: [
        { degreeLevel: 'Bachelor', degreeGroup: 'Engineering', specialization: 'Computer Science', currentlyPursuing: true }
      ],
      skills: ['JavaScript', 'Python'],
      experience: []
    }, { timeout: 45000 });
    console.log('Success Response:', res.status);
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else {
      console.error('Request Error:', error.message);
    }
  }
}

testApi();
