# Edusal — Fullstack Starter Kit

A production-ready foundation for the **Edusal** platform featuring **Django REST Framework**, **PostgreSQL with pgvector**, **Celery + Redis**, and a **React (TypeScript + Vite)** frontend.

---

## 🏗️ Architecture Overview

```
edusal/
├── backend/                  # Django 6.0 + DRF + Celery + PostgreSQL (Dockerized)
│   ├── compose/              # Local & production Docker configurations
│   ├── config/               # Settings (base, local, production), URLs, routers
│   ├── edusal/
│   │   ├── core/             # Core app (pgvector migration & /api/health/)
│   │   └── users/            # Custom user model & authentication
│   ├── docker-compose.local.yml
│   └── pyproject.toml
│
├── frontend/                 # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx           # Real-time health check & architecture dashboard
│   │   ├── App.css
│   │   └── main.tsx
│   ├── .env.local            # VITE_API_URL=http://localhost:8001
│   └── package.json
│
├── project_starter.md        # Original setup blueprint & checkpoints
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### 1. Start the Backend Services (Docker Compose)

```bash
cd backend
docker compose -f docker-compose.local.yml up -d
```

> **Note:** The backend is configured on port **`8001`** on the host machine to avoid port collisions with any existing services on port 8000.

### 2. Start the Frontend Dev Server

```bash
cd frontend
npm install
npm run dev
```

Visit **`http://localhost:5173`** to see the live starter dashboard with real-time connectivity status.

---

## 🌐 Endpoints & Dashboards

| Service | URL | Description |
|---|---|---|
| **Frontend Dashboard** | [http://localhost:5173](http://localhost:5173) | React app with live API & DB status |
| **API Health Check** | [http://localhost:8001/api/health/](http://localhost:8001/api/health/) | JSON health status verifying PostgreSQL + pgvector |
| **Interactive API Docs** | [http://localhost:8001/api/docs/](http://localhost:8001/api/docs/) | OpenAPI / Swagger UI documentation |
| **Django Admin** | [http://localhost:8001/admin/](http://localhost:8001/admin/) | Django administration portal |
| **Mailpit (Email Sandbox)**| [http://localhost:8025](http://localhost:8025) | Local inbox for transactional emails |
| **Flower (Celery Monitor)** | [http://localhost:5555](http://localhost:5555) | Asynchronous task queue monitoring |

---

## 🔑 Default Superuser Account

An initial superuser account is pre-configured for local development:
- **Email:** `admin@edusal.com`
- **Password:** `admin123456`

To create additional superusers manually:
```bash
cd backend
docker compose -f docker-compose.local.yml exec django python manage.py createsuperuser
```

---

## 🗄️ Working with pgvector in Django

The PostgreSQL container runs `pgvector/pgvector:pg16` and the `vector` extension is activated via migration `edusal/core/migrations/0001_enable_pgvector.py`.

To define vector fields in your Django models:

```python
from django.db import models
from pgvector.django import VectorField

class DocumentEmbedding(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    embedding = VectorField(dimensions=1536)  # e.g. OpenAI ada-002 / text-embedding-3

    def __str__(self):
        return self.title
```

---

## 🛠️ Common Commands

### Backend

```bash
# Run migrations
docker compose -f docker-compose.local.yml exec django python manage.py migrate

# Make new migrations
docker compose -f docker-compose.local.yml exec django python manage.py makemigrations

# Open Django shell
docker compose -f docker-compose.local.yml exec django python manage.py shell

# View logs
docker compose -f docker-compose.local.yml logs -f django
```

### Frontend

```bash
# Start Vite development server
npm run dev

# Build production bundle
npm run build

# Preview build
npm run preview
```
