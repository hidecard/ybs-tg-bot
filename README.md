# YBS Info Telegram Bot

This bot provides information about YBS bus lines in Yangon. It is built with Telegraf and uses Turso (libSQL) as the database.

## Deployment on Vercel

1. Push this code to GitHub.
2. Connect your GitHub repo to Vercel.
3. Add the following Environment Variables in Vercel:
   - `TELEGRAM_BOT_TOKEN`: Your bot token
   - `TURSO_DB_URL`: `https://ybsdata-hidecatd.aws-ap-northeast-1.turso.io`
   - `TURSO_DB_TOKEN`: Your Turso DB token
4. Once deployed, set your Telegram Webhook to:
   `https://your-vercel-domain.vercel.app/api/bot`

## How to set Webhook

You can set the webhook by calling this URL in your browser:
`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-vercel-domain.vercel.app/api/bot`
