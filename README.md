# Red Pine OS

Chat-first platform builder. Users describe their business in natural language, AI assembles a custom management platform from universal components.

**"The bricks are ours. The house is yours."**

## Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript + Tailwind
- **AI Backend**: Flask + Claude API
- **Database**: Supabase (PostgreSQL + Auth + RLS + Storage)
- **Payments**: Stripe (subscriptions + Connect)
- **Email**: Resend
- **Domain**: redpine.systems

## Structure

```
redpine-os/
├── dashboard/      # Next.js app (port 3000)
├── onboarding/     # Flask AI backend (port 5001)
├── supabase/       # SQL migrations
└── design-reference/
```

## Local Development

```bash
# Terminal 1: Dashboard
cd dashboard && npm install && npm run dev

# Terminal 2: Onboarding
cd onboarding && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python app.py
```

## Environment Variables

### Dashboard (`dashboard/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_PRODUCT_ID=
STRIPE_WEBHOOK_SECRET=
STRIPE_CONNECT_CLIENT_ID=
NEXT_PUBLIC_APP_URL=
RESEND_API_KEY=
TOKEN_ENCRYPTION_KEY=
```

### Onboarding (`onboarding/.env`)
```
ANTHROPIC_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```
