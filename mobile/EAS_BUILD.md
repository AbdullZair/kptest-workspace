# KPTEST Mobile — EAS Build Pipeline (US-S-14)

## Konfiguracja jednorazowa

1. `npm install -g eas-cli`
2. `cd mobile && eas login` (Expo account)
3. `eas build:configure` — generuje `extra.eas.projectId` w app.json
4. **GitHub Secrets**: dodaj `EXPO_TOKEN` (z `expo.dev/accounts/[user]/settings/access-tokens`)

## Lokalny build

```bash
cd mobile

# Development (iOS simulator + Android dev client)
eas build --profile development --platform all

# Preview (internal testers, Android APK + iOS simulator)
eas build --profile preview --platform all

# Production (Play Store + App Store)
eas build --profile production --platform all
```

## Submission

```bash
# Po udanym buildzie
eas submit --platform android  # Google Play (internal track domyślnie)
eas submit --platform ios      # App Store Connect (TestFlight)
```

## CI/CD

GitHub Actions workflow `.github/workflows/eas-build.yml`:
- **Push to main** (zmiany w `mobile/`): preview build dla iOS+Android
- **Manual trigger**: można wybrać profile (dev/preview/production) i platform

## Wymagania kont
- Apple Developer Program ($99/rok) — TestFlight
- Google Play Developer ($25 jednorazowo) — Internal Testing
- Expo account (free) — EAS Build
