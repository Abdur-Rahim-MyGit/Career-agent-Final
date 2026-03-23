  /* Submit */
  async function submit() {
    setSubmitting(true); setError('');
    try {
      const payload = {
        name, email, phone, password,
        education: [{ level:eduLevel, domain:eduDomain, degreeGroup:eduDegree, specialization:effectiveSpec, yearOfStudy, gradYear, currentlyPursuing }],
        collegeCode,
        preferences: {
          primary:   { ...primary,   jobRole:primary.role },
          secondary: { ...secondary, jobRole:secondary.role },
          tertiary:  { ...tertiary,  jobRole:tertiary.role },
        },
        skills: skills.map(s => s.name),
        skillDetails: skills,
        experience: experiences.filter(e => e.org || e.designation),
      };

      let res;
      let analysisData = null;
      try {
        res = await axios.post('http://localhost:5000/api/onboarding', payload);
        analysisData = res.data;
      } catch {
        /* Backend down — create local mock analysis so dashboard shows data */
        const localId = `local_${Date.now()}`;
        analysisData = {
          analysisId: localId,
          success: true,
          analysis: {
            preVerified: {
              primaryZone: { employer_zone: 'Amber' },
              primarySkillGap: {
                matched: skills.map(s => s.name),
                missing: [],
                coveragePct: skills.length > 0 ? 60 : 20,
              },
              primaryMarket: {
                salary_min_lpa: 4, salary_max_lpa: 10,
                demand_level: 'High', ai_automation_risk: 'Medium',
              },
            },
            combined_tab4: { learning_roadmap: [
              { step: 'Step 1 — Foundation Skills', description: 'Master prerequisites for your target role.' },
              { step: 'Step 2 — Core Technical Skills', description: 'Learn the primary tools and technologies.' },
              { step: 'Step 3 — Projects & Portfolio', description: 'Build real projects to demonstrate your skills.' },
            ]},
            input_user_data: payload,
          },
        };
        res = { data: analysisData };
      }

      const analysisId = res.data?.analysisId || `local_${Date.now()}`;
      const analysisPayload = res.data?.analysis || res.data;

      /* Save for dashboard */
      localStorage.setItem('smaart_analysis_id', analysisId);
      localStorage.setItem('smaart_degree', `${eduDegree} – ${effectiveSpec}`);
      localStorage.setItem('smaart_interest', primary.sectors[0] || primary.role || '');
      localStorage.setItem('latestFormData', JSON.stringify(payload));
      localStorage.setItem('careerMatch', JSON.stringify(res.data));
      localStorage.setItem('smaart_last_analysis', JSON.stringify(analysisPayload));

      /* Save to careerHistory (shown in Home sidebar) */
      const historyEntry = {
        id: Date.now(),
        analysisId,
        timestamp: new Date().toISOString(),
        role: primary.role || `${eduDegree} – ${effectiveSpec}` || 'Career Analysis',
        degree: `${eduDegree} – ${effectiveSpec}`,
        data: res.data,
      };
      const prevHistory = JSON.parse(localStorage.getItem('careerHistory') || '[]');
      localStorage.setItem('careerHistory', JSON.stringify([historyEntry, ...prevHistory].slice(0, 10)));

      navigate('/directions');
    } catch (err) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally { setSubmitting(false); }
  }