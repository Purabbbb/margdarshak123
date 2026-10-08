import React, { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { roastResume, improveResume } from '../utils/api.js'
import RoastSummary from './RoastSummary.jsx'
import ResumeScore from './ResumeScore.jsx'
import RoastIssueCard from './RoastIssueCard.jsx'
import ResumeDiff from './ResumeDiff.jsx'
import ResumeVersionTimeline from './ResumeVersionTimeline.jsx'
import styles from './ResumeRoasterPanel.module.css'

const ROAST_LOADING_MESSAGES = [
  'Reading your resume without mercy...',
  'Checking if your bullets describe work or just existence...',
  'Hunting down passive verbs and buzzword fluff...',
  'Calculating honest MargDarshak Quality Estimate...',
  'Crafting constructive career roast...',
  'Assembling your improvement roadmap...',
]

export default function ResumeRoasterPanel({ analysis, resumeFile }) {
  const { job_roles } = analysis || {}
  const topRoles = job_roles?.top_roles || []
  const initialRole = job_roles?.best_match?.role || (topRoles[0]?.role || 'Software Engineer')

  const [currentFile, setCurrentFile] = useState(resumeFile || null)
  const [targetRole, setTargetRole] = useState(initialRole)
  const [tone, setTone] = useState('balanced')

  // Loading & Error States
  const [loadingRoast, setLoadingRoast] = useState(false)
  const [loadingImprove, setLoadingImprove] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState(null)

  // Roast Data
  const [roastData, setRoastData] = useState(null)
  const [appliedIssueIds, setAppliedIssueIds] = useState(new Set())
  const [dismissedIssueIds, setDismissedIssueIds] = useState(new Set())

  // Version History State
  const [versions, setVersions] = useState([])
  const [activeVersionIndex, setActiveVersionIndex] = useState(0)
  const [currentRevisedText, setCurrentRevisedText] = useState('')
  const [currentChanges, setCurrentChanges] = useState([])

  // Keep currentFile in sync if prop changes
  useEffect(() => {
    if (resumeFile && !currentFile) {
      setCurrentFile(resumeFile)
    }
  }, [resumeFile])

  // PDF Dropzone for fallback
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null)
    if (rejectedFiles.length > 0) {
      setError('Please upload a PDF file only.')
      return
    }
    if (acceptedFiles.length > 0) {
      setCurrentFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  })

  // Trigger Roast API
  async function handleRoast(customTone = null, customRole = null) {
    if (!currentFile) {
      setError('Please select or upload your resume PDF to begin roasting.')
      return
    }

    const activeTone = customTone || tone
    const activeRole = customRole || targetRole

    setLoadingRoast(true)
    setError(null)
    setLoadingStep(0)

    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < ROAST_LOADING_MESSAGES.length - 1 ? prev + 1 : prev))
    }, 1500)

    try {
      const data = await roastResume(currentFile, activeRole, activeTone, analysis)
      clearInterval(interval)
      setRoastData(data)
      setAppliedIssueIds(new Set())
      setDismissedIssueIds(new Set())

      const initialVer = {
        name: 'V1 Original',
        score: data.overall_score,
        description: 'Baseline Resume',
        sectionScores: data.section_scores,
        changes: [],
        resumeText: analysis?.pipeline?.step1_extraction?.raw_text_preview || '',
      }
      setVersions([initialVer])
      setActiveVersionIndex(0)
      setCurrentChanges([])
      setCurrentRevisedText('')
    } catch (err) {
      clearInterval(interval)
      setError(err.response?.data?.detail || err.message || 'Failed to roast resume. Please check if backend is running.')
    } finally {
      setLoadingRoast(false)
    }
  }

  // Apply Single Fix or Auto-Improve All
  async function handleApplyFix(issue = null) {
    const rawResumeText = analysis?.pipeline?.step1_extraction?.raw_text_preview || roastData?.summary || ''
    const baseText = currentRevisedText || rawResumeText

    const targetIssueIds = issue ? [issue.id] : (roastData?.issues || []).map(i => i.id)

    setLoadingImprove(true)
    setError(null)

    try {
      const res = await improveResume(
        baseText,
        targetRole,
        targetIssueIds,
        analysis
      )

      // Mark applied issues
      setAppliedIssueIds(prev => {
        const next = new Set(prev)
        targetIssueIds.forEach(id => next.add(id))
        return next
      })

      setCurrentChanges(res.changes)
      setCurrentRevisedText(res.revised_resume_text)

      // Push new version to history
      const newVersionNum = versions.length + 1
      const newVersion = {
        name: `V${newVersionNum} Improved`,
        score: res.improved_score,
        description: issue ? `Fixed ${issue.section}` : 'Applied All Suggested Improvements',
        sectionScores: res.section_scores,
        changes: res.changes,
        resumeText: res.revised_resume_text,
      }

      setVersions(prev => [...prev, newVersion])
      setActiveVersionIndex(versions.length)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate resume improvements.')
    } finally {
      setLoadingImprove(false)
    }
  }

  function handleDismissIssue(issueId) {
    setDismissedIssueIds(prev => new Set(prev).add(issueId))
  }

  function handleSelectVersion(index) {
    setActiveVersionIndex(index)
    const ver = versions[index]
    if (ver) {
      setCurrentChanges(ver.changes || [])
      setCurrentRevisedText(ver.resumeText || '')
    }
  }

  function handleToneSwitch(newTone) {
    setTone(newTone)
    if (roastData) {
      handleRoast(newTone, targetRole)
    }
  }

  function handleRoleSwitch(newRole) {
    setTargetRole(newRole)
    if (roastData) {
      handleRoast(tone, newRole)
    }
  }

  function handleSaveManualEdit(newText) {
    setCurrentRevisedText(newText)
    const newVersion = {
      name: `V${versions.length + 1} Manual`,
      score: Math.min((versions[activeVersionIndex]?.score || 70) + 2, 98),
      description: 'User Refined Copy',
      sectionScores: versions[activeVersionIndex]?.sectionScores || roastData?.section_scores,
      changes: currentChanges,
      resumeText: newText,
    }
    setVersions(prev => [...prev, newVersion])
    setActiveVersionIndex(versions.length)
  }

  return (
    <div className={styles.container}>
      {/* Landing State: Initial Roast CTA */}
      {!roastData && !loadingRoast && (
        <div className={styles.landingCard}>
          <div className={styles.landingHeader}>
            <span className={styles.landingTag}>MargDarshak Roast & Refine</span>
            <h2 className={styles.landingTitle}>
              Your resume asked for a review.<br />
              <span className={styles.accentText}>It got a roast.</span>
            </h2>
            <p className={styles.landingSub}>
              Turn career criticism into a sharper, metric-driven resume. Get humorous but constructive recruiter feedback paired with instant active-phrasing upgrades.
            </p>
          </div>

          <div className={styles.landingControlsGrid}>
            <div className={styles.landingControlCol}>
              <label className={styles.landingLabel}>Target Role to Roast For</label>
              <select
                className={styles.landingSelect}
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
              >
                {topRoles.map(r => (
                  <option key={r.role} value={r.role}>
                    {r.role} ({Math.round(r.score)}% match)
                  </option>
                ))}
                {!topRoles.some(r => r.role === targetRole) && (
                  <option value={targetRole}>{targetRole}</option>
                )}
              </select>
            </div>

            <div className={styles.landingControlCol}>
              <label className={styles.landingLabel}>Roast Humor Tone</label>
              <div className={styles.tonePillGroup}>
                {[
                  { id: 'friendly', label: 'Gentle' },
                  { id: 'balanced', label: 'Balanced' },
                  { id: 'savage', label: 'Savage' },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    className={`${styles.toneBtn} ${tone === t.id ? styles.toneBtnActive : ''}`}
                    onClick={() => setTone(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* File state indicator */}
          {currentFile ? (
            <div className={styles.readyFileCard}>
              <div className={styles.fileIcon}>📄</div>
              <div className={styles.fileDetails}>
                <span className={styles.fileName}>{currentFile.name || 'Current Uploaded Resume PDF'}</span>
                <span className={styles.fileSize}>
                  {currentFile.size ? `${(currentFile.size / 1024).toFixed(1)} KB` : 'Ready for roasting'}
                </span>
              </div>
              <button
                type="button"
                className={styles.mainRoastBtn}
                onClick={() => handleRoast()}
              >
                🔥 Roast My Resume
              </button>
            </div>
          ) : (
            <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.dropActive : ''}`}>
              <input {...getInputProps()} />
              <div className={styles.dropIcon}>📂</div>
              <p>Drag & drop your resume PDF here, or click to browse</p>
              <span className={styles.dropHint}>Supports text-based PDF up to 5MB</span>
            </div>
          )}

          {error && (
            <div className={styles.errorBanner}>
              <span>⚠️ {error}</span>
            </div>
          )}
        </div>
      )}

      {/* Loading Animation State */}
      {loadingRoast && (
        <div className={styles.loadingCard}>
          <div className={styles.flameSpinner}>🔥</div>
          <h3 className={styles.loadingTitle}>{ROAST_LOADING_MESSAGES[loadingStep]}</h3>
          <p className={styles.loadingSub}>Analyzing passive voice, metric density, and ATS alignment for {targetRole}...</p>
          <div className={styles.loadingBarBg}>
            <div
              className={styles.loadingBarFill}
              style={{ width: `${((loadingStep + 1) / ROAST_LOADING_MESSAGES.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Post-Roast Workspace */}
      {roastData && !loadingRoast && (
        <div className={styles.roastWorkspace}>
          {/* 1. Roast Headline & Tone Switcher */}
          <RoastSummary
            headlineRoast={roastData.headline_roast}
            summary={roastData.summary}
            tone={tone}
            onToneChange={handleToneSwitch}
            targetRole={targetRole}
            onRoleChange={handleRoleSwitch}
            topRoles={topRoles}
            onRoastAgain={() => handleRoast()}
            loading={loadingRoast}
          />

          {/* 2. Quality Score & Sub-scores */}
          <ResumeScore
            scores={versions[activeVersionIndex]?.sectionScores || roastData.section_scores}
            previousScore={activeVersionIndex > 0 ? versions[activeVersionIndex - 1]?.score : null}
          />

          {/* 3. Version Timeline */}
          {versions.length > 1 && (
            <ResumeVersionTimeline
              versions={versions}
              activeVersionIndex={activeVersionIndex}
              onSelectVersion={handleSelectVersion}
              onRefineFurther={() => handleApplyFix()}
              loading={loadingImprove}
            />
          )}

          {/* 4. Quick Wins & ATS Keywords */}
          <div className={styles.quickWinsGrid}>
            <div className={styles.quickWinsCard}>
              <div className={styles.quickWinsHeader}>
                <span className={styles.quickWinsTag}>Top Actionable Priorities</span>
                <h4>Quick High-Impact Fixes</h4>
              </div>
              <ul className={styles.quickWinsList}>
                {roastData.top_fixes?.map((fix, i) => (
                  <li key={i}>
                    <span className={styles.fixNum}>{i + 1}</span>
                    <span>{fix}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.atsKeywordsCard}>
              <div className={styles.quickWinsHeader}>
                <span className={styles.atsTag}>Target Role Keywords</span>
                <h4>ATS Signals to Add for {targetRole}</h4>
              </div>
              <div className={styles.atsChipsRow}>
                {roastData.ats_keywords_to_consider?.map((kw, i) => (
                  <span key={i} className={styles.atsChip}>
                    + {kw}
                  </span>
                ))}
              </div>
              <p className={styles.atsSubText}>
                Mention these keywords naturally in context under your Projects or Skills section.
              </p>
            </div>
          </div>

          {/* 5. Issue Feed Header */}
          <div className={styles.issuesHeaderRow}>
            <div>
              <h3 className={styles.issuesSectionHeading}>Concrete Resume Problems Found</h3>
              <p className={styles.issuesSectionSub}>
                Every critique is paired with an actionable rewrite without fabricating credentials.
              </p>
            </div>

            <button
              type="button"
              className={styles.autoImproveAllBtn}
              onClick={() => handleApplyFix()}
              disabled={loadingImprove}
            >
              {loadingImprove ? 'Transforming Resume...' : '⚡ Auto-Improve All Sections'}
            </button>
          </div>

          {/* 6. Issue Cards List */}
          <div className={styles.issuesList}>
            {roastData.issues?.map(issue => (
              <RoastIssueCard
                key={issue.id}
                issue={issue}
                onApplyFix={handleApplyFix}
                onDismiss={handleDismissIssue}
                isApplied={appliedIssueIds.has(issue.id)}
                isDismissed={dismissedIssueIds.has(issue.id)}
              />
            ))}
          </div>

          {/* 7. Before vs After Diff Section */}
          <ResumeDiff
            changes={currentChanges}
            revisedText={currentRevisedText}
            originalText={analysis?.pipeline?.step1_extraction?.raw_text_preview || ''}
            onSaveManualEdit={handleSaveManualEdit}
          />
        </div>
      )}
    </div>
  )
}
