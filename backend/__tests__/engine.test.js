const { 
  calculateDirectionScore, 
  calculateSkillGaps, 
  determineZone, 
  processCareerIntelligence 
} = require('../engine');

describe('Engine Core Calculations', () => {

  describe('calculateSkillGaps', () => {
    const roleData = {
      tech_skills: [
        { skill_name: "Python", priority: "High" },
        { skill_name: "SQL", priority: "High" }
      ]
    };

    test('Student with ALL required skills → missingSkills should be empty', () => {
      const studentSkills = ["Python", "SQL", "Git"];
      const result = calculateSkillGaps(studentSkills, roleData);
      expect(result.missingSkills.length).toBe(0);
      expect(result.mathingSkills).toEqual(expect.arrayContaining(["Python", "SQL"]));
    });

    test('Student with NO skills → all skills should be in missingSkills', () => {
      const studentSkills = ["Java", "C++"];
      const result = calculateSkillGaps(studentSkills, roleData);
      expect(result.missingSkills.length).toBe(2);
      expect(result.mathingSkills.length).toBe(0);
    });

    test('Student with partial skills → correct split between matched and missing', () => {
      const studentSkills = ["Python"];
      const result = calculateSkillGaps(studentSkills, roleData);
      expect(result.missingSkills.length).toBe(1);
      expect(result.missingSkills[0].skill_name).toBe("SQL");
      expect(result.mathingSkills.length).toBe(1);
      expect(result.mathingSkills[0]).toBe("Python");
    });
  });

  describe('determineZone', () => {
    test('Score 0.7 → should return { zone: "Green" }', () => {
      const result = determineZone(0.7);
      expect(result.zone).toBe("Green");
    });

    test('Score 0.4 → should return { zone: "Amber" }', () => {
      const result = determineZone(0.4);
      expect(result.zone).toBe("Amber");
    });

    test('Score 0.1 → should return { zone: "Red" }', () => {
      const result = determineZone(0.1);
      expect(result.zone).toBe("Red");
    });
  });

  describe('processCareerIntelligence (integration)', () => {
    test('Should return a shaped object with status, primary, secondary, tertiary, preVerified, combined_tab4', async () => {
      const mockStudentData = {
        personalDetails: { name: "Test User", email: "test@example.com" },
        education: [
          { degreeGroup: "B.Tech", specialization: "Computer Science" }
        ],
        preferences: {
          primary: { role: "Software Developer" },
          secondary: { role: "Data Analyst" },
          tertiary: { role: "Product Manager" }
        },
        skills: ["Python", "SQL"]
      };

      const result = await processCareerIntelligence(mockStudentData);
      
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('primary');
      expect(result).toHaveProperty('secondary');
      expect(result).toHaveProperty('tertiary');
      expect(result).toHaveProperty('preVerified');
      expect(result).toHaveProperty('combined_tab4');
      
      expect(result.preVerified.primarySkillGap.coveragePct).toBeGreaterThanOrEqual(0);
      expect(result.preVerified.primarySkillGap.coveragePct).toBeLessThanOrEqual(100);
    });
  });
});
