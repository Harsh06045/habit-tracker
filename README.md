# 📊 HabitFlow — Build Better Habits, One Day at a Time

A modern, full-stack habit tracking platform built with **React Native / Expo / Capacitor**, **Spring Boot**, **PostgreSQL / H2**, and **Redis**. Features real-time streak tracking, gamification (points, badges, levels), offline-first synchronization, automated habit reminders, and a modern landing website with direct Android APK downloads.

---

### 📲 Download Android APK (Direct Install)

> [!IMPORTANT]
> **To install the app on your Android phone, download the `.apk` file directly:**
> - ⚠️ **Do NOT click "Download ZIP" on GitHub** — that downloads the raw source code!
> - ⚠️ **Do NOT "Extract" the `.apk` file** — an APK is an installer package. Simply tap it on your phone and choose **Install**!

👉 **[Download HabitFlow.apk (Direct Installer)](https://github.com/Harsh06045/habit-tracker/raw/main/HabitFlow.apk)** *(6.77 MB)*

#### 📱 How to Install on Android:
1. Tap the link above to download **`HabitFlow.apk`** to your phone.
2. When the download finishes, tap the notification or open your phone's **Files / Downloads** app.
3. Tap **`HabitFlow.apk`** (do not choose extract).
4. Tap **Install** (if prompted to allow unknown apps, enable permission for your browser/file manager).
5. Open **HabitFlow** and enjoy tracking habits!

---

## 🌟 Key Features

- **📱 Mobile App & Web App**: Built with React Native & Expo. Works as an Android APK, iOS app, and Web application.
- **🔐 Multi-User Security**: Spring Security 6 with JWT (Access & Refresh tokens), BCrypt password hashing, and user data isolation.
- **🔥 Streak Calculation Engine**: Tracks current streaks, longest streaks, daily/weekly completion rates, and historical logs.
- **🏆 Gamification System**: Earn points for habit completions, unlock achievements (First Step, 7-Day Streak, 30-Day Master, Habit Machine, Century Club), and level up.
- **📶 Offline-First Sync**: Local persistence with AsyncStorage and background sync queue that syncs changes when internet returns.
- **🔔 Smart Reminders & Notifications**: Scheduled habit reminders and push notification tokens.
- **⚡ High Performance Caching**: Redis caching with cache-aside pattern for statistics, today's habits, and streak metrics.
- **🌐 Landing Website**: Marketing landing page with interactive previews, feature highlights, and direct 1-click APK download.
- **🐳 Docker Ready**: Multi-stage Dockerfile and `docker-compose.yml` for containerized deployment.

---

## 🏗️ Architecture

```
                      📱 Mobile App (React Native / Capacitor APK)
                                    │
                                    │ HTTPS / REST
                                    ▼
                         ┌────────────────────┐
                         │ Spring Boot 3.4/4.1│
                         │ Backend REST API   │
                         └─────────┬──────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
             ┌──────────────┐              ┌──────────────┐
             │  PostgreSQL  │              │    Redis     │
             │   Database   │              │ Cache Layer  │
             └──────────────┘              └──────────────┘
```

---

## 📂 Project Structure

```
├── backend/                  # Spring Boot backend
│   ├── src/main/java/com/habittracker/
│   │   ├── config/           # Security, Cache, Web, Redis config
│   │   ├── controller/       # REST Controllers (Auth, Habit, Stats, Gamification, Sync, etc.)
│   │   ├── dto/              # Request / Response DTOs
│   │   ├── entity/           # JPA Entities (User, Habit, Completion, Badge, Token, etc.)
│   │   ├── repository/       # Spring Data JPA Repositories
│   │   ├── security/         # JWT filter, UserDetailsService, Token provider
│   │   └── service/          # Business logic & services
│   ├── src/test/             # Integration tests (JUnit 5, Mockito, SpringBootTest)
│   └── pom.xml
│
├── src/                      # React Native / Expo Frontend
│   ├── components/           # Reusable UI components
│   ├── context/              # Auth, Habit, Theme contexts
│   ├── screens/              # Splash, Login, Home, Add/Edit, Detail, Progress, Settings
│   ├── services/             # API client, Offline sync, Notifications
│   └── types/                # TypeScript interfaces
│
├── website/                  # React + Vite Marketing Website
│   ├── src/                  # Landing page components & styles
│   └── public/               # Static assets & HabitFlow.apk
│
├── android/                  # Native Android Capacitor Project (compileSdk 35)
├── docker-compose.yml        # Multi-container deployment (Spring Boot + Postgres + Redis)
├── Dockerfile                # Production backend container build
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+
- **Java JDK**: 17, 21, or 22
- **Maven**: 3.8+ (or use included `mvnw`)
- **Android SDK** (optional, for APK compilation): API 35

### 1. Run the Backend
```bash
cd backend
./mvnw spring-boot:run
```
API runs on `http://localhost:8080/api/v1`. Default profile uses in-memory H2 database for instant local development.

### 2. Run the Mobile / Web App
```bash
npm install
npm run web
```
Web app runs on `http://localhost:8081`.

### 3. Run the Landing Website
```bash
cd website
npm install
npm run dev -- --host --port 5173
```
Website runs on `http://localhost:5173`.

---

## 🧪 Testing

Run automated tests:
```bash
cd backend
./mvnw test
```

---

## 📱 Android APK

The compiled Android APK is located at:
`website/public/habitflow.apk`

To build from source:
```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
