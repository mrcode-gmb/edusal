import { useState, useEffect } from 'react';
import './App.css';

interface HealthResponse {
  status: string;
  service: string;
  database: string;
  pgvector: string;
  message: string;
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const response = await fetch(`${apiUrl}/api/health/`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data: HealthResponse = await response.json();
      const elapsed = Math.round(performance.now() - start);
      setHealth(data);
      setLatency(elapsed);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      setHealth(null);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to connect to backend');
      }
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const isHealthy = health && health.status === 'ok';

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="brand-badge">Edusal Platform</div>
        <h1 className="title">Edusal Full-Stack Starter</h1>
        <p className="subtitle">
          Django REST Framework backend + PostgreSQL with pgvector + Celery + React frontend
        </p>
      </header>

      {/* Main Connection Status Card */}
      <section className="status-card">
        <div className="status-header">
          <div className="status-title-row">
            <span className={`status-indicator ${loading ? 'loading' : isHealthy ? 'healthy' : 'unhealthy'}`} />
            <h2>System Health & Connectivity</h2>
          </div>
          <button
            type="button"
            className="refresh-button"
            onClick={checkHealth}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Refresh Status'}
          </button>
        </div>

        {loading && !health && !error && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Pinging Django API at <code>{apiUrl}/api/health/</code>...</p>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <strong>Connection Issue:</strong> {error}
              <p className="error-hint">
                Ensure Docker containers are running (<code>docker compose -f docker-compose.local.yml up -d</code>) on port 8001.
              </p>
            </div>
          </div>
        )}

        {health && (
          <div className="status-grid">
            <div className="metric-item">
              <span className="metric-label">API Status</span>
              <span className="metric-value status-tag-ok">
                ✓ {health.status.toUpperCase()}
              </span>
            </div>

            <div className="metric-item">
              <span className="metric-label">PostgreSQL Database</span>
              <span className={`metric-value ${health.database === 'ok' ? 'status-tag-ok' : 'status-tag-warn'}`}>
                {health.database === 'ok' ? '✓ Connected' : health.database}
              </span>
            </div>

            <div className="metric-item">
              <span className="metric-label">pgvector Extension</span>
              <span className="metric-value status-tag-ok">
                ✓ {health.pgvector}
              </span>
            </div>

            <div className="metric-item">
              <span className="metric-label">Roundtrip Latency</span>
              <span className="metric-value">
                {latency !== null ? `${latency} ms` : '—'}
              </span>
            </div>
          </div>
        )}

        <div className="status-footer">
          <span>Backend Target: <code>{apiUrl}</code></span>
          {lastChecked && <span>Last verified: {lastChecked}</span>}
        </div>
      </section>

      {/* Quick Access Links */}
      <section className="links-section">
        <h3 className="section-title">Quick Developer Links</h3>
        <div className="cards-grid">
          <a
            href={`${apiUrl}/api/docs/`}
            target="_blank"
            rel="noreferrer"
            className="link-card"
          >
            <div className="card-header">
              <span className="card-badge">Swagger / OpenAPI</span>
              <span className="card-arrow">↗</span>
            </div>
            <h4>Interactive API Docs</h4>
            <p>Explore all available endpoints via OpenAPI Swagger UI schema.</p>
          </a>

          <a
            href={`${apiUrl}/admin/`}
            target="_blank"
            rel="noreferrer"
            className="link-card"
          >
            <div className="card-header">
              <span className="card-badge">Django Admin</span>
              <span className="card-arrow">↗</span>
            </div>
            <h4>Administration Portal</h4>
            <p>Log in with your superuser account to manage models and users.</p>
          </a>

          <a
            href="http://localhost:8025"
            target="_blank"
            rel="noreferrer"
            className="link-card"
          >
            <div className="card-header">
              <span className="card-badge">Mailpit</span>
              <span className="card-arrow">↗</span>
            </div>
            <h4>Email Sandbox</h4>
            <p>Inspect outgoing transactional emails and verification tokens locally.</p>
          </a>

          <a
            href="http://localhost:5555"
            target="_blank"
            rel="noreferrer"
            className="link-card"
          >
            <div className="card-header">
              <span className="card-badge">Flower</span>
              <span className="card-arrow">↗</span>
            </div>
            <h4>Celery Task Dashboard</h4>
            <p>Monitor asynchronous worker tasks, queues, and background jobs.</p>
          </a>
        </div>
      </section>

      {/* Tech Stack Summary */}
      <section className="tech-stack-section">
        <h3 className="section-title">Architecture & Tech Stack</h3>
        <div className="tech-pills">
          <span className="tech-pill">Django 6.0</span>
          <span className="tech-pill">Django REST Framework</span>
          <span className="tech-pill">PostgreSQL 16</span>
          <span className="tech-pill">pgvector</span>
          <span className="tech-pill">Celery + Redis</span>
          <span className="tech-pill">React 19 + TypeScript</span>
          <span className="tech-pill">Vite</span>
          <span className="tech-pill">Docker Compose</span>
        </div>
      </section>
    </div>
  );
}
