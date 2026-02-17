# Work Plan: Ultra-Fast Automated Testing for LLM Agents

## TL;DR

> **Quick Summary**: Set up bun test as a zero-config, ultra-fast (<1s) testing framework focused on parser and logic validation. Optimized for LLM agent workflows with snapshot testing, property-based edge cases, and immediate feedback via watch mode.
>
> **Deliverables**:
>
> - `bunfig.toml` - Bun test configuration
> - `app/player/data/__tests__/` - Parser and logic test suites
> - `package.json` scripts - Test commands with watch mode
> - `scripts/test-watch.sh` - Convenience script for LLM agents
> - 100+ test cases covering simai parsing edge cases
> - Snapshot tests for parser output validation
>
> **Estimated Effort**: Short (2-3 hours setup, immediate value)
> **Parallel Execution**: YES - 4 waves, max 5 parallel tasks
> **Critical Path**: Task 1 → Task 3 → Task 5 → Task F1-F4

---

## Context

### Original Request

Create an automated testing strategy tailored for the current project, extremely performant, designed for LLM agents with quick feedback loops.

### Interview Summary

**User Decisions**:

- **Testing Priority**: Parser + Logic ONLY (skip UI/rendering tests)
- **Performance Target**: Ultra-Fast (< 1s total test runtime)
- **Test Framework**: bun test (native, zero overhead)
- **Visual Testing**: NO Playwright (trust data layer correctness)

### Research Findings

**Current State**:

- NO existing test infrastructure
- Bun is package manager (bun.lockb present)
- TypeScript project with strict compilation
- Key risk areas: Simai parser (regex), visualization converter (timing math)

**Recommended Approach**:

1. bun test (zero config, native Bun runtime)
2. Co-located tests in `__tests__/` folders
3. Snapshot testing for parser output validation
4. Property-based edge case testing
5. Watch mode for immediate LLM feedback

### Metis Review

**Identified Gaps** (addressed):

- **Gap**: bun test may have issues with Next.js module resolution
  - **Resolution**: Use `bun test --preload ./test-setup.ts` with proper module aliases
- **Gap**: Need to prevent scope creep toward React Testing Library
  - **Resolution**: Explicitly exclude UI testing in "Must NOT Have"
- **Gap**: PixiJS is a peer dependency that may cause import issues in tests
  - **Resolution**: Mock PixiJS imports in test setup
- **Gap**: No coverage reporting configured
  - **Resolution**: Add `bun test --coverage` support

---

## Work Objectives

### Core Objective

Establish an ultra-fast (<1s), zero-config testing framework using bun test, focused on parser and logic validation, optimized for LLM agent workflows with immediate feedback via watch mode.

### Concrete Deliverables

1. `bunfig.toml` - Bun configuration with test settings
2. `test-setup.ts` - Test environment setup with mocks
3. `app/player/data/__tests__/simai.test.ts` - Parser test suite (50+ cases)
4. `app/player/data/__tests__/visualization.test.ts` - Timing logic tests (30+ cases)
5. `app/player/data/__tests__/chart.test.ts` - Type validation tests (20+ cases)
6. `scripts/test-watch.sh` - Convenience script for continuous testing
7. Updated `package.json` with test scripts
8. `TESTING.md` - Quick reference guide for LLM agents

### Definition of Done

- [ ] `bun test` runs in < 1 second
- [ ] All existing code paths have representative test cases
- [ ] Snapshot tests validate parser output stability
- [ ] Watch mode auto-runs on file changes
- [ ] Coverage reporting available via `--coverage` flag
- [ ] Tests can run in CI without browser/DOM

### Must Have

- Parser tests for ALL simai syntax patterns (tap, hold, slide, EACH, BREAK)
- Timing conversion tests for BPM changes, divisions, edge cases
- Snapshot tests for complex parser outputs
- Property-based tests for timing boundary conditions
- Fast feedback loop (< 1s) for immediate LLM agent validation
- Zero external test dependencies (bun test only)

### Must NOT Have (Guardrails)

- React Testing Library (out of scope - UI not tested)
- Playwright or browser-based tests (too slow)
- DOM-dependent tests (jsdom not needed)
- Visual regression testing (trust data layer)
- Integration tests requiring full app bootstrap (too slow)
- Coverage thresholds blocking CI (optional only)

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: NO (starting from scratch)
- **Automated tests**: YES (TDD for new code, tests-after for existing)
- **Framework**: bun test (native Bun runner)
- **Test approach**: Snapshot + unit tests, no integration tests

### QA Policy

Every task includes agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

| Deliverable Type | Verification Tool                  | Method                              |
| ---------------- | ---------------------------------- | ----------------------------------- |
| Test files       | Bash (bun test)                    | Run test suite, assert 0 failures   |
| Test coverage    | Bash (bun test --coverage)         | Assert coverage reports generated   |
| Watch mode       | Bash (bun test --watch)            | Verify file changes trigger re-runs |
| Snapshots        | Bash (bun test --update-snapshots) | Verify snapshots can be updated     |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - can all run in parallel):
├── Task 1: Configure bun test + test-setup.ts
├── Task 2: Create test utilities and helpers
├── Task 3: Simai parser test suite
└── Task 4: Chart types test suite

Wave 2 (Logic Layer - depends on Wave 1):
├── Task 5: Visualization/timing converter tests
└── Task 6: Animation hook utility tests

Wave 3 (Integration + Scripts):
├── Task 7: Package.json scripts + watch mode
└── Task 8: Documentation (TESTING.md)

Wave FINAL (Verification - after ALL tasks):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Performance validation (<1s target)
├── Task F3: Test suite completeness check
└── Task F4: Documentation accuracy review

Critical Path: Task 1 → Task 3 → Task 5 → Task F1-F4
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 4 (Wave 1)
```

### Dependency Matrix

| Task  | Depends On | Blocks     | Wave  |
| ----- | ---------- | ---------- | ----- |
| 1     | -          | 2, 3, 4    | 1     |
| 2     | 1          | 3, 4, 5, 6 | 1     |
| 3     | 1, 2       | 5          | 2     |
| 4     | 1, 2       | -          | 1     |
| 5     | 2, 3       | F1-F4      | 2     |
| 6     | 2          | F1-F4      | 2     |
| 7     | 1          | F1-F4      | 3     |
| 8     | 1-7        | F1-F4      | 3     |
| F1-F4 | 1-8        | -          | FINAL |

### Agent Dispatch Summary

| Wave  | # Parallel | Tasks → Agent Category                                           |
| ----- | ---------- | ---------------------------------------------------------------- |
| 1     | 4          | T1-T4 → `quick` (configuration tasks)                            |
| 2     | 2          | T5-T6 → `quick` (test implementation)                            |
| 3     | 2          | T7-T8 → `quick` (scripts + docs)                                 |
| FINAL | 4          | F1-F4 → `oracle`, `unspecified-high`, `unspecified-high`, `deep` |

---

## TODOs

- [x] 1. Configure bun test infrastructure

  **What to do**:
  - Create `bunfig.toml` with test configuration
  - Create `test-setup.ts` with module aliases and PixiJS mocks
  - Ensure TypeScript path resolution works in tests
  - Add `.gitignore` entries for coverage reports

  **Must NOT do**:
  - Add vitest, jest, or other test frameworks
  - Configure jsdom (not needed for parser tests)
  - Add React Testing Library

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Configuration task, minimal complexity
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not needed, no UI work
    - `git-master`: Simple file creation, no git ops needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 2, 3, 4
  - **Blocked By**: None

  **References**:
  - `tsconfig.json` - Path aliases to replicate (`"@/*": ["./*"]`)
  - `package.json` - Current scripts structure
  - Bun test docs: https://bun.sh/docs/cli/test

  **Acceptance Criteria**:
  - [ ] `bunfig.toml` exists with `[test]` section
  - [ ] `test-setup.ts` mocks PixiJS imports
  - [ ] `bun test --help` runs without errors
  - [ ] Test files can import from `@/app/player/data/*`

  **QA Scenarios**:

  ```
  Scenario: Bun test configuration works
    Tool: Bash
    Preconditions: Task 1 files created
    Steps:
      1. Run: bun test --list
      2. Verify: No module resolution errors
    Expected Result: Command exits 0, lists 0 tests (none written yet)
    Evidence: .sisyphus/evidence/task-1-bun-test-works.txt

  Scenario: TypeScript path aliases resolve
    Tool: Bash
    Preconditions: test-setup.ts exists
    Steps:
      1. Create temp test: import { parseSimaiChart } from '@/app/player/data/simai'
      2. Run: bun test temp.test.ts
      3. Verify: Import resolves without error
    Expected Result: Test file runs, no "Cannot find module" errors
    Evidence: .sisyphus/evidence/task-1-path-aliases-work.txt
  ```

  **Evidence to Capture**:
  - [ ] Screenshot/text: `bun test --list` output
  - [ ] Screenshot/text: Import resolution success

  **Commit**: YES
  - Message: `chore(test): configure bun test infrastructure`
  - Files: `bunfig.toml`, `test-setup.ts`, `.gitignore`

---

- [x] 2. Create test utilities and helpers

  **What to do**:
  - Create `app/player/data/__tests__/helpers.ts`
  - Add helper functions:
    - `createChartInput(simai: string)` - Generate test chart strings
    - `expectValidChart(result)` - Validate chart structure
    - `snapshotPath(testName)` - Generate snapshot file paths
  - Add test data fixtures for common chart patterns

  **Must NOT do**:
  - Add external testing libraries (chai, sinon)
  - Create browser-dependent utilities
  - Add UI testing helpers

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 1)
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 3, 4, 5, 6
  - **Blocked By**: Task 1

  **References**:
  - `app/player/data/chart.ts` - Chart type definitions to validate against
  - `app/player/data/simai.ts` - Parser to understand input/output shapes

  **Acceptance Criteria**:
  - [ ] `helpers.ts` exports at least 5 utility functions
  - [ ] Test fixtures include: simple tap, hold, slide, EACH, BREAK patterns
  - [ ] Utilities can be imported from test files

  **QA Scenarios**:

  ```
  Scenario: Helper utilities work in tests
    Tool: Bash
    Preconditions: Task 2 files created
    Steps:
      1. Create test importing from helpers.ts
      2. Use createChartInput with sample simai
      3. Run: bun test
    Expected Result: Test passes, utilities function correctly
    Evidence: .sisyphus/evidence/task-2-helpers-work.txt

  Scenario: Fixtures contain expected patterns
    Tool: Bash
    Preconditions: Fixtures defined
    Steps:
      1. Read fixtures file
      2. Verify: Contains tap, hold, slide, EACH, BREAK examples
    Expected Result: All 5 pattern types present
    Evidence: .sisyphus/evidence/task-2-fixtures-complete.txt
  ```

  **Commit**: YES (groups with Task 1)
  - Message: `chore(test): add test utilities and fixtures`
  - Files: `app/player/data/__tests__/helpers.ts`, `app/player/data/__tests__/fixtures.ts`

---

- [x] 3. Simai parser test suite

  **What to do**:
  - Create `app/player/data/__tests__/simai.test.ts`
  - Test ALL regex patterns from simai.ts:
    - Time signatures: `(120){4}`, `(128.5){8}`
    - Taps: `1`, `2b` (BREAK), `3x` (EX), `4$` (FLICK)
    - Holds: `1h[4:1]`, `2h[8:2]`
    - Slides: `1-5[4:1]`, `1>5[4:1]`, `1<5[4:1]`, `1q5[4:1]`, `1p5[4:1]`, etc.
    - EACH: `[1,2]`, `[1,2,3,4]`
    - BREAK modifier on slides: `1-5[4:1]b`
  - Add snapshot tests for complex multi-note charts
  - Test edge cases: empty input, malformed syntax, extreme values
  - Target: 50+ test cases

  **Must NOT do**:
  - Test the UI that uses the parser
  - Add integration tests with full app
  - Skip edge cases (assume "valid input only")

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 2)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 5 (visualization tests depend on parsing)
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `app/player/data/simai.ts` - All regex patterns to test
  - `app/player/data/chart.ts` - Expected output types
  - `SIMAI_SYNTAX.md` - Documentation of valid syntax

  **Acceptance Criteria**:
  - [ ] 50+ test cases covering all note types
  - [ ] Snapshot tests for 5+ complex charts
  - [ ] Edge case tests: empty input, malformed syntax
  - [ ] `bun test simai.test.ts` passes in < 200ms

  **QA Scenarios**:

  ```
  Scenario: All note types parse correctly
    Tool: Bash
    Preconditions: simai.test.ts written
    Steps:
      1. Run: bun test app/player/data/__tests__/simai.test.ts
      2. Verify: All tests pass
      3. Verify: Runtime < 200ms
    Expected Result: 50+ passing tests, fast execution
    Evidence: .sisyphus/evidence/task-3-parser-tests.txt

  Scenario: Snapshot tests match expected output
    Tool: Bash
    Preconditions: Snapshots created
    Steps:
      1. Run: bun test --update-snapshots
      2. Inspect generated snapshot files
      3. Run: bun test (without update flag)
    Expected Result: Snapshots match, tests pass
    Evidence: .sisyphus/evidence/task-3-snapshots-match.txt
  ```

  **Commit**: YES
  - Message: `test(parser): comprehensive simai parser test suite`
  - Files: `app/player/data/__tests__/simai.test.ts`, `app/player/data/__tests__/__snapshots__/*`

---

- [x] 4. Chart types test suite

  **What to do**:
  - Create `app/player/data/__tests__/chart.test.ts`
  - Test type definitions from chart.ts:
    - Chart interface validation
    - NoteData union type discrimination
    - SlideType enum values
    - Timing calculations (BeatTime, TimeMs)
  - Add runtime type guards tests
  - Target: 20+ test cases

  **Must NOT do**:
  - Test TypeScript compilation (tsc handles that)
  - Add runtime type checking library

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 2)
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `app/player/data/chart.ts` - All type definitions

  **Acceptance Criteria**:
  - [ ] 20+ test cases for type validation
  - [ ] Runtime type guards tested
  - [ ] Edge cases: null, undefined, partial objects

  **QA Scenarios**:

  ```
  Scenario: Type guards work correctly
    Tool: Bash
    Preconditions: chart.test.ts written
    Steps:
      1. Run: bun test app/player/data/__tests__/chart.test.ts
      2. Verify: All type guard tests pass
    Expected Result: 20+ passing tests
    Evidence: .sisyphus/evidence/task-4-type-tests.txt
  ```

  **Commit**: YES (groups with Task 3)
  - Message: `test(types): chart data type validation tests`
  - Files: `app/player/data/__tests__/chart.test.ts`

---

- [ ] 5. Visualization/timing converter tests

  **What to do**:
  - Create `app/player/data/__tests__/visualization.test.ts`
  - Test beat→time conversion:
    - Basic conversion at constant BPM
    - BPM changes mid-chart
    - Different beat divisions (4th, 8th, 16th)
    - Edge cases: BPM=0, negative time (shouldn't happen)
  - Test note timing calculations:
    - hitTime accuracy
    - startTime (spawn time)
    - duration for holds and slides
  - Add property-based tests:
    - Random BPM values (60-240)
    - Random beat positions
    - Verify monotonicity (time always increases with beat)
  - Target: 30+ test cases

  **Must NOT do**:
  - Test the rendering (PixiJS)
  - Test with actual audio files
  - Skip floating-point precision edge cases

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - Reason: Timing math requires precision, more complex than parser tests

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 3)
  - **Parallel Group**: Wave 2
  - **Blocks**: None (F1-F4 depend on this)
  - **Blocked By**: Tasks 2, 3

  **References**:
  - `app/player/data/visualization.ts` - Conversion logic
  - `app/player/data/chart.ts` - Input types
  - `ARCHITECTURE.md` - Timing system documentation

  **Acceptance Criteria**:
  - [ ] 30+ test cases for timing conversion
  - [ ] Property-based tests with 100+ random cases each
  - [ ] Edge cases: BPM changes, extreme values
  - [ ] All tests pass with floating-point tolerance (0.001ms)

  **QA Scenarios**:

  ```
  Scenario: Timing conversion is accurate
    Tool: Bash
    Preconditions: visualization.test.ts written
    Steps:
      1. Run: bun test app/player/data/__tests__/visualization.test.ts
      2. Verify: All timing tests pass
      3. Verify: Property-based tests pass
    Expected Result: 30+ tests pass, properties validated
    Evidence: .sisyphus/evidence/task-5-timing-tests.txt

  Scenario: Edge cases handled correctly
    Tool: Bash
    Preconditions: Edge case tests written
    Steps:
      1. Run tests with edge cases (BPM=1, very long charts)
      2. Verify: No infinite loops or NaN values
    Expected Result: Graceful handling of extremes
    Evidence: .sisyphus/evidence/task-5-edge-cases.txt
  ```

  **Commit**: YES
  - Message: `test(timing): visualization converter test suite`
  - Files: `app/player/data/__tests__/visualization.test.ts`

---

- [ ] 6. Animation hook utility tests

  **What to do**:
  - Create `app/player/animation/__tests__/lane.test.ts`
  - Test lane position calculation:
    - Position at different progress values (0, 0.5, 1)
    - All 8 lanes (1-8)
    - Different radius values
  - Test timer-tween utilities
  - Pure function tests (no React context needed)
  - Target: 15+ test cases

  **Must NOT do**:
  - Test React hooks with context (too slow, too complex)
  - Mount components for testing
  - Test animation smoothness (performance, not correctness)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 2)
  - **Parallel Group**: Wave 2
  - **Blocks**: F1-F4
  - **Blocked By**: Task 2

  **References**:
  - `app/player/animation/lane.ts` - Lane calculation logic
  - `app/player/animation/timer-tween.ts` - Tween utilities
  - `utils/lane.ts` - Lane position utilities

  **Acceptance Criteria**:
  - [ ] 15+ test cases for animation math
  - [ ] All lanes (1-8) tested
  - [ ] Edge progress values tested (0, 1, >1)

  **QA Scenarios**:

  ```
  Scenario: Lane calculations are correct
    Tool: Bash
    Preconditions: lane.test.ts written
    Steps:
      1. Run: bun test app/player/animation/__tests__/lane.test.ts
      2. Verify: All lane position tests pass
    Expected Result: 15+ passing tests
    Evidence: .sisyphus/evidence/task-6-lane-tests.txt
  ```

  **Commit**: YES (groups with Task 5)
  - Message: `test(animation): lane position calculation tests`
  - Files: `app/player/animation/__tests__/lane.test.ts`

---

- [ ] 7. Package.json scripts and watch mode

  **What to do**:
  - Update `package.json` scripts:
    - `"test": "bun test"`
    - `"test:watch": "bun test --watch"`
    - `"test:coverage": "bun test --coverage"`
    - `"test:update": "bun test --update-snapshots"`
  - Create `scripts/test-watch.sh` convenience script
  - Add test running to CI workflow (if exists)

  **Must NOT do**:
  - Add pre-commit hooks (slow down LLM agents)
  - Add coverage thresholds (blocking)
  - Configure complex test runners

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 1)
  - **Parallel Group**: Wave 3
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1

  **References**:
  - `package.json` - Current scripts structure

  **Acceptance Criteria**:
  - [ ] `bun run test` executes test suite
  - [ ] `bun run test:watch` starts watch mode
  - [ ] `bun run test:coverage` generates coverage report
  - [ ] `scripts/test-watch.sh` is executable and works

  **QA Scenarios**:

  ```
  Scenario: Test scripts work
    Tool: Bash
    Preconditions: package.json updated
    Steps:
      1. Run: bun run test
      2. Verify: Tests execute
      3. Run: bun run test:coverage
      4. Verify: Coverage report generated
    Expected Result: All scripts work as expected
    Evidence: .sisyphus/evidence/task-7-scripts-work.txt

  Scenario: Watch mode functions
    Tool: Bash
    Preconditions: test:watch script added
    Steps:
      1. Start: bun run test:watch (background)
      2. Modify a test file
      3. Verify: Tests re-run automatically
      4. Kill watch process
    Expected Result: Watch mode detects changes and re-runs
    Evidence: .sisyphus/evidence/task-7-watch-mode.txt
  ```

  **Commit**: YES
  - Message: `chore(test): add test scripts and watch mode`
  - Files: `package.json`, `scripts/test-watch.sh`

---

- [ ] 8. Documentation (TESTING.md)

  **What to do**:
  - Create `TESTING.md` with:
    - Quick start guide for LLM agents
    - Test file naming conventions
    - How to run tests (including watch mode)
    - How to add new tests
    - Snapshot update workflow
    - Troubleshooting common issues
  - Update `ARCHITECTURE.md` with testing section

  **Must NOT do**:
  - Write verbose prose
  - Include testing philosophy/theory
  - Duplicate bun test documentation

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Tasks 1-7)
  - **Parallel Group**: Wave 3
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 1-7

  **References**:
  - `README.md` - Project context
  - `ARCHITECTURE.md` - Architecture overview

  **Acceptance Criteria**:
  - [ ] `TESTING.md` exists with quick start section
  - [ ] All test commands documented
  - [ ] Example test case provided

  **QA Scenarios**:

  ```
  Scenario: Documentation is complete
    Tool: Bash
    Preconditions: TESTING.md written
    Steps:
      1. Read TESTING.md
      2. Verify: Quick start section exists
      3. Verify: Example test provided
    Expected Result: Documentation is helpful for LLM agents
    Evidence: .sisyphus/evidence/task-8-docs-complete.txt
  ```

  **Commit**: YES (groups with Task 7)
  - Message: `docs(test): add testing guide for LLM agents`
  - Files: `TESTING.md`

---

## Final Verification Wave (MANDATORY)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
      Read the plan end-to-end. Verify all "Must Have" items exist in code:
  - Parser tests for ALL note types (tap, hold, slide, EACH, BREAK)
  - Timing conversion tests with BPM changes
  - Snapshot tests present
  - Watch mode configured
  - <1s runtime verified
    Check "Must NOT Have": No React Testing Library, no Playwright, no jsdom tests.
    Output: `Must Have [N/N] | Must NOT Have [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Performance Validation** — `unspecified-high`
      Run `bun test` 10 times. Calculate average runtime. Must be < 1 second.
      Run individual test files. Each must be < 200ms.
      Output: `Avg Runtime: Xms | Fastest: Xms | Slowest: Xms | VERDICT`

- [ ] F3. **Test Suite Completeness** — `unspecified-high`
      Count test cases:
  - Simai parser: target 50+, actual: ?
  - Chart types: target 20+, actual: ?
  - Visualization: target 30+, actual: ?
  - Animation: target 15+, actual: ?
    Verify all exported functions from data layer have tests.
    Output: `Tests [N/N targets met] | Coverage [X%] | VERDICT`

- [ ] F4. **Documentation Accuracy** — `deep`
      Follow `TESTING.md` quick start guide exactly as written.
      Verify all commands work.
      Verify example test can be copy-pasted and run.
      Check for outdated references.
      Output: `Commands [N/N work] | Example [PASS/FAIL] | VERDICT`

---

## Commit Strategy

| After Task | Message                                             | Files                                   | Verification    |
| ---------- | --------------------------------------------------- | --------------------------------------- | --------------- |
| 1-2        | `chore(test): configure bun test infrastructure`    | bunfig.toml, test-setup.ts, helpers.ts  | bun test --list |
| 3-4        | `test(parser): comprehensive parser and type tests` | simai.test.ts, chart.test.ts, snapshots | bun test        |
| 5-6        | `test(logic): timing and animation test suites`     | visualization.test.ts, lane.test.ts     | bun test        |
| 7-8        | `chore(test): test scripts and documentation`       | package.json, scripts/, TESTING.md      | bun run test    |

---

## Success Criteria

### Verification Commands

```bash
# All tests pass
bun test  # Expected: All tests pass

# Runtime target met
bun test  # Expected: < 1000ms total runtime

# Watch mode works
bun run test:watch  # Expected: File changes trigger re-runs

# Coverage report generated
bun run test:coverage  # Expected: coverage/ directory created

# Snapshot update works
bun run test:update  # Expected: Snapshots updated
```

### Final Checklist

- [ ] All "Must Have" present
  - [ ] Parser tests for all note types
  - [ ] Timing conversion tests
  - [ ] Snapshot tests
  - [ ] Watch mode configured
  - [ ] <1s runtime verified
- [ ] All "Must NOT Have" absent
  - [ ] No React Testing Library
  - [ ] No Playwright
  - [ ] No jsdom tests
  - [ ] No UI/integration tests
- [ ] 115+ total test cases (50+ parser + 20+ types + 30+ timing + 15+ animation)
- [ ] Documentation complete (TESTING.md)
- [ ] All verification agents approve
