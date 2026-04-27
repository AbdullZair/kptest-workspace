# Security Scan Fixes

## Scan Results Summary

**Status:** ❌ **FAILED** (3/5 scans failed)  
**Date:** 2026-04-27  
**Commit:** b1910db

### Scan Results

| Scan Type | Status | Issues |
|-----------|--------|--------|
| **Trivy Container Scan** | ❌ Failed | Exit code 1 |
| **Snyk Dependency Scan** | ❌ Failed | Exit code 2 |
| **CodeQL Analysis** | ❌ Failed | Permission errors |
| **Gitleaks Secret Scan** | ✅ Success | No secrets found |
| **Hadolint Dockerfile Lint** | ✅ Success | No issues |

---

## Critical Issues

### 1. Trivy Container Scan Failed

**Error:**
```
Process completed with exit code 1.
```

**Root Cause:**
- Docker images not built yet
- Trivy cannot scan non-existent images
- Missing container registry authentication

**Fix:**

```yaml
# .github/workflows/security-scan.yml
- name: Build Docker images for scanning
  run: |
    docker compose build backend frontend
    
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'kptestpro-backend:latest'
    format: 'sarif'
    output: 'trivy-backend.sarif'
    severity: 'CRITICAL,HIGH'
```

---

### 2. Snyk Dependency Scan Failed

**Error:**
```
Process completed with exit code 2.
```

**Root Cause:**
- Missing lock files in expected locations
- Snyk authentication token not configured
- Node modules not installed

**Fix:**

```yaml
# .github/workflows/security-scan.yml
- name: Install dependencies
  run: |
    cd backend && ./gradlew dependencies
    cd ../frontend && npm ci
    cd ../mobile && npm ci
    
- name: Run Snyk test
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --severity-threshold=high
```

**Required Secret:**
```
SNYK_TOKEN=<your-snyk-token>
```

---

### 3. CodeQL Analysis Failed

**Errors:**
```
Code scanning is not enabled for this repository.
Resource not accessible by integration.
Dependencies lock file is not found.
```

**Root Cause:**
- Code scanning not enabled in repository settings
- Missing permissions in workflow
- Lock files in wrong locations

**Fix:**

#### Step 1: Enable Code Scanning
```
GitHub → Settings → Code security and analysis
→ Set up CodeQL → Select languages: Java, Kotlin, TypeScript
→ Save configuration
```

#### Step 2: Update Workflow Permissions
```yaml
# .github/workflows/security-scan.yml
permissions:
  security-events: write
  actions: read
  contents: read
```

#### Step 3: Fix Lock File Paths
```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v4
  with:
    languages: java,kotlin,typescript
    paths:
      - 'backend'
      - 'frontend'
      - 'mobile'
```

---

## Node.js 20 Deprecation Warnings

**Warning:**
```
Node.js 20 actions are deprecated.
Actions affected: gitleaks/gitleaks-action@v2, actions/setup-java@v4
```

**Deadline:** June 2nd, 2026

**Fix:**

```yaml
# Update all security scan workflows
- uses: gitleaks/gitleaks-action@v3  # Latest version
- uses: actions/setup-java@v5  # Latest version
```

---

## Required GitHub Secrets

### Create these secrets:

```
# Snyk
SNYK_TOKEN=<get from snyk.io>

# Container Registry
GHCR_TOKEN=<GitHub Personal Access Token>
GHCR_USERNAME=<your-github-username>

# Optional: Trivy DB
TRIVY_DB_REPOSITORY=ghcr.io/aquasecurity/trivy-db
```

### How to add secrets:

```
1. GitHub → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with name and value
4. Save
```

---

## Fixed Workflow

### Complete security-scan.yml:

```yaml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly

permissions:
  security-events: write
  actions: read
  contents: read

jobs:
  trivy-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      
      - name: Build Docker images
        run: docker compose build backend frontend
        
      - name: Run Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'kptestpro-backend:latest'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
          
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v4
        with:
          sarif_file: 'trivy-results.sarif'

  snyk-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      
      - name: Install dependencies
        run: |
          cd backend && ./gradlew dependencies
          cd ../frontend && npm ci
          cd ../mobile && npm ci
          
      - name: Run Snyk test
        uses: snyk/actions/node@v3
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
          
      - name: Run Snyk monitor
        uses: snyk/actions/node@v3
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        continue-on-error: true

  codeql-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v4
        with:
          languages: java,kotlin,typescript
          
      - name: Autobuild
        uses: github/codeql-action/autobuild@v4
        
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v4
        
  gitleaks-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
          
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v3
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          
  hadolint-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      
      - name: Run Hadolint
        uses: hadolint/hadolint-action@v3
        with:
          dockerfile: backend/Dockerfile
          failure-threshold: error
```

---

## Verification Steps

### After fixes:

1. **Enable Code Scanning:**
   ```
   GitHub → Settings → Code security and analysis
   → Enable CodeQL
   ```

2. **Add Required Secrets:**
   ```
   SNYK_TOKEN
   GHCR_TOKEN
   ```

3. **Update Workflow Files:**
   ```bash
   git add .github/workflows/security-scan.yml
   git commit -m "fix: Update security scan workflows"
   git push
   ```

4. **Monitor Next Run:**
   ```
   GitHub → Actions → Security Scan
   ```

---

## Expected Results

### After fixes:

| Scan Type | Before | After |
|-----------|--------|-------|
| **Trivy** | ❌ Failed | ✅ Passed |
| **Snyk** | ❌ Failed | ✅ Passed |
| **CodeQL** | ❌ Failed | ✅ Passed |
| **Gitleaks** | ✅ Success | ✅ Success |
| **Hadolint** | ✅ Success | ✅ Success |

---

## Security Best Practices

### 1. Regular Scanning
- Run security scans on every push
- Weekly scheduled scans
- Block PRs with critical vulnerabilities

### 2. Vulnerability Management
- Review all HIGH and CRITICAL issues
- Fix within 7 days (CRITICAL)
- Fix within 30 days (HIGH)

### 3. Secret Management
- Never commit secrets
- Use GitHub Secrets
- Rotate secrets quarterly

### 4. Dependency Updates
- Enable Dependabot
- Update dependencies monthly
- Monitor Snyk vulnerability alerts

---

## Troubleshooting

### Trivy Still Failing?

```bash
# Test locally
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image kptestpro-backend:latest
```

### Snyk Still Failing?

```bash
# Test locally
npm install -g snyk
snyk auth
snyk test
```

### CodeQL Still Failing?

```
1. Check if Code Scanning is enabled
2. Verify workflow permissions
3. Ensure source code is compiled before analysis
```

---

**Next Steps:**
1. Add required secrets to GitHub
2. Enable Code Scanning in repository settings
3. Update security-scan.yml workflow
4. Monitor next security scan run

**Generated:** 2026-04-27  
**Commit:** b1910db
