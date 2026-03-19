const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const roleSkillsPath = path.join(__dirname, 'data', 'role_skills_db.json');
  if (!fs.existsSync(roleSkillsPath)) {
    console.error(`File not found: ${roleSkillsPath}`);
    return;
  }

  const roleSkillsDB = JSON.parse(fs.readFileSync(roleSkillsPath, 'utf8'));
  const roles = Object.keys(roleSkillsDB);
  
  console.log(`Starting seed for ${roles.length} roles...`);

  let count = 0;
  for (const roleTitle of roles) {
    // 1. Upsert Role
    const roleRecord = await prisma.role.upsert({
      where: { title: roleTitle },
      update: {},
      create: { title: roleTitle },
    });

    const techSkills = roleSkillsDB[roleTitle].tech_skills || [];
    
    // 2. Upsert Skills & RoleSkills
    for (const skill of techSkills) {
      const skillName = skill.skill_name;
      const priority = skill.priority || 'Medium';

      // Upsert Skill
      const skillRecord = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: { name: skillName, category: 'technical' },
      });

      // Upsert RoleSkill junction
      await prisma.roleSkill.upsert({
        where: {
          roleId_skillId: {
            roleId: roleRecord.id,
            skillId: skillRecord.id
          }
        },
        update: { priority: priority },
        create: {
          roleId: roleRecord.id,
          skillId: skillRecord.id,
          priority: priority
        }
      });
    }

    count++;
    if (count % 10 === 0) {
      console.log(`Processed ${count} roles...`);
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
