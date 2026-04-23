# 🚀 Instrukcja Push do GitHub

## Problem
Push do GitHub wymaga autoryfikacji. Masz dwie opcje:

---

## OPCJA 1: SSH (Zalecane)

### Krok 1: Skopiuj klucz publiczny
```bash
cat ~/.ssh/id_ed25519.pub
```

Skopiuj całą zawartość (zaczyna się od `ssh-ed25519`).

### Krok 2: Dodaj klucz do GitHub
1. Wejdź na: https://github.com/settings/keys
2. Kliknij **"New SSH key"**
3. Wklej klucz w pole "Key"
4. Nadaj tytuł: "KPTEST Workspace"
5. Kliknij **"Add SSH key"**

### Krok 3: Zmień remote na SSH
```bash
cd /home/user1/KPTESTPRO
git remote set-url origin git@github.com:AbdullZair/kptest-workspace.git
```

### Krok 4: Push
```bash
git push -u origin main
```

---

## OPCJA 2: HTTPS z Personal Access Token

### Krok 1: Wygeneruj token
1. Wejdź na: https://github.com/settings/tokens
2. Kliknij **"Generate new token (classic)"**
3. Nadaj nazwę: "KPTEST Workspace"
4. Zaznacz uprawnienia:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. Kliknij **"Generate token"**
6. **SKOPIUJ TOKEN** (widoczny tylko raz!)

### Krok 2: Zmień remote na HTTPS
```bash
cd /home/user1/KPTESTPRO
git remote set-url origin https://github.com/AbdullZair/kptest-workspace.git
```

### Krok 3: Push z tokenem
```bash
# Zamień YOUR_TOKEN na wygenerowany token
git remote set-url origin https://YOUR_TOKEN@github.com/AbdullZair/kptest-workspace.git
git push -u origin main
```

---

## Po pushowaniu

### Sprawdź status na GitHub
1. Wejdź na: https://github.com/AbdullZair/kptest-workspace
2. Powinieneś zobaczyć wszystkie pliki
3. Przejdź do **Actions** - zobaczysz uruchomione CI workflows

### Wymagane kroki po push:

1. **Skonfiguruj GitHub Secrets:**
   - Settings → Secrets and variables → Actions
   - Dodaj sekret: `KUBE_CONFIG` (kubeconfig do Kubernetes)
   - Dodaj sekret: `GHCR_TOKEN` (GitHub Container Registry token)

2. **Włącz GitHub Actions:**
   - Actions → "I understand my workflows, go ahead and enable them"

3. **Oznacz pierwszy release:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   To uruchomi deploy workflow!

---

## Rozwiązywanie problemów

### Problem: "Permission denied (publickey)"
```bash
# Sprawdź czy klucz jest dodany
ssh-add -l

# Jeśli pusty, dodaj klucz
ssh-add ~/.ssh/id_ed25519
```

### Problem: "Host key verification failed"
```bash
# Dodaj GitHub do known_hosts
ssh-keyscan github.com >> ~/.ssh/known_hosts
```

### Problem: "remote: Repository not found"
Upewnij się, że repozytorium istnieje na GitHub:
https://github.com/AbdullZair/kptest-workspace

Jeśli nie istnieje, utwórz je (puste, bez README/.gitignore).

---

## Kontakt

W przypadku problemów sprawdź:
- https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
