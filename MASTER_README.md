# MASTER README — Website Builder & API Factory

This master README complements the root README with deep, production‑grade documentation for engineering, product, and operations teams. It provides an end‑to‑end view of capabilities, architecture, extensibility, security, operations, and an enterprise roadmap.

---

## 1. Product Overview
- Visual Website Builder with Liquid Glass design system, components, themes, and 50+ ready templates
- API Factory that scaffolds production Express APIs from DB/OpenAPI/config inputs
- Fullstack workflows that persist Users, Projects, and Designs via Prisma (PostgreSQL/Supabase)
- Serverless‑ready (Vercel), modern frontend (React + TS), and secure backend (Express + Helmet + Rate limiting)

Key outcomes:
- Minimize time‑to‑first‑value for app/website projects
- Reduce boilerplate through generation while allowing customization
- Enable teams to standardize on templates and themes with governance

---

## 2. Architecture & Components
- Frontend: React + TypeScript + MUI; routes in `src/client/src/pages`
- Backend: Node + Express; routes in `src/server/routes`; app in `src/server/index.js`
- Builder: `src/website-builder/WebsiteBuilder.js` (components, themes, templates, exports)
- API Factory: `src/api-factory/generators/ApiGenerator.js` (routes/models/server generation)
- CLI: `src/cli/api-generator.js`
- DB: Prisma schema in `prisma/schema.prisma` (User, Project, Design, Subscription)
- Infra: `vercel.json` for serverless deploy of API/static client

Data model:
- User: id, email, name, passwordHash, plan
- Project: id, userId, name, type, status, description, config
- Design: id, projectId, template, theme, components, customizations

---

## 3. Local Development
Prereqs: Node 18+, npm 8+, a Supabase/Postgres URL for local or hosted DB

Setup:
```bash
cp .env.example .env
# set DATABASE_URL=postgresql://... from Supabase project
npm install
npx prisma generate
npx prisma db push
npm run dev
```
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api-docs
- Health: http://localhost:3000/health

---

## 4. Security & Compliance Baseline
- Transport security: recommend HTTPS/TLS termination at edge
- App hardening: Helmet, CORS, rate limiting, input validation (Joi/express‑validator)
- AuthN: JWT (short TTL recommended in prod), optional OAuth2/SSO roadmap
- Secret management: set via env; consider cloud secret stores in prod
- Logging: morgan; recommend centralizing logs with retention policies

---

## 5. Liquid Glass Design System
- Theme tokens: colors, fonts, spacing with CSS variables
- Utilities: `.glass` frosted/backdrop‑blur, soft gradient backgrounds
- Responsive defaults for header/hero/card components
- 50 generated templates (ids: `liquid-glass-01` … `-50`), plus baseline templates

Customization:
- Extend `loadDefaultComponents()` and `loadDefaultThemes()`
- Seed templates in `loadDefaultTemplates()` programmatically

---

## 6. Builder Workflows
- List templates: `GET /api/builder/templates`
- Preview template: `GET /api/builder/preview/:templateId` → HTML/CSS payload
- Create from template: `POST /api/builder/create` (creates Project if absent, persists Design)
- Export website: `POST /api/builder/export/:projectId` (formats: html, static; react/vue placeholders)

UI flow:
- Choose template → Preview → Create Project + Design → Export/Deploy

---

## 7. API Factory Workflows
- From DB: introspection (Prisma) → generate routes/models/middleware/server
- From OpenAPI: parse schemas → map types → generate code
- From config: validate models → generate code
- Outputs include `server.js`, `routes/*`, `models/*`, middleware, package.json, README

CLI examples:
```bash
node src/cli/api-generator.js from-database --database "postgresql://user:pass@host:5432/db" --output ./generated-api --name acme-api
node src/cli/api-generator.js from-openapi --file ./openapi.json --output ./generated-api --name acme-api
```

---

## 8. Extension & Plugin Model
- Components: add JS modules under `src/website-builder/components`
- Themes: add under `src/website-builder/themes`
- Templates: add under `src/website-builder/templates` or seed defaults programmatically
- API Factory: new generators in `src/api-factory/generators`

Recommended conventions:
- Version components/templates; keep changelogs for upgrades
- Provide preview metadata (thumbs, tags) in template definitions

---

## 9. Enterprise Roadmap (Fortune‑10 Enhancements)
- Identity: SSO/SAML (Okta, AzureAD), SCIM provisioning
- RBAC: orgs, teams, roles; project ACLs; audit logs
- Governance: content policies, template approvals, brand enforcement
- Compliance: SOC2, ISO27001 controls, data residency, backups
- Observability: OTel tracing, metrics, dashboards, SLOs, autoscaling
- Marketplace: signed artifacts, provenance, private catalogs
- Billing: seat + usage billing, entitlements, invoices, cost centers
- Security: egress controls, secrets vaults, field‑level encryption
- DR: cross‑region replicas, restore testing, chaos engineering
- AI guardrails: safety policies, PII detection, human review queues

---

## 10. Deployment & Operations
Vercel (serverless):
```bash
vercel login
vercel link
vercel env add DATABASE_URL production
vercel --prod
```
Other targets:
- Docker/Kubernetes: containerize Express + static client; add health/readiness
- AWS (Lambda/API GW or ECS), GCP (Cloud Run), Azure (Functions/Web Apps)

---

## 11. Testing Strategy
- Unit: components, generators, routes
- Integration: builder create/preview/export; auth/projects flows
- E2E: Cypress/Playwright for UI flows; API contract tests
- Performance: template preview/export benchmarks; API latency budgets

---

## 12. Contributing
- Propose templates/components via PR
- Follow code style and lint rules; write tests where practical
- Keep README sections in sync with new features

License: MIT
