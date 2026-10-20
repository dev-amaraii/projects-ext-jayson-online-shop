# On-demand CircleCI API control

## Scope
Reusable, zero-dependency Node CLI for NEN projects. It **does not** give ChatGPT remote API access by itself. No hosted service or ChatGPT connector is deployed. The script must run in a trusted execution environment with its own secret store.

## Setup
- Copy `scripts/circleci.mjs` to other repos or extract it into a shared NEN tool when stable.
- Set `CIRCLE_PROJECT_SLUG` to the **exact** three-part slug shown in CircleCI Project Settings > Overview (GitHub App projects often use opaque `circleci/<org-id>/<project-id>`).
- Set `CIRCLE_DEFINITION_ID` to the pipeline definition UUID shown in Project Settings > Pipelines. The Jayson `build-and-test` definition was displayed as `b5a41026-8298-4976-956b-49fbcabde695`; verify before using.
- Set `CIRCLE_TOKEN` only in a secure environment variable or secret manager; never commit it, include it in logs, or paste it into ChatGPT.
- Optionally set `CIRCLE_ALLOWED_BRANCHES` (comma-separated, default `feat/storefront-demo,main`).

## Commands
```bash
node scripts/circleci.mjs trigger feat/storefront-demo
# Inspect dry run, then explicitly request one run:
node scripts/circleci.mjs trigger feat/storefront-demo --execute
node scripts/circleci.mjs status <pipeline-uuid>
```

Trigger uses CircleCI API v2 `POST /project/{provider}/{organization}/{project}/pipeline/run` with `definition_id`, `config.branch`, `checkout.branch`, and `parameters.run_validation=true`. The older `POST /project/{project-slug}/pipeline` does not support GitHub App projects.

## Guardrails
- Trigger is dry-run by default and requires `--execute`.
- Branch allowlist is enforced. API token is never printed.
- No automatic GitHub push, PR, webhook, or scheduled trigger is created.
- Do not expose this script behind a public unauthenticated HTTP endpoint.
- For a future ChatGPT connector: use authenticated user identity, per-project allowlists, a server-side token store, rate limiting, explicit trigger confirmation, and audit logs. Read-only status can have separate permissions.
- This CLI only reads pipeline metadata; fetching workflows, jobs, and logs is a future increment.

## Acceptance
1. Dry run prints the correct request without a token or API call.
2. Disallowed branches fail locally.
3. Authorized trigger returns a pipeline ID.
4. Status retrieves that pipeline ID.
5. CircleCI workflow completes build then typecheck on a clean checkout.

Reference: CircleCI API v2 documentation, https://circleci.com/docs/api/v2/
