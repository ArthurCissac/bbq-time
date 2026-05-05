# 🔥 BBQ Time

App perso pour gérer les BBQ entre potes. Ouvre l'URL → tu es admin (crée/édite tous les BBQ). Tu génères un QR code → tes invités scannent → ils choisissent leurs items. Dashboard temps réel.

**Pas d'auth.** L'admin est public (usage famille/potes). Quiconque connaît l'URL peut voir/éditer tous les BBQ. Le QR pointe vers une page invité dédiée (`/bbq/[code]`).

**Stack** : Next.js 14 · Neon (Postgres serverless) · Drizzle ORM · Tailwind + shadcn/ui · SSE realtime.

## Setup local

### 1. Crée un projet Neon (gratuit)

1. https://console.neon.tech → **Create project** (region eu-central-1).
2. Copie la **Pooled connection string** → c'est ton `DATABASE_URL`.
3. Optionnel : crée une **branche `dev`** dans Neon pour isoler la prod.

### 2. (Optionnel) Upstash Redis pour rate limit

1. https://console.upstash.com → Redis → Create Database (free tier).
2. Copie `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.

### 3. .env.local

```bash
cp .env.example .env.local
# Remplir DATABASE_URL avec la string Neon
```

### 4. Migration DB

```bash
npx drizzle-kit push     # pousse le schéma sur Neon
```

### 5. Run

```bash
npm run dev
# → http://localhost:3040
```

## Flow

- **Toi (et n'importe qui sur l'URL)** : `/` → vois tous les BBQ + crée un nouveau → ajoute items → onglet QR → imprime/partage.
- **Invité** : scanne QR → entre prénom → +/- items, choisit cuisson → save auto.
- **Dashboard live** : se met à jour toutes les 2s via SSE.

## Routes

- `/` — Dashboard admin (création + liste)
- `/event/[id]/items` — CRUD items du BBQ
- `/event/[id]/qr` — QR code à imprimer
- `/event/[id]/dashboard` — Live des choix invités
- `/bbq/[code]` — Page invité (saisie prénom)
- `/bbq/[code]/select` — Page invité (sélection items)

## Deploy Vercel + Neon

1. Push sur GitHub.
2. Vercel → Import → ajoute l'intégration **Neon** (`DATABASE_URL` auto-injectée).
3. Vars Vercel optionnelles : `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
4. `npx drizzle-kit push` une fois avec la prod URL.

## Sécurité

- Inputs validées Zod
- Token guest = cookie httpOnly+secure+sameSite=lax
- Headers CSP/HSTS/X-Frame-Options/nosniff/Referrer-Policy/Permissions-Policy
- Rate limit Upstash optionnel
- ⚠️ **Pas d'auth admin** — pour usage privé entre potes uniquement, ne pas exposer publiquement sans rajouter une auth basique
