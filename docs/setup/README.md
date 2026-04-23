# Setup i Konfiguracja

Instrukcje instalacji i konfiguracji środowiska deweloperskiego.

## 🚀 Quick Start

### Wymagania Wstępne

| Narzędzie | Wersja | Link |
|-----------|--------|------|
| Java | 21+ | [Adoptium](https://adoptium.net/) |
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) |
| Docker | 24+ | [docker.com](https://docker.com/) |
| Git | 2.40+ | [git-scm.com](https://git-scm.com/) |

### 1. Klonowanie Repozytorium

```bash
git clone https://github.com/your-org/kptest-workspace.git
cd kptest-workspace
```

### 2. Inicjalizacja Projektu

```bash
# Utwórz strukturę katalogów
chmod +x init_project.sh
./init_project.sh
```

### 3. Konfiguracja Environment Variables

```bash
# Skopiuj przykładowe pliki
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp mobile/.env.example mobile/.env
```

### 4. Uruchomienie Środowiska

```bash
# Uruchom wszystkie usługi
docker-compose up -d

# Sprawdź status
docker-compose ps

# Zobacz logi
docker-compose logs -f
```

### 5. Weryfikacja

| Usługa | URL | Status |
|--------|-----|--------|
| Frontend | http://localhost:3000 | ✅ |
| Backend API | http://localhost:8080/api/v1/health | ✅ |
| PostgreSQL | localhost:5432 | ✅ |
| Redis | localhost:6379 | ✅ |

## 📁 Struktura Projektu

```
kptest-workspace/
├── backend/                 # Spring Boot API
│   ├── src/main/java/
│   ├── src/main/resources/
│   └── build.gradle
├── frontend/                # React Web App
│   ├── src/
│   └── package.json
├── mobile/                  # React Native App
│   ├── src/
│   └── package.json
├── devops/                  # Docker, CI/CD
│   ├── docker/
│   └── ci-cd/
└── docs/                    # Dokumentacja
```

## 🔧 Konfiguracja dla Deweloperów

### Backend (Java)

```bash
cd backend

# Build
./gradlew build

# Uruchom (dev profile)
./gradlew bootRun --args='--spring.profiles.active=dev'

# Testy
./gradlew test
```

### Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build
npm run build
```

### Mobile (React Native)

```bash
cd mobile

# Install dependencies
npm install

# Start Expo
npm start

# Build Android
npm run build:android
```

## 🐛 Troubleshooting

### Problem: Port already in use
```bash
# Sprawdź co używa portu
lsof -i :8080

# Zabij proces
kill -9 <PID>
```

### Problem: Docker containers not starting
```bash
# Wyczyść zasoby Docker
docker-compose down -v
docker system prune -a

# Uruchom ponownie
docker-compose up -d
```

### Problem: Database connection failed
```bash
# Sprawdź czy PostgreSQL działa
docker-compose ps postgres

# Zobacz logi
docker-compose logs postgres
```

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź [FAQ](./faq.md)
2. Przejrzyj [logi aplikacji](#5-weryfikacja)
3. Skontaktuj się z zespołem deweloperskim

---

**Ostatnia aktualizacja:** 2026-04-23
