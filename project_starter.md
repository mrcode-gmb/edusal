# Project Setup Guide — Django (cookiecutter-django) + React (Vite)

Goal: get a working "hello world" — Django API + Postgres/pgvector + React frontend talking to each other — before handing anything to Antigravity CLI.

---

## Prerequisites

Install these first:

- **Python 3.11+**
- **Node 20+** and npm
- **Docker Desktop** (or Docker Engine + Compose on Linux)
- **cookiecutter**: `pip install cookiecutter` (or `pipx install cookiecutter` if you use pipx)
- **Git**

Verify:
```bash
python3 --version
node --version
docker --version
docker compose version
cookiecutter --version
```

---

## Step 1 — Generate the backend with cookiecutter-django

Run this from the parent folder that will hold your whole project (e.g. `~/projects/`):

```bash
cookiecutter https://github.com/cookiecutter/cookiecutter-django
```

You'll be prompted for a series of options. Key ones to answer carefully (exact prompt wording may vary slightly by current template version — read each one, but these are the choices that matter):

| Prompt | Recommended answer | Why |
|---|---|---|
| `project_name` | e.g. `AcroCompete` (your project name) | — |
| `project_slug` | leave default (auto-generated) | becomes your Python package name |
| `use_docker` | `y` | you want Docker Compose managing Postgres/Redis/Celery locally |
| `postgresql_version` | latest available (16 or 17) | note this — you'll match it when adding pgvector |
| `use_celery` | `y` | needed later for the document-ingestion pipeline |
| `use_drf` (Django REST Framework) | `y` if offered | if not offered, you'll add it manually in Step 4 |
| `frontend_pipeline` | `None` | you're using a separate React app, not Django's bundled frontend tooling |
| `use_async` | `n` (unless you already know you want ASGI) | keep it simple for the MVP |
| `cloud_provider` | `None` for now | configure real hosting later |
| `mail_service` | your choice, or leave default | not urgent for local dev |
| `use_sentry` | `n` for now | add later once you have something to monitor |

This creates a folder — rename/move it to `backend/` inside your project root:

```bash
mv <project_slug> backend
cd backend
```

---

## Step 2 — First boot (verify "hello world" on the backend)

```bash
docker compose -f docker-compose.local.yml build
docker compose -f docker-compose.local.yml up -d
docker compose -f docker-compose.local.yml exec django python manage.py migrate
docker compose -f docker-compose.local.yml exec django python manage.py createsuperuser
```

Now visit `http://localhost:8000/` — you should see the cookiecutter-django welcome page, and `http://localhost:8000/admin/` should let you log in with the superuser you just created.

**This is checkpoint 1: Django + Postgres + Docker are working end to end.** Don't move on until this is clean.

---

## Step 3 — Add pgvector to Postgres

cookiecutter-django's default Postgres image doesn't include the `pgvector` extension. Swap the image in `docker-compose.local.yml` (and `docker-compose.production.yml` later) for the `pgvector/pgvector` image, matching the Postgres major version you chose in Step 1:

```yaml
# in docker-compose.local.yml, under the postgres service:
postgres:
  image: pgvector/pgvector:pg16   # match your chosen version, e.g. pg16 or pg17
```

Rebuild and restart:
```bash
docker compose -f docker-compose.local.yml up -d --build postgres
```

Enable the extension via a Django migration (don't do this by hand in psql — you want it version-controlled):

```bash
docker compose -f docker-compose.local.yml exec django python manage.py startapp core
```
Move `core` into your apps folder per the project's convention (cookiecutter-django keeps first-party apps under `<project_slug>/`), then add a migration:

```python
# core/migrations/0001_enable_pgvector.py
from django.contrib.postgres.operations import CreateExtension
from django.db import migrations

class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        CreateExtension("vector"),
    ]
```

Run it:
```bash
docker compose -f docker-compose.local.yml exec django python manage.py migrate core
```

**Checkpoint 2:** confirm the extension is active —
```bash
docker compose -f docker-compose.local.yml exec postgres psql -U <db_user> -d <db_name> -c "\dx"
```
You should see `vector` listed.

---

## Step 4 — Add Django REST Framework (if not already included)

```bash
docker compose -f docker-compose.local.yml exec django pip install djangorestframework django-cors-headers
```
Add both to `requirements/base.txt` (so it's rebuilt properly, not just installed in the running container), then in `config/settings/base.py`:

```python
THIRD_PARTY_APPS = [
    # ...existing entries...
    "rest_framework",
    "corsheaders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    # ...rest of existing middleware, keep CorsMiddleware near the top...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite's default dev port
]
```

Add a trivial health-check endpoint to confirm the API layer works — in `core/views.py`:
```python
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def health_check(request):
    return Response({"status": "ok"})
```
Wire it into your URLs (`config/urls.py` or `core/urls.py` depending on your routing setup) at `/api/health/`.

Restart and confirm `http://localhost:8000/api/health/` returns `{"status": "ok"}`.

---

## Step 5 — Scaffold the frontend with Vite

From your project root (sibling to `backend/`):

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

Add an env file for the API base URL:
```bash
echo "VITE_API_URL=http://localhost:8000" > .env.local
```

Replace the default `src/App.tsx` with a minimal fetch against your health endpoint:

```tsx
import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState<string>("checking...");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/health/`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("backend unreachable"));
  }, []);

  return (
    <div>
      <h1>Project Hello World</h1>
      <p>Backend status: {status}</p>
    </div>
  );
}

export default App;
```

Run it:
```bash
npm run dev
```

Visit `http://localhost:5173` — it should show **"Backend status: ok"**.

**Checkpoint 3 (full hello world): Django + Postgres + pgvector + DRF + React are all confirmed working together.** This is the point where it's safe to bring in Antigravity CLI.

---

## Step 6 — Final project structure and version control

You should now have:

```
your-project/
├── backend/          # cookiecutter-django output
│   ├── config/
│   ├── core/          # your new app with the pgvector migration + health check
│   ├── docker-compose.local.yml
│   └── ...
├── frontend/          # Vite React app
│   ├── src/
│   ├── .env.local
│   └── ...
└── README.md
```

Initialize git at the **project root** (not inside `backend/` or `frontend/` separately) so Antigravity CLI, once pointed at this root, has visibility across both:

```bash
cd your-project
git init
echo "backend/.env
frontend/.env.local
**/node_modules/
**/__pycache__/" > .gitignore
git add .
git commit -m "chore: initial hello-world scaffold (Django + pgvector + DRF + React)"
```


