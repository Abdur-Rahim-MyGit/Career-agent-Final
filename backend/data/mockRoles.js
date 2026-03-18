const roles = [
    {
        id: 1,
        title: 'Software Developer',
        job_family: 'Engineering',
        sector: 'IT',
        min_salary: 6,
        max_salary: 18,
        ai_exposure: 85,
        summary: 'Build and maintain complex software applications.',
        skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Docker']
    },
    {
        id: 2,
        title: 'Data Analyst',
        job_family: 'Analytics',
        sector: 'Finance',
        min_salary: 5,
        max_salary: 15,
        ai_exposure: 70,
        summary: 'Analyze data patterns to drive business decisions.',
        skills: ['Python', 'SQL', 'Tableau', 'Excel', 'Statistics']
    },
    {
        id: 3,
        title: 'Cloud Engineer',
        job_family: 'Infrastructure',
        sector: 'IT',
        min_salary: 8,
        max_salary: 22,
        ai_exposure: 75,
        summary: 'Manage and scale cloud infrastructure.',
        skills: ['AWS', 'Terraform', 'Linux', 'Networking', 'Python']
    },
    {
        id: 4,
        title: 'AI Prompt Engineer',
        job_family: 'AI/LLM',
        sector: 'EdTech',
        min_salary: 10,
        max_salary: 25,
        ai_exposure: 100,
        summary: 'Optimizing LLM outputs for specific use cases.',
        skills: ['Prompt Engineering', 'Python', 'LLM Architectures', 'NLP']
    }
];

module.exports = { roles };
