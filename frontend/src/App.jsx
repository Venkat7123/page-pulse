import { useState } from 'react';
import './index.css';

function App() {
  const [url, setUrl] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      // Assuming backend runs on 3001
      const response = await fetch('http://localhost:3001/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!result.success || !response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch the report');
      }

      setReport(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Page Pulse</h1>
        <p>Instant URL Auditing Tool</p>
      </header>

      <div className="glass-card">
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="search-input"
            required
            disabled={loading}
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? <span className="loader"></span> : 'Audit'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {report && (
          <div className="report-container">
            <h3>Audit Results</h3>
            <div className="report-grid">
              <div className="report-item">
                <div className="report-label">HTTP Status</div>
                <div className={`report-value ${report.status >= 200 && report.status < 300 ? 'status-good' : 'status-error'}`}>
                  {report.status}
                </div>
              </div>
              <div className="report-item">
                <div className="report-label">Response Time</div>
                <div className="report-value">{report.responseTime} ms</div>
              </div>
              <div className="report-item">
                <div className="report-label">Page Title</div>
                <div className="report-value">{report.title || 'N/A'}</div>
              </div>
              <div className="report-item">
                <div className="report-label">H1 Count</div>
                <div className="report-value">{report.h1Count}</div>
              </div>
              <div className="report-item">
                <div className="report-label">Word Count (approx)</div>
                <div className="report-value">{report.wordCount}</div>
              </div>
              <div className="report-item">
                <div className="report-label">Missing Alt Images</div>
                <div className={`report-value ${report.imagesMissingAlt > 0 ? 'status-error' : 'status-good'}`}>
                  {report.imagesMissingAlt}
                </div>
              </div>
            </div>
            
            <div className="report-grid" style={{ marginTop: '1.5rem', gridTemplateColumns: '1fr' }}>
               <div className="report-item">
                <div className="report-label">Meta Description</div>
                <div className="report-value" style={{ fontSize: '1rem', fontWeight: 400 }}>
                  {report.metaDescription || 'No description found'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <footer style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#888', paddingBottom: '1rem' }}>
        Built for <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Digital Heroes Training Task</a>
      </footer>
    </div>
  );
}

export default App;
