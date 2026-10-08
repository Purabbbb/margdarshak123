import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { analyzeResume } from '../utils/api.js'
import styles from './UploadPage.module.css'

const PIPELINE_STEPS = [
  { num: 1, label: 'Text Extraction', desc: 'PDFMiner or OCR extracts text from your resume' },
  { num: 2, label: 'NLP Preprocessing', desc: 'Tokenization, stopword removal, lemmatization' },
  { num: 3, label: 'Entity Parsing', desc: 'Regex + spaCy NER extracts name, email, phone' },
  { num: 4, label: 'Skill Extraction', desc: 'Exact word-boundary matching against the skills database' },
  { num: 5, label: 'Role Classification', desc: 'Cosine similarity ranks best-fit job roles' },
  { num: 6, label: 'Gap Analysis', desc: 'Set subtraction finds missing skills' },
  { num: 7, label: 'Course Mapping', desc: 'Missing skills mapped to free learning resources' },
  { num: 8, label: 'Job Matching', desc: 'Real-time listings fetched via Adzuna API' },
]

const PROCESSING_MESSAGES = [
  'Reading your resume...',
  'Cleaning and tokenizing text...',
  'Extracting contact information...',
  'Mapping skills from 500+ database...',
  'Classifying best-fit job roles...',
  'Analyzing skill gaps...',
  'Finding relevant courses...',
  'Fetching live job listings...',
  'Assembling your report...',
]

export default function UploadPage({ onAnalysisComplete, compact = false }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [error, setError] = useState(null)

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null)
    if (rejectedFiles.length > 0) {
      setError('Please upload a PDF or image file (JPG, JPEG, PNG, or WEBP).')
      return
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024
  })

  async function handleAnalyze() {
    if (!file) return
    setLoading(true)
    setError(null)
    setProcessingStep(0)

    // Step message cycling
    const interval = setInterval(() => {
      setProcessingStep(prev => {
        if (prev < PROCESSING_MESSAGES.length - 1) return prev + 1
        return prev
      })
    }, 1800)

    try {
      const data = await analyzeResume(file)
      clearInterval(interval)
      if (typeof onAnalysisComplete === 'function') {
        onAnalysisComplete(data, file)
      }
    } catch (err) {
      clearInterval(interval)
      const msg = err.response?.data?.detail || err.message || 'Analysis failed. Is the backend running?'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className={compact ? styles.compactPage : styles.page}>
      {!compact && (
        <header className={styles.header}>
          <div className={styles.logo}>
            <img src="/margdarshak_logo.png" alt="MargDarshak" className={styles.logoImg} />
          </div>
          <span className={styles.headerTag}>AI Career Guidance</span>
        </header>
      )}

      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroLabel}>Resume Analysis Platform</div>
          <h1 className={styles.heroTitle}>
            Know exactly where<br />
            <span className={styles.heroAccent}>your career stands.</span>
          </h1>
          <p className={styles.heroSub}>
            Upload your resume. Get your skills mapped, job roles ranked,
            gaps identified, and real job listings — in under 30 seconds.
          </p>
        </section>

        {/* Upload area */}
        <section className={styles.uploadSection}>
          <div
            {...getRootProps()}
            className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''} ${file ? styles.dropzoneHasFile : ''}`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className={styles.filePreview}>
                <div className={styles.fileIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</span>
                </div>
                <button
                  className={styles.removeFile}
                  onClick={e => { e.stopPropagation(); setFile(null) }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className={styles.dropzoneContent}>
                <div className={styles.uploadIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="16 16 12 12 8 16"/>
                    <line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                </div>
                <p className={styles.dropzoneText}>
                  {isDragActive ? 'Drop your resume here' : 'Drag and drop your resume'}
                </p>
                <p className={styles.dropzoneHint}>or click to browse — PDF, JPG, JPEG, PNG, or WEBP, max 5MB</p>
              </div>
            )}
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button
            className={styles.analyzeBtn}
            onClick={handleAnalyze}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <span className={styles.btnSpinner} />
                {PROCESSING_MESSAGES[processingStep]}
              </>
            ) : (
              'Analyze Resume'
            )}
          </button>

          {loading && (
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${((processingStep + 1) / PROCESSING_MESSAGES.length) * 100}%` }}
              />
            </div>
          )}
        </section>

        {/* Pipeline Steps */}
        <section className={styles.pipeline}>
          <h2 className={styles.pipelineTitle}>How the analysis works</h2>
          <div className={styles.pipelineGrid}>
            {PIPELINE_STEPS.map((step) => (
              <div key={step.num} className={styles.pipelineCard}>
                <span className={styles.stepNum}>{step.num}</span>
                <div>
                  <div className={styles.stepLabel}>{step.label}</div>
                  <div className={styles.stepDesc}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {!compact && (
        <footer className={styles.footer}>
          <span>MargDarshak</span>
          <span>Resume analyzed locally — your data is not stored.</span>
        </footer>
      )}
    </div>
  )
}
