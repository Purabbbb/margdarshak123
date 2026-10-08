import { useState, useMemo } from 'react'
import { fetchJobs } from '../utils/api.js'
import styles from './JobsPanel.module.css'

export default function JobsPanel({ jobs: initialJobs, analysis }) {
  const [jobs, setJobs] = useState(initialJobs)
  const [searchRole, setSearchRole] = useState(analysis?.job_roles?.best_match?.role || '')
  const [searchLocation, setSearchLocation] = useState(analysis?.entities?.location || '')
  const [sortBy, setSortBy] = useState('relevance')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [animating, setAnimating] = useState(false)

  const topRoles = analysis?.job_roles?.top_roles || []
  const rawList = jobs?.jobs || []

  // Client-side sort — no API call needed
  const sortedList = useMemo(() => {
    if (sortBy === 'date') {
      return [...rawList].sort((a, b) => {
        const da = a.created ? new Date(a.created) : new Date(0)
        const db = b.created ? new Date(b.created) : new Date(0)
        return db - da  // newest first
      })
    }
    return rawList  // relevance = original API order
  }, [rawList, sortBy])

  function handleSortChange(value) {
    if (value === sortBy) return
    setAnimating(true)
    setTimeout(() => {
      setSortBy(value)
      setAnimating(false)
    }, 180)
  }

  async function handleSearch() {
    if (!searchRole) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchJobs(searchRole, searchLocation)
      setJobs(data)
      setSortBy('relevance')  // reset sort on new search
    } catch (err) {
      setError('Failed to fetch jobs. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container + ' stagger'}>

      {/* Search */}
      <div className={styles.searchCard}>
        <div className={styles.searchHeader}>
          <h3 className={styles.searchTitle}>Search live listings</h3>

          {/* Sort toggle — top right of card */}
          {rawList.length > 0 && (
            <div className={styles.sortToggle}>
              <span className={styles.sortLabel}>Sort by</span>
              <div className={styles.segmented}>
                {[
                  { value: 'relevance', label: 'Relevance' },
                  { value: 'date',      label: 'Date Posted' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    className={`${styles.segBtn} ${sortBy === opt.value ? styles.segBtnActive : ''}`}
                    onClick={() => handleSortChange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.searchRow}>
          <div className={styles.searchField}>
            <label className={styles.fieldLabel}>Job Role</label>
            <input
              className={styles.input}
              value={searchRole}
              onChange={e => setSearchRole(e.target.value)}
              placeholder="e.g. Data Scientist"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <div className={styles.quickRoles}>
              {topRoles.slice(0, 3).map(role => (
                <button
                  key={role.role}
                  className={`${styles.quickBtn} ${searchRole === role.role ? styles.quickBtnActive : ''}`}
                  onClick={() => setSearchRole(role.role)}
                >
                  {role.role}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.searchField}>
            <label className={styles.fieldLabel}>Location</label>
            <input
              className={styles.input}
              value={searchLocation}
              onChange={e => setSearchLocation(e.target.value)}
              placeholder="e.g. Bangalore, Mumbai"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <button
            className={styles.searchBtn}
            onClick={handleSearch}
            disabled={loading || !searchRole}
          >
            {loading ? <span className="spinner" /> : 'Search'}
          </button>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* Status */}
      {jobs && (
        <div className={styles.statusBar}>
          {jobs.status === 'mock' ? (
            <span className={styles.mockNote}>
              Add Adzuna API keys to .env to see real listings.
            </span>
          ) : jobs.status === 'success' ? (
            <span className={styles.resultCount}>
              Showing <strong>{sortedList.length}</strong> of{' '}
              <strong>{jobs.total_found}</strong> listings for{' '}
              <strong>{jobs.query?.role}</strong> in{' '}
              <strong>{jobs.query?.location}</strong>
              {sortBy === 'date' ? ' · sorted by date' : ' · sorted by relevance'}
            </span>
          ) : null}
        </div>
      )}

      {/* Listings */}
      {sortedList.length === 0 ? (
        <div className={styles.empty}>No listings found. Try a different role or location.</div>
      ) : (
        <div className={`${styles.jobList} ${animating ? styles.jobListFading : styles.jobListVisible}`}>
          {sortedList.map((job, i) => (
            <a
              key={`${job.url}-${i}`}
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.jobCard}
              style={{ animationDelay: animating ? '0ms' : `${i * 18}ms` }}
            >
              <div className={styles.jobHeader}>
                <div>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <span className={styles.jobCompany}>{job.company}</span>
                </div>
                <div className={styles.jobMeta}>
                  {job.salary && job.salary !== 'Not disclosed' && (
                    <span className={styles.jobSalary}>{job.salary}</span>
                  )}
                  <span className={styles.jobLocation}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {job.location}
                  </span>
                </div>
              </div>

              {job.description && (
                <p className={styles.jobDesc}>{job.description}</p>
              )}

              <div className={styles.jobFooter}>
                <span className={styles.jobDate}>{job.created}</span>
                {job.contract && (
                  <span className={styles.contractTag}>{job.contract}</span>
                )}
                <span className={styles.applyLink}>
                  View & Apply
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
