# PLA_Automation_Tutorial

End-to-end UI test automation with **Playwright** using a simple **Page Object Model (POM)**, wired to **Azure DevOps Pipelines**. The pipeline publishes **Playwright HTML** and **Allure** reports as artifacts, **JUnit** results to the **Tests** tab, and optional **code coverage** to the **Code Coverage** tab.

## Tech stack
- Node.js 20
- Playwright (Chromium/Firefox/WebKit)
- Page Object Model (e.g., `pages/SelectPage.js`)
- Allure (pretty HTML report)
- Azure DevOps Pipelines (`azure-pipelines.yml`)
- (Optional) nyc/istanbul for coverage

## Repo layout
```
.
├─ pages/                     # Page Objects (POM) – e.g., SelectPage.js
├─ tests/                     # Playwright test specs
├─ tests-examples/            # Example/spec templates
├─ .github/workflows/         # (Optional) GitHub Actions workflows
├─ azure-pipelines.yml        # Azure DevOps CI pipeline
├─ buildspec.yml              # (Optional) AWS CodeBuild config
├─ playwright.config.js       # Playwright configuration
├─ testdata.json              # Sample test data
├─ package.json               # NPM scripts & deps
└─ README.md
```

## Prerequisites
- Node.js 20+
- Git
- Java 17+ (only if you want to generate Allure HTML locally)
- macOS / Linux / Windows

## Local setup
```bash
# Install dependencies and browsers
npm ci
npx playwright install --with-deps
```

### Run tests (HTML + Allure + JUnit)
```bash
# Produces:
# - Playwright HTML: ./playwright-report/
# - Allure raw results: ./my-allure-results/  (set by env var below)
# - JUnit XML: ./test-results/junit.xml
ALLURE_RESULTS_DIR=my-allure-results npx playwright test --reporter=line,html,allure-playwright,junit
```

### Open Playwright HTML report
```bash
npx playwright show-report
# or open ./playwright-report/index.html
```

### Generate Allure HTML (local)
```bash
# Requires Java
npx allure generate my-allure-results --clean -o allure-report
# then open ./allure-report/index.html
```

### (Optional) Run with coverage
```bash
npm i -D nyc
ALLURE_RESULTS_DIR=my-allure-results npx nyc --reporter=cobertura --reporter=lcov --reporter=html   npx playwright test --reporter=line,html,allure-playwright,junit
# Coverage HTML will be in ./coverage/index.html
```

## Azure DevOps CI
This repo includes **`azure-pipelines.yml`** that:
- Installs Node 20, Playwright browsers, and Java (for Allure)
- Runs tests with reporters (HTML, Allure, JUnit)
- Publishes:
  - **JUnit** → **Tests** tab
  - **Playwright HTML** → **Artifacts**
  - **Allure HTML** → **Artifacts**
  - *(Optional)* **Cobertura coverage** → **Code Coverage** tab

### Where to view in a pipeline run
- **Artifacts**: `playwright-report/index.html`, `allure-report/index.html`
- **Tests** tab: Playwright results (requires JUnit publish)
- **Code Coverage** tab: if `PublishCodeCoverageResults@2` points to `coverage/cobertura-coverage.xml` and `coverage/` (with `index.html`)

> If the **Tests** tab is missing, ensure JUnit XML is produced and the `PublishTestResults@2` step runs.  
> If **Code Coverage** says “HTML not found”, ensure `reportDirectory: coverage` exists and contains `index.html`.

## Helpful NPM scripts (optional)
Add these to `package.json`:
```json
{
  "scripts": {
    "test": "playwright test",
    "test:report": "playwright show-report",
    "test:allure": "ALLURE_RESULTS_DIR=my-allure-results playwright test --reporter=line,html,allure-playwright,junit",
    "allure:gen": "allure generate my-allure-results --clean -o allure-report",
    "allure:open": "allure open allure-report",
    "coverage": "nyc --reporter=cobertura --reporter=lcov --reporter=html playwright test --reporter=line,html,allure-playwright,junit"
  }
}
```

## Page Object Model (POM)
Page Objects live under `pages/`. Example: `SelectPage.js` encapsulates locators & actions (pagination, size selection, add-to-bag). Specs under `tests/` import these objects to keep tests clean and readable.

## Troubleshooting
- **Element not clickable / not enabled**: Scroll into view (`locator.scrollIntoViewIfNeeded()`), then `await expect(locator).toBeEnabled()` before click.
- **Pagination wait/timeouts**: Add a small wait after clicking “Next” or wait for a grid change (first item text/count).
- **Tests tab empty**: Ensure `--reporter=junit` and `PublishTestResults@2` points to the XML.
- **Coverage tab empty**: Ensure `coverage/cobertura-coverage.xml` and `coverage/index.html` exist; update pipeline paths accordingly.

## Contributing
PRs and issues are welcome! Keep code formatted and tests deterministic.

## License
MIT
