# Feed Template

A generic, API-driven template for creating "Pulse-style" daily news apps.
This template is ready for automation via GitHub Actions.

## Features
- **PWA Ready**: Installable, offline-capable.
- **API Driven**: Content driven by JSON payloads via Webhooks.
- **Auto-Build**: GitHub Actions pipeline pre-configured.

## 🚀 Setup

### 1. Initialize
Clone this repo: `git clone <url> feed-template`

### 2. Configure Secrets
To enable the automated deployment pipeline, you must add a Secret to your GitHub Repository:
- **Name**: `PAT`
- **Value**: A Personal Access Token (Classic) with `repo` scope.

### 3. Webhook Setup
Configure your CMS to send a `POST` request to `https://api.github.com/repos/[OWNER]/[REPO]/dispatches`.
- **Event Type**: `publish_content`
- **Payload**: `{ "data": [ ...editions... ] }`

## Development
```bash
npm install
npm run dev
```
