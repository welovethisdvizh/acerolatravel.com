# Acerola Travel

Static Acerola expedition site with reusable assets, expedition pages, and a Vercel API endpoint for Telegram lead delivery.

## Project Structure

- `index.html` - main landing page.
- `expeditions/` - separate expedition pages.
- `assets/css/` - styles split by section and feature.
- `assets/js/` - browser scripts and expedition data.
- `assets/images/` - all visual assets, including the logo.
- `api/` - Vercel serverless functions.
- `docs/` - setup notes and asset requirements.

## Telegram Leads

The frontend sends form data to `/api/telegram-lead`.

Set these variables in Vercel:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Keep real secrets out of frontend files and commits.
