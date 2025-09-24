# PLA_Automation_Tutorial

End-to-end UI test automation with **Playwright** using a simple **Page Object Model (POM)**, wired to **Azure DevOps Pipelines** and **AWS CodeBuild**. 
- Azure pipeline publishes **Playwright HTML** and **Allure** reports as artifacts, **JUnit** to the **Tests** tab, and optional **code coverage** to the **Code Coverage** tab.
- AWS CodeBuild job can **generate the same reports** and deploy them to an **S3 static website** (optional).

## Tech stack
- Node.js 20
- Playwright (Chromium/Firefox/WebKit)
- Page Object Model (e.g., `pages/SelectPage.js`)
- Allure (pretty HTML report)
- CI: Azure DevOps (`azure-pipelines.yml`), AWS CodeBuild (`buildspec.yml`)
- (Optional) nyc/istanbul for coverage

---

## Repo layout
```
.
├─ pages/                     # Page Objects (POM) – e.g., SelectPage.js
├─ tests/                     # Playwright test specs
├─ tests-examples/            # Example/spec templates
├─ .github/workflows/         # (Optional) GitHub Actions workflows
├─ azure-pipelines.yml        # Azure DevOps CI pipeline
├─ buildspec.yml              # AWS CodeBuild config
├─ playwright.config.js       # Playwright configuration
├─ testdata.json              # Sample test data
├─ package.json               # NPM scripts & deps
└─ README.md
```

---

## Prerequisites
- Node.js 20+
- Git
- Java 17+ (for Allure HTML generation locally or in CI)
- macOS / Linux / Windows

---

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

---

## Azure DevOps CI (summary)

`azure-pipelines.yml` does the following:
- Installs Node 20, Playwright browsers, and Java
- Runs tests with reporters (HTML, Allure, JUnit)
- Publishes:
  - **JUnit** → **Tests** tab
  - **Playwright HTML** → **Artifacts**
  - **Allure HTML** → **Artifacts**
  - *(Optional)* **Cobertura coverage** → **Code Coverage** tab

Where to view in a run:
- **Artifacts**: `playwright-report/index.html`, `allure-report/index.html`
- **Tests** tab: Playwright results (requires JUnit publish)
- **Code Coverage** tab: needs `coverage/cobertura-coverage.xml` and `coverage/index.html`

> If the **Tests** tab is missing, ensure JUnit XML is produced and `PublishTestResults@2` runs.  
> If **Code Coverage** says “HTML not found”, ensure `reportDirectory: coverage` exists and contains `index.html`.

---

## AWS CodeBuild + S3 (optional deployment)

You can also run the same tests in **AWS CodeBuild** and **publish reports to S3** for easy sharing.

### 1) Create/choose an S3 bucket
```bash
aws s3 mb s3://my-playwright-reports-123
# (optional) enable static website to serve HTML
aws s3 website s3://my-playwright-reports-123 --index-document index.html --error-document index.html
```
**Bucket policy (public read – optional, only if you want a public site):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForWebsite",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-playwright-reports-123/*"
    }
  ]
}
```
> ⚠️ If your org blocks public S3, use **CloudFront** or keep the bucket private and share **pre-signed** URLs instead.

### 2) IAM permissions for CodeBuild role
Attach a policy that lets CodeBuild upload reports:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-playwright-reports-123",
        "arn:aws:s3:::my-playwright-reports-123/*"
      ]
    }
  ]
}
```

### 3) Example `buildspec.yml`
This repo already includes a `buildspec.yml`. Here’s a simplified example that:
- Installs Node + Playwright, runs tests with HTML/Allure
- Generates Allure HTML
- Uploads both HTML reports to S3 under a prefix (e.g., `playwright/`)
- Optionally sets public-read for website hosting
```yaml
version: 0.2

env:
  variables:
    S3_BUCKET: my-playwright-reports-123
    S3_PREFIX: playwright
    ALLURE_RESULTS_DIR: my-allure-results

phases:
  install:
    commands:
      - echo "Installing node + browsers"
      - npm ci
      - npx playwright install --with-deps
      - echo "Installing Java for Allure (Amazon Linux images usually have it; add install if needed)"
  build:
    commands:
      - echo "Run Playwright"
      - mkdir -p test-results
      - ALLURE_RESULTS_DIR=$ALLURE_RESULTS_DIR npx playwright test --reporter=line,html,allure-playwright,junit || true
      - echo "Generate Allure HTML"
      - if [ -d "$ALLURE_RESULTS_DIR" ] || [ -d "allure-results" ]; then           DIR="$ALLURE_RESULTS_DIR"; [ ! -d "$DIR" ] && DIR="allure-results";           npx allure generate "$DIR" --clean -o allure-report;         else           mkdir -p allure-report && printf "<h2>No Allure report</h2>" > allure-report/index.html;         fi
artifacts:
  files:
    - 'playwright-report/**'
    - 'allure-report/**'
    - 'test-results/**'
  discard-paths: no
  base-directory: .
post_build:
  commands:
    - echo "Sync Playwright HTML to s3://$S3_BUCKET/$S3_PREFIX/playwright-report"
    - aws s3 sync playwright-report "s3://$S3_BUCKET/$S3_PREFIX/playwright-report" --delete --acl public-read
    - echo "Sync Allure HTML to s3://$S3_BUCKET/$S3_PREFIX/allure-report"
    - aws s3 sync allure-report "s3://$S3_BUCKET/$S3_PREFIX/allure-report" --delete --acl public-read
    - echo "Done. Website roots:"
    - echo "  Playwright: http://$S3_BUCKET.s3-website-$(aws configure get region || echo us-east-1).amazonaws.com/$S3_PREFIX/playwright-report/index.html"
    - echo "  Allure:     http://$S3_BUCKET.s3-website-$(aws configure get region || echo us-east-1).amazonaws.com/$S3_PREFIX/allure-report/index.html"
```
> If your bucket is **private**, drop the `--acl public-read` flags and access via **pre-signed URLs**:
```bash
aws s3 presign s3://my-playwright-reports-123/playwright/index.html --expires-in 3600
```

### 4) Create the CodeBuild project
- Source: GitHub (this repo) or CodeCommit
- Environment: Ubuntu/Amazon Linux standard image with Node 20 (or install Node in `install` phase)
- Service role: attach S3 permissions shown above
- Buildspec: use repo `buildspec.yml`
- Environment variables:
  - `S3_BUCKET = my-playwright-reports-123`
  - `S3_PREFIX = playwright`
  - `ALLURE_RESULTS_DIR = my-allure-results`

### 5) Open your hosted reports
- **S3 static site URL**: `http://<bucket>.s3-website-<region>.amazonaws.com/<prefix>/playwright-report/index.html`
- **Allure HTML**: `http://<bucket>.s3-website-<region>.amazonaws.com/<prefix>/allure-report/index.html`

---

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

---

## Page Object Model (POM)
Page Objects live under `pages/`. Example: `SelectPage.js` encapsulates locators & actions (pagination, size selection, add-to-bag). Specs under `tests/` import these objects to keep tests clean and readable.

---

## Troubleshooting
- **Element not clickable / not enabled**: Scroll into view (`locator.scrollIntoViewIfNeeded()`), then `await expect(locator).toBeEnabled()` before click.
- **Pagination wait/timeouts**: Add a small wait after clicking “Next” or wait for a grid change (first item text/count).
- **Tests tab empty (Azure)**: Ensure `--reporter=junit` and `PublishTestResults@2` points to the XML.
- **Coverage tab empty (Azure)**: Ensure `coverage/cobertura-coverage.xml` and `coverage/index.html` exist; update pipeline paths accordingly.
- **S3 site 403/AccessDenied**: Public access likely blocked; either add a bucket policy, use CloudFront, or deploy privately and share pre-signed URLs.
- **Allure report empty**: Verify `ALLURE_RESULTS_DIR` or fallback `allure-results` directory actually exists before generating.

---

## Contributing
PRs and issues are welcome! Keep code formatted and tests deterministic.

## License
MIT
