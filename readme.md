<div align="center">

# EntryHive

**University entry test prep, built for Pakistani students.**

[![Live](https://img.shields.io/badge/live-entryhive--pak.vercel.app-2E7D32?style=flat-square)](https://entryhive-pak.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: Attribution-NonCommercial](https://img.shields.io/badge/License-Attribution--NonCommercial-orange.svg?style=flat-square)](./LICENSE)

[Live Demo](https://entryhive-pak.vercel.app) · [Report a Bug](#) · [Request a Feature](#)

</div>

<br>

## About

Pakistani students preparing for university entry tests (NAT, MDCAT, ECAT, and university-specific exams) are stuck choosing between expensive academies and scattered, unreliable free resources. **EntryHive** closes that gap — one platform with structured practice, spaced repetition, and real past papers, built around how these tests actually work.

Since launch, EntryHive has grown to **600+ users**, with strong conversion from free to paid plans.

<br>

## Features

| | |
|---|---|
| 📝 **Real Past Papers** | Structured practice questions sourced from real past papers — Air University, FAST, and more |
| 🧠 **Spaced Repetition** | Flashcards built on an SM-2 algorithm, so concepts stick instead of getting crammed |
| 📅 **Personalized Study Plans** | Plans generated around a student's timeline and target test |
| 🎁 **Referral Rewards** | Students share EntryHive and earn rewards for it |
| 📊 **Admin Dashboard** | Internal tooling for content management and platform analytics |

<br>

## Tech Stack

- **Frontend:** Next.js, Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, RPC functions)
- **Hosting:** Vercel
- **Mobile:** Android app (Capacitor-based)

<br>

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase project (URL + keys)
- Android Studio (only if building the mobile app)

### Installation

```bash
# Clone the repo
git clone https://github.com/basitadnan/entryhive.git
cd entryhive

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase URL and keys
```

### Running locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

### Building the Android app

```bash
npx cap sync android
npx cap open android
```

Then build and run from Android Studio.

<br>

## Contributing

Contributions are welcome. Please open an issue to discuss significant changes before submitting a pull request.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your branch and open a PR

<br>

## Status

🟢 Actively developed and maintained — new features and content shipped regularly based on user feedback.

<br>

## License

Distributed under an Attribution-NonCommercial license. You're free to use, modify, and share this code — with credit to the original author — but it may not be sold or used commercially without permission. See [`LICENSE`](./LICENSE) for full terms.

<br>

<div align="center">

Built by [Abdul Basit](https://github.com/basitadnan)

</div>
