import { useState } from 'react'
import styles from './PipelinePanel.module.css'

const STEPS = [
  {
    key: 'step1_extraction',
    num: 1,
    title: 'Text Extraction',
    library: 'pdfminer.six',
    description: 'Raw text extracted from PDF bytes using LAParams to control character grouping and reading order.',
  },
  {
    key: 'step2_preprocessing',
    num: 2,
    title: 'NLP Preprocessing',
    library: 'NLTK',
    description: 'Seven-stage pipeline: lowercase → unicode cleanup → punctuation removal → whitespace normalization → tokenization → stopword removal → lemmatization.',
  },
  {
    key: 'step3_entities',
    num: 3,
    title: 'Entity Extraction',
    library: 'Regex + spaCy NER',
    description: 'Regex patterns extract structured fields (email, phone, URLs). spaCy PERSON and GPE entities detect name and location.',
  },
  {
    key: 'step4_skills',
    num: 4,
    title: 'Skill Extraction',
    library: 'Regex (exact match)',
    description: 'Exact substring matching with word boundary enforcement against 500+ skills across 15 categories. Handles multi-word skills (e.g. machine learning) and single-word skills alike. Case-insensitive.',
  },
  {
    key: 'step5_job_roles',
    num: 5,
    title: 'Job Role Classification',
    library: 'scikit-learn (cosine similarity)',
    description: 'Skills encoded as binary vectors. Cosine similarity computed between resume vector and each job role vector (required skills weighted 2x). Top 4 roles returned.',
  },
  {
    key: 'step6_gaps',
    num: 6,
    title: 'Skill Gap Analysis',
    library: 'Set operations',
    description: 'Simple set subtraction: required_skills - resume_skills. Returns missing_required and missing_preferred per role with a readiness percentage.',
  },
  {
    key: 'step7_courses',
    num: 7,
    title: 'Course Recommendation',
    library: 'Dictionary lookup',
    description: 'Missing skills mapped to curated free courses. Partial string matching for variants. Coursera search URL generated as fallback.',
  },
  {
    key: 'step8_jobs',
    num: 8,
    title: 'Job Matching',
    library: 'Adzuna REST API',
    description: 'HTTP GET to Adzuna API with best-matched role title and extracted location. Returns live job postings sorted by relevance.',
  },
]

const PREPROCESSING_STAGE_LABELS = {
  '1_lowercase': 'Stage 1: Lowercase',
  '2_unicode_cleanup': 'Stage 2: Unicode cleanup',
  '3_punctuation_removed': 'Stage 3: Punctuation removed',
  '4_whitespace_normalized': 'Stage 4: Whitespace normalized',
  '5_tokens': 'Stage 5: Tokenized',
  '6_stopwords_removed': 'Stage 6: Stopwords removed',
  '7_lemmatized': 'Stage 7: Lemmatized',
}

export default function PipelinePanel({ pipeline }) {
  const [openStep, setOpenStep] = useState(1)

  return (
    <div className={styles.container + ' stagger'}>
      <div className={styles.intro}>
        This view shows the exact output of each pipeline stage — the same data your code processes.
        Use this to walk through the NLP pipeline step by step.
      </div>

      {STEPS.map(step => (
        <div
          key={step.key}
          className={`${styles.stepCard} ${openStep === step.num ? styles.stepCardOpen : ''}`}
        >
          <button
            className={styles.stepHeader}
            onClick={() => setOpenStep(openStep === step.num ? null : step.num)}
          >
            <div className={styles.stepLeft}>
              <span className={styles.stepNum}>{step.num}</span>
              <div>
                <span className={styles.stepTitle}>{step.title}</span>
                <span className={styles.stepLib}>{step.library}</span>
              </div>
            </div>
            <span className={styles.chevron} style={{ transform: openStep === step.num ? 'rotate(180deg)' : 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </span>
          </button>

          {openStep === step.num && (
            <div className={styles.stepBody}>
              <p className={styles.stepDesc}>{step.description}</p>

              <div className={styles.outputBox}>
                <StepOutput stepKey={step.key} pipeline={pipeline} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function StepOutput({ stepKey, pipeline }) {
  const data = pipeline?.[stepKey]
  if (!data) return <span className={styles.noData}>No data available</span>

  if (stepKey === 'step1_extraction') {
    return (
      <div className={styles.outputContent}>
        <DataRow label="Characters extracted" value={data.char_count?.toLocaleString()} />
        <DataRow label="Words extracted" value={data.word_count?.toLocaleString()} />
        <div className={styles.textBlock}>
          <span className={styles.textLabel}>Raw text preview</span>
          <pre className={styles.preBlock}>{data.raw_text_preview}</pre>
        </div>
      </div>
    )
  }

  if (stepKey === 'step2_preprocessing') {
    const stages = data.stages || {}
    return (
      <div className={styles.outputContent}>
        <DataRow label="Final token count" value={data.token_count} />
        {Object.entries(stages).map(([key, value]) => (
          <div key={key} className={styles.stageBlock}>
            <span className={styles.textLabel}>{PREPROCESSING_STAGE_LABELS[key] || key}</span>
            <pre className={styles.preBlock}>
              {Array.isArray(value)
                ? `[${value.slice(0, 30).map(v => `"${v}"`).join(', ')}${value.length > 30 ? '...' : ''}]`
                : value}
            </pre>
          </div>
        ))}
      </div>
    )
  }

  if (stepKey === 'step3_entities') {
    return (
      <div className={styles.outputContent}>
        {Object.entries(data).filter(([k]) => k !== '_methods').map(([key, value]) => (
          value && <DataRow key={key} label={key} value={String(value)} method={data._methods?.[key]} />
        ))}
      </div>
    )
  }

  if (stepKey === 'step4_skills') {
    const details = data.match_details || {}
    return (
      <div className={styles.outputContent}>
        <DataRow label="Total skills matched" value={data.skill_count} />
        <div className={styles.textLabel} style={{ marginBottom: 8 }}>Match details (first 20)</div>
        {Object.entries(details).slice(0, 20).map(([skill, info]) => (
          <div key={skill} className={styles.skillRow}>
            <span className={styles.skillRowName}>{skill}</span>
            <span className={`${styles.methodPill} ${info.method === 'exact' ? styles.pillExact : styles.pillFuzzy}`}>
              {info.method}
            </span>
            <span className={styles.skillRowCat}>{info.category}</span>
          </div>
        ))}
      </div>
    )
  }

  if (stepKey === 'step5_job_roles') {
    return (
      <div className={styles.outputContent}>
        <DataRow label="Method" value={data.method} />
        <DataRow label="Skill universe size" value={data.skill_universe_size} />
        {(data.top_roles || []).map(role => (
          <div key={role.role} className={styles.roleRow}>
            <span className={styles.skillRowName}>{role.role}</span>
            <span className={styles.scoreChip}>{role.score}%</span>
          </div>
        ))}
      </div>
    )
  }

  if (stepKey === 'step6_gaps') {
    return (
      <div className={styles.outputContent}>
        <DataRow label="Method" value={data.method} />
        {Object.entries(data.gaps || {}).map(([role, gap]) => (
          <div key={role} className={styles.stageBlock}>
            <span className={styles.textLabel}>{role}</span>
            <pre className={styles.preBlock}>
              {`readiness: ${gap.readiness_score}%\nmissing_required: [${gap.missing_required.join(', ')}]\nmissing_preferred: [${gap.missing_preferred.slice(0,4).join(', ')}${gap.missing_preferred.length > 4 ? '...' : ''}]`}
            </pre>
          </div>
        ))}
      </div>
    )
  }

  if (stepKey === 'step7_courses') {
    return (
      <div className={styles.outputContent}>
        <DataRow label="Priority skills to learn" value={(data.priority_skills || []).join(', ')} />
        <DataRow label="Total unique skills to learn" value={data.total_unique_skills_to_learn} />
      </div>
    )
  }

  if (stepKey === 'step8_jobs') {
    return (
      <div className={styles.outputContent}>
        <DataRow label="API status" value={data.status} />
        <DataRow label="Jobs returned" value={data.jobs?.length} />
        <DataRow label="Query role" value={data.query?.role} />
        <DataRow label="Query location" value={data.query?.location} />
      </div>
    )
  }

  return <pre className={styles.preBlock}>{JSON.stringify(data, null, 2).slice(0, 600)}</pre>
}

function DataRow({ label, value, method }) {
  if (!value) return null
  return (
    <div className={styles.dataRow}>
      <span className={styles.dataLabel}>{label}</span>
      <span className={styles.dataValue}>{value}</span>
      {method && <span className={styles.dataMethod}>{method}</span>}
    </div>
  )
}
