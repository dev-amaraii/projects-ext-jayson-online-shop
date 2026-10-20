# Jayson Storefront — Testing and CI Strategy

Status: initial CI foundation, not full test coverage.

## Decisions
- Test-driven development (TDD) and documentation-driven development (DocDD) are required.
- Keep all checks runnable locally; CI must invoke the same commands.
- Preserve feature-sliced architecture, shared design tokens, and light/dark/system themes.
- Minimize paid CI consumption: CircleCI runs only on an explicitly requested pipeline parameter.
- Do not claim unit, integration, E2E, or visual tests are active until implemented and verified.

## Current checks
- `pnpm typecheck`
- `pnpm build`

## Next implementation sequence (TDD)
1. Document observable behaviour and acceptance criteria for theme, catalogue, cart, and search.
2. Add Vitest, React Testing Library, and appropriate test scripts with lockfile changes.
3. Write failing behaviour tests, implement changes, then refactor.
4. Add Playwright smoke tests covering theme switching, mobile navigation, catalogue, and cart.
5. Extend CI jobs to run real test commands after they exist; add PR approval/branch protection only after evidence.

## CircleCI activation
CircleCI project must be linked to this repository. The configuration deliberately disables automatic workflows.
Trigger a pipeline with boolean parameter `run_validation=true` from CircleCI's Trigger Pipeline UI or API.
If CircleCI does not expose parameters in the UI, use its documented API trigger method.
Verify CircleCI's project/branch access and account credit allowance before enabling any automatic trigger.

## Acceptance criteria
- CircleCI pipeline starts only when explicitly requested.
- A clean dependency install, typecheck, and build pass on the CI runner.
- Failure in any check fails the job.
- No unimplemented tests are represented as passing.
- Future tests are added alongside the feature they protect.

## Known limitations
- No Vitest, React Testing Library, or Playwright setup is currently present in package scripts.
- CircleCI execution has not yet been confirmed.
- GitHub Actions remains independent; this file does not change GitHub workflows.
