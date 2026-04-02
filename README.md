# 🏋️ GymGenius - AI-Powered Fitness & Social Platform

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![.NET](https://img.shields.io/badge/.NET-10.0-purple)
![React Native](https://img.shields.io/badge/React_Native-Expo-black?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-blue?logo=postgresql)

Una piattaforma fitness moderna, veloce e scalabile. L'applicazione permette di tenere traccia di allenamenti, diete, calorie e macro, integrando pesantemente l'Intelligenza Artificiale per la generazione automatica di schede personalizzate. In futuro, includerà un modulo social geolocalizzato per connettere gli appassionati di fitness nella stessa zona.

## ✨ Funzionalità Core (In via di sviluppo)

* **Generazione AI:** Diete e schede di allenamento basate su prompt elaborati dal backend (integrazione Gemini/LLM).
* **Tracking Avanzato:** Monitoraggio di carichi, calorie e macronutrienti.
* **Social & Geolocalizzazione (WIP):** Discovery di utenti nella propria zona tramite query spaziali ad alte prestazioni.
* **Supporto Offline:** Accesso alle schede di allenamento in palestra anche senza connessione internet.

## 🛠️ Stack Tecnologico

### Frontend (Mobile)
* **Framework:** React Native + Expo
* **Linguaggio:** TypeScript
* **Styling:** NativeWind (Tailwind CSS per React Native)
* **Data Fetching & Cache:** TanStack Query (React Query)
* **State Management (UI):** Zustand
* **Sicurezza:** `expo-secure-store` (per JWT auth)

### Backend & API
* **Framework:** ASP.NET Core Web API (.NET 10)
* **Linguaggio:** C#
* **Autenticazione:** ASP.NET Core Identity (JWT Access & Refresh Tokens)
* **Architettura:** Vertical Slice Architecture

### Database & Infrastruttura
* **Database Relazionale:** PostgreSQL
* **Estensione Spaziale:** PostGIS
* **ORM:** Entity Framework Core (EF Core 10)
* **Storage File:** MinIO (S3-compatible, containerizzato per sviluppo locale)

---

## 🚀 Prerequisiti

Per eseguire questo progetto in locale, assicurati di avere installato:

* [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
* [Node.js](https://nodejs.org/) (v18 o superiore)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (per far girare DB e Storage)
* [Expo CLI](https://docs.expo.dev/get-started/installation/)
* Ideali: **JetBrains Rider** (Backend) e **WebStorm / IntelliJ** (Frontend)

## ⚙️ Setup Sviluppo Locale

### 1. Avvio Infrastruttura (Docker)
Nella cartella root del progetto backend, troverai il file `docker-compose.yml` che avvia PostgreSQL (con PostGIS) e MinIO.

```bash
docker-compose up -d
