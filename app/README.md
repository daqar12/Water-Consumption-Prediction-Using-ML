# Water Prediction — Flutter Mobile App

Mobile client for the Water Consumption Prediction system. Mirrors the Next.js web frontend and talks to the same FastAPI backend.

## Architecture (MVC)

```
lib/
  config/         # Theme, API URL, branches/zones
  models/         # Data models
  services/       # API + session (Model layer helpers)
  controllers/    # ChangeNotifier business logic
  views/          # Screens + shared widgets
  main.dart
```

## Screens

| Screen | Role |
|--------|------|
| Login | `POST /login` |
| Dashboard | Overview stats + branch chart |
| Customers | List + CSV/XLSX upload |
| Meter Readings | Prediction history as meter rows |
| ML Predictions | Run predictions + history |
| Users | Admin user CRUD |
| Reports | Summary + charts |
| Settings | Local preferences |

Staff users do not see Users / Reports / Settings (same as web).

## Run

1. Start FastAPI backend on port `8000` (and ML service if predicting).
2. From this folder:

```bash
flutter pub get
flutter run
```

### API URL

- **Android emulator:** `http://10.0.2.2:8000` (default)
- **iOS simulator / desktop:** `http://127.0.0.1:8000`
- **Physical device:** set your PC LAN IP in `lib/config/app_config.dart`

## Design

Uses the same brand colors as the web app (`#0B1FF6` primary, Poppins/Inter via Google Fonts).
