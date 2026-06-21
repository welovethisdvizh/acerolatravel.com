# Vercel Telegram Setup

1. Open the project in Vercel and go to Settings -> Environment Variables.
2. Add:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
3. Redeploy the project after adding the variables.
4. The site sends leads to `/api/telegram-lead`.

Do not put the real bot token into frontend files, commits, screenshots, or public issue trackers.
