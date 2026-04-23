# GitHub Secrets Configuration

This document describes the secrets required for KPTEST CI/CD pipelines.

## Required Secrets

Configure these secrets in your GitHub repository under **Settings → Secrets and variables → Actions**.

### Repository Secrets

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `GITHUB_TOKEN` | Automatically provided by GitHub Actions | All workflows |
| `KUBE_CONFIG` | Base64-encoded Kubernetes kubeconfig file | Deploy workflow |

### Optional Secrets

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `EAS_BUILD_TOKEN` | Expo EAS Build token for mobile builds | Mobile CI (optional) |
| `SONAR_TOKEN` | SonarQube token for code quality analysis | Code Quality (optional) |

## Setting Up Secrets

### 1. GitHub Token (Automatic)

The `GITHUB_TOKEN` is automatically created by GitHub Actions for each workflow run. No manual setup required.

### 2. Kubernetes Configuration

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

### 3. EAS Build Token (Optional)

If you want to trigger EAS builds from GitHub Actions:

```bash
# Generate EAS token
eas login
eas whoami

# The token is stored in ~/.config/Expo/
cat ~/.config/Expo/config.json | jq '.auth.sessionSecret'
```

Add the token as `EAS_BUILD_TOKEN` secret.

### 4. SonarQube Token (Optional)

For code quality analysis:

1. Create a token in your SonarQube instance
2. Add it as `SONAR_TOKEN` secret

## Kubernetes Secrets

After deploying to Kubernetes, create the following secrets in the cluster:

### GHCR Image Pull Secret

```bash
# Generate Personal Access Token (PAT) with read:packages scope
# GitHub → Settings → Developer settings → Personal access tokens

kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<your-github-username> \
  --docker-password=<your-pat> \
  --docker-email=<your-email> \
  -n kptest
```

### Application Secrets

Update and apply the secrets manifest:

```bash
# Edit the secrets template
vi devops/k8s/secrets.yaml

# Apply to cluster
kubectl apply -f devops/k8s/secrets.yaml -n kptest
```

## Secret Rotation

### Recommended Rotation Schedule

| Secret | Rotation Frequency |
|--------|-------------------|
| JWT Secret | Every 90 days |
| Database Password | Every 90 days |
| GitHub PAT | Every 365 days |
| Kubernetes credentials | Every 365 days |

### Rotation Procedure

1. Generate new secret value
2. Update GitHub secret
3. Update Kubernetes secret
4. Trigger rolling restart:
   ```bash
   kubectl rollout restart deployment/kptest-backend -n kptest
   kubectl rollout restart deployment/kptest-frontend -n kptest
   ```

## Security Best Practices

1. **Never commit secrets** to version control
2. Use **OIDC authentication** where possible instead of long-lived tokens
3. Enable **secret scanning** in GitHub repository settings
4. Use **minimum required permissions** for all tokens
5. **Rotate secrets regularly** according to the schedule above
6. **Audit secret access** periodically in GitHub and Kubernetes

## Troubleshooting

### Deploy workflow fails with authentication error

```bash
# Verify kubeconfig is valid
echo $KUBE_CONFIG | base64 -d > /tmp/kubeconfig
KUBECONFIG=/tmp/kubeconfig kubectl cluster-info

# Check secret exists in cluster
kubectl get secrets -n kptest
```

### Docker pull fails with 401

```bash
# Recreate image pull secret
kubectl delete secret ghcr-secret -n kptest
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<username> \
  --docker-password=<pat> \
  --docker-email=<email> \
  -n kptest
```
