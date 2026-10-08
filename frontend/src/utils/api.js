import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
})

export async function analyzeResume(file, onUploadProgress) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  })
  return response.data
}

export async function fetchJobs(jobTitle, location) {
  const response = await api.post('/jobs', {
    job_title: jobTitle,
    location:  location || null
  })
  return response.data
}

export async function sendChatMessage(message, analysis, history) {
  const response = await api.post('/chat', { message, analysis, history })
  return response.data
}

export async function checkHealth() {
  const response = await api.get('/health')
  return response.data
}

/**
 * Hybrid Teacher & Mentor Recommendation based on skill gaps and target role.
 */
export async function recommendTeachers(analysis, targetRole = null, preferences = null, limit = 6) {
  const payload = {
    analysis,
    target_role: targetRole || null,
    preferences: preferences || null,
    limit: limit || 6
  }
  const response = await api.post('/teachers/recommend', payload)
  return response.data
}

export async function recommendStudentsForTeacher(teacherId, topSkills = []) {
  const params = topSkills.length ? { top_skills: topSkills.join(',') } : undefined
  const response = await api.get(`/teachers/${teacherId}/students`, { params })
  return response.data
}

/**
 * Resume Roaster: multi-part request uploading the PDF resume along with selected tone & role.
 */
export async function roastResume(file, targetRole = 'Software Engineer', tone = 'balanced', analysisContext = null) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('target_role', targetRole)
  formData.append('tone', tone)
  if (analysisContext) {
    formData.append('analysis_context', JSON.stringify(analysisContext))
  }
  const response = await api.post('/resume/roast', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000
  })
  return response.data
}

/**
 * Resume Improvement: iterative refinement of specific sections without fabrication.
 */
export async function improveResume(resumeText, targetRole = 'Software Engineer', selectedIssues = null, analysisContext = null) {
  const payload = {
    resume_text: resumeText,
    target_role: targetRole,
    selected_issues: selectedIssues || null,
    analysis_context: analysisContext || null
  }
  const response = await api.post('/resume/improve', payload, {
    timeout: 90000
  })
  return response.data
}
