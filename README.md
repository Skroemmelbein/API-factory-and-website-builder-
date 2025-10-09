# Website Builder & API Factory

A production-grade platform to generate REST APIs and build beautiful Liquid Glass websites with a visual editor, premium template gallery, and one‑click exports/deployments.

## 1) Overview
- Generate APIs from databases, OpenAPI specs, or config files
- Build responsive websites using a drag‑and‑drop editor
- 50+ Liquid Glass templates (auto-generated) and theme system
- Persist projects/designs via Prisma (Supabase/Postgres)
- Serverless friendly (Vercel), React + TypeScript front-end

## 2) Architecture
- Frontend: React + TypeScript + MUI
- Backend: Node.js (Express), serverless‑compatible
- DB: Prisma ORM (Supabase/PostgreSQL)
- Generators: API Generator + Website Builder
- Python Agent (optional): AI engineering assistant via Flask API

### Directory Highlights
- `src/client/` React app (pages, contexts)
- `src/server/` Express app (routes: auth, projects, generate, builder)
- `src/api-factory/` API code generation logic
- `src/website-builder/` visual builder, templates, themes
- `prisma/` Prisma schema for Supabase/Postgres

## 3) Quick Start
```bash
# 1) Install
npm install

# 2) Configure environment
cp .env.example .env
# Set DATABASE_URL to your Supabase connection string

# 3) Generate DB schema
npx prisma generate
npx prisma db push

# 4) Run dev (server + client)
npm run dev
```
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- Docs: http://localhost:3000/api-docs

## 4) Features
- API Factory: database introspection/OpenAPI/config -> CRUD routes, models, middleware, server
- Website Builder: components, themes, templates, export (HTML/CSS/static), Liquid Glass utilities
- Auth: JWT with DB users (fallback in‑memory dev path)
- Projects: create/update/delete; persists to DB; lists in UI
- Designs: template‑based creation and preview; persisted to DB when available

## 5) Liquid Glass Templates
- 50 auto‑generated templates with glassmorphism styling
- Global utilities: blur, frosted panels, soft gradients
- Theming tokens for colors, fonts, spacing

## 6) API Endpoints (Selected)
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/projects`
- `GET /api/builder/templates` (returns id/name/description/theme)
- `GET /api/builder/preview/:templateId` (HTML/CSS preview)
- `POST /api/builder/create` (create project+design from template)

## 7) Deployment (Vercel)
- `vercel.json` set for serverless API + static client build
- Commands:
```bash
vercel login
vercel link
vercel env add DATABASE_URL production
vercel --prod
```

## 8) Fortune‑10‑grade Enhancements (Roadmap)
1. Secure SSO/SAML + SCIM: Okta/AzureAD for enterprise identity
2. RBAC & Org hierarchy: roles, teams, project‑level permissions
3. Compliance & policy: SOC2 guardrails, DLP scanning for exports/templates
4. Audit trails: append‑only, tamper‑evident logs for actions/changes
5. Multi‑region data residency: shard designs/projects per region
6. Encryption at rest + field‑level encryption for secrets
7. Configurable egress controls: allowlists for exports/deploys
8. Templates attestation: signed artifacts and provenance for marketplace items
9. Observability: OpenTelemetry tracing for generation/build/preview flows
10. SLOs & autoscaling: queue + workers with autoscale; hard backoff policies
11. Blue/green template releases: staged rollouts and instant rollback
12. Enterprise billing: seat + metered usage, invoices, cost centers
13. Content governance: approval workflows, content checks, brand guardrails
14. Data connectors: Snowflake/BigQuery/GraphQL sources; schema‑aware components
15. AI guardrails: PII detection, prompt safety, human‑in‑the‑loop approvals
16. Secrets vault: native integration with AWS Secrets Manager/GCP Secret Manager
17. Private marketplace: org‑scoped templates/components with policy controls
18. Feature flags: per‑org & per‑project dynamic capability toggles
19. Offline export signing: secure bundle signing + integrity checks
20. Disaster recovery: automated backups, cross‑region replication, chaos tests

## 9) UI Ideas to Maximize Value
- Template gallery with filters/tags, live previews, favorites
- Data binding pane: connect components to API endpoints and schemas
- Design tokens editor: theme/colors/typography/spacing with instant preview
- Versioning & review: diffs, comments, approvals per design
- AI co‑pilot: generate sections from prompts; accessibility and SEO checks
- Deploy wizard: one‑click deploy to Vercel/Netlify/AWS; env setup assistant
- Analytics: Lighthouse‑like audits, runtime perf dashboards
- Marketplace: install/purchase premium templates/components with reviews

## 10) Contributing & License
- Contributions welcome: issues, PRs, templates/components
- MIT License

---

See MASTER_README.md for deep documentation and enterprise roadmap.

### Appendix: Local Admin Tips
- Reset dev users by clearing DB rows in `User`, `Project`, `Design`
- Update Liquid Glass utilities in `src/website-builder/WebsiteBuilder.js`
- Add more templates by seeding in `loadDefaultTemplates()`
