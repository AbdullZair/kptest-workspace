# GitHub Secrets Configuration for KPTEST

This document describes the required secrets for KPTEST CI/CD pipelines and GitHub integration.

## Required Secrets

Configure these secrets in your GitHub repository under **Settings → Secrets and variables → Actions**.

### Repository Secrets

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `KUBE_CONFIG` | Base64-encoded Kubernetes kubeconfig file | Deploy workflow |
| `GHCR_TOKEN` | GitHub Container Registry token with `read:packages` scope | Image pull in Kubernetes |
| `DOCKER_USERNAME` | Docker Hub username | Docker Hub image pulls (optional) |
| `DOCKER_PASSWORD` | Docker Hub password or access token | Docker Hub authentication (optional) |

## Setting Up Secrets

### 1. KUBE_CONFIG - Kubernetes Configuration

Generate and encode your kubeconfig:

```bash
# Option A: If using kubectl with existing config
cat ~/.kube/config | base64 -w0

# Option B: For GKE
gcloud container clusters get-credentials <cluster-name> --region <region> --project <project>
cat ~/.kube/config | base64 -w0

# Option C: For EKS
aws eks update-kubeconfig --name <cluster-name> --region <region>
cat ~/.kube/config | base64 -w0

# Option D: For AKS
az aks get-credentials --name <cluster-name> --resource-group <resource-group>
cat ~/.kube/config | base64 -w0
```

Copy the output and add it as the `KUBE_CONFIG` secret in GitHub.

### 2. GHCR_TOKEN - GitHub Container Registry Token

Generate a Personal Access Token for GHCR:

```bash
# 1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
# 2. Click "Generate new token (classic)"
# 3. Select scopes:
#    - read:packages (required)
#    - write:packages (for pushing images)
#    - repo (full control of private repositories)
# 4. Generate token and copy it

# Add the token as GHCR_TOKEN secret in GitHub Settings
```

**Usage in Kubernetes:**
```bash
# Create image pull secret
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<your-github-username> \
  --docker-password=<GHCR_TOKEN> \
  --docker-email=<your-email> \
  -n kptest
```

### 3. DOCKER_USERNAME - Docker Hub Username

Your Docker Hub username for pulling/pushing images:

```bash
# Add your Docker Hub username as DOCKER_USERNAME secret
# Example: myusername
```

### 4. DOCKER_PASSWORD - Docker Hub Password

Your Docker Hub password or access token:

```bash
# Option A: Use your Docker Hub password (not recommended)
# Option B: Generate Docker Hub access token (recommended)
#   1. Go to https://hub.docker.com/settings/security
#   2. Click "New Access Token"
#   3. Give it a name (e.g., "GitHub Actions")
#   4. Copy the token and add as DOCKER_PASSWORD secret
```

## Verifying Secrets

### Test KUBE_CONFIG

```bash
# Decode and test the kubeconfig
echo $KUBE_CONFIG | base64 -d > /tmp/kubeconfig
KUBECONFIG=/tmp/kubeconfig kubectl cluster-info
KUBECONFIG=/tmp/kubeconfig kubectl get nodes
```

### Test GHCR_TOKEN

```bash
# Test GHCR authentication
echo $GHCR_TOKEN | docker login ghcr.io -u <your-github-username> --password-stdin
docker pull ghcr.io/<your-username>/<your-image>:latest
```

### Test Docker Hub Credentials

```bash
# Test Docker Hub authentication
docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
docker pull <image-from-docker-hub>
```

## Kubernetes Secrets Setup

After deploying to Kubernetes, ensure these secrets exist:

### Image Pull Secret for GHCR

```bash
# Apply the image pull secret
kubectl apply -f devops/k8s/image-pull-secret.yaml -n kptest

# Or create manually
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<your-github-username> \
  --docker-password=<GHCR_TOKEN> \
  --docker-email=<your-email> \
  -n kptest
```

### Application Secrets

```bash
# Update values in devops/k8s/secrets.yaml
# Then apply
kubectl apply -f devops/k8s/secrets.yaml -n kptest
```

## Environment Variables for Backend

The backend deployment uses these environment variables (configured in `devops/k8s/backend-deployment.yaml`):

| Variable | Source | Description |
|----------|--------|-------------|
| `SPRING_PROFILES_ACTIVE` | Hardcoded | Spring profile (dev/prod) |
| `DB_HOST` | Secret | PostgreSQL host |
| `DB_PORT` | Hardcoded | PostgreSQL port |
| `DB_NAME` | Secret | Database name |
| `DB_USER` | Secret | Database user |
| `DB_PASSWORD` | Secret | Database password |
| `JWT_SECRET` | Secret | JWT signing key |
| `REDIS_HOST` | Hardcoded | Redis host |
| `REDIS_PORT` | Hardcoded | Redis port |
| `MAIL_HOST` | Secret | SMTP server |
| `MAIL_USERNAME` | Secret | SMTP username |
| `MAIL_PASSWORD` | Secret | SMTP password |
| `HIS_BASE_URL` | Secret | HIS integration URL |

## Security Best Practices

1. **Never commit secrets** to version control
2. Use **OIDC authentication** where possible instead of long-lived tokens
3. Enable **secret scanning** in GitHub repository settings
4. Use **minimum required permissions** for all tokens
5. **Rotate secrets regularly**:
   - JWT Secret: Every 90 days
   - Database Password: Every 90 days
   - GitHub PAT: Every 365 days
   - Kubernetes credentials: Every 365 days
6. **Audit secret access** periodically

## Troubleshooting

### Deploy workflow fails with authentication error

```bash
# Verify kubeconfig is valid
echo $KUBE_CONFIG | base64 -d > /tmp/kubeconfig
KUBECONFIG=/tmp/kubeconfig kubectl cluster-info
KUBECONFIG=/tmp/kubeconfig kubectl get pods -n kptest
```

### Docker pull fails with 401 Unauthorized

```bash
# Verify GHCR secret exists
kubectl get secret ghcr-secret -n kptest

# Recreate image pull secret
kubectl delete secret ghcr-secret -n kptest
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<your-github-username> \
  --docker-password=<GHCR_TOKEN> \
  --docker-email=<your-email> \
  -n kptest

# Restart deployment
kubectl rollout restart deployment/kptest-backend -n kptest
kubectl rollout restart deployment/kptest-frontend -n kptest
```

### GitHub Actions workflow fails

Check the workflow run logs in GitHub Actions tab. Common issues:
- Missing or expired tokens
- Incorrect secret names (case-sensitive)
- Insufficient permissions on tokens

## Quick Setup Checklist

- [ ] Add `KUBE_CONFIG` secret to GitHub
- [ ] Add `GHCR_TOKEN` secret to GitHub
- [ ] Add `DOCKER_USERNAME` secret to GitHub (optional)
- [ ] Add `DOCKER_PASSWORD` secret to GitHub (optional)
- [ ] Create `ghcr-secret` in Kubernetes cluster
- [ ] Update `devops/k8s/secrets.yaml` with production values
- [ ] Apply Kubernetes secrets: `kubectl apply -f devops/k8s/secrets.yaml`
- [ ] Test deployment: `kubectl apply -f devops/k8s/`
