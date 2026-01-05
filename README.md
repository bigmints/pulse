# Daily AI Template

A generic, API-driven template for creating "Pulse-style" daily news apps.
This project is designed to be automated via GitHub Actions and Webhooks.

![Demo](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## Features
- **PWA Ready**: Installable on mobile and desktop.
- **API Driven**: Content is pushed via Webhook, not hardcoded.
- **Offline Reading**: Tracks read status and saves progress.
- **Social Sharing**: Generates beautiful share cards on the fly.

## 🚀 Setup Guide

### 1. Template Usage
Clone this repository or use it as a template.

### 2. Configure Automation
This template relies on GitHub Actions to receive content.

1.  **Generate a Personal Access Token (PAT)**:
    - Go to GitHub Settings > Developer Settings > Personal Access Tokens > Tokens (Classic).
    - Generate new token with `repo` scope.
    - **Important**: Go to your Repository Settings > Secrets > Actions. Add a new secret named `PAT` with this token value. This is required for the automation to trigger a deployment.

2.  **Configure CMS Webhook**:
    - **URL**: `https://api.github.com/repos/[YOUR_USENAME]/[REPO_NAME]/dispatches`
    - **Method**: `POST`
    - **Headers**:
        - `Accept`: `application/vnd.github.v3+json`
        - `Authorization`: `Bearer YOUR_GITHUB_PAT`
    - **Body (JSON)**:
        ```json
        {
          "event_type": "publish_content",
          "client_payload": {
            "success": true,
            "data": [
               { "status": "completed", "output": { ...DailyEdition JSON... } }
            ]
          }
        }
        ```

### 3. Personalization
- Update `index.html` title.
- Update `App.tsx` branding (Logo, Text).
- Update `manifest.json` for PWA colors.

## Run Locally

```bash
npm install
npm run dev
```

Since the data folder is initially empty, the app will show an empty state until you run the automation or manually add a file to `public/_data/`.
