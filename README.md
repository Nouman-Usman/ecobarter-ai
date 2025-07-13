```markdown
# EcoBarter AI - Sustainable Trading Platform

A Next.js 14 application that enables users to trade items sustainably with AI-powered matching and negotiation features.

## 🔍 Overview

EcoBarter AI is a community-driven bartering platform designed to promote sustainable living. Users can upload their used items, browse compatible listings, and simulate trade conversations using AI — all without needing a backend.

---

## ✨ Features

- ✅ **Smart Matching System** – Local algorithm suggests highly compatible items
- 💬 **AI Negotiation Chat** – Groq-powered simulated barter conversation
- 📋 **Multi-step Upload Flow** – Easy and guided item listing
- 🧠 **Fallback Logic** – Works without live API in fallback mode
- 📱 **Mobile-First UI** – Fully responsive, clean design
- ♻️ **Eco-Mindset** – Promotes reuse and responsible trade

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ecobarter-ai.git
cd ecobarter-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and add your Groq API key:

```env
GROQ_API_KEY=your_actual_groq_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Get a Groq API Key

- Go to [Groq Console](https://console.groq.com/)
- Sign up or log in
- Navigate to the API Keys tab
- Generate and copy a key
- Paste it in your `.env.local`

### 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app running.

---

## 🧠 AI Integration via Groq

This app uses Groq API to power:

- 🤝 AI-assisted trade negotiation
- ✍️ Auto-generated product descriptions
- 📦 Fair trade advice for item value gaps

---

## 🧪 API Routes

| Endpoint              | Purpose                       |
|-----------------------|------------------------------|
| POST `/api/negotiate` | Simulate negotiation chat    |
| POST `/api/trade-advice` | Get swap recommendations |

---

## 🧱 Project Structure

```
├── app/
│   ├── api/                 # Server actions & API logic
│   ├── upload/              # Upload form flow
│   ├── matches/             # Item matching UI
│   ├── negotiate/           # AI chat UI
│   ├── deal-done/           # Confirmation page
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # Buttons, Inputs, Cards
│   ├── Navbar.tsx
│   └── Footer.tsx
├── lib/
│   ├── aiLogic.js           # Groq logic + fallbacks
│   └── utils.ts
├── data/
│   └── items.json           # Sample items
└── .env.local               # Add your Groq key here
```

---

## 📁 Environment Variables

| Variable             | Description           | Required   |
|----------------------|----------------------|------------|
| GROQ_API_KEY         | Groq API Key         | ✅ Yes     |
| NEXT_PUBLIC_APP_URL  | URL for meta headers | 🔶 Optional|

---

## 🛠️ Tech Stack

- Next.js 14 (App Router)
- TailwindCSS
- shadcn/ui – UI components
- Lucide React – Icon pack
- Groq API – AI chat
- Pexels – Placeholder images

---

## 🧩 Development Notes

- Static generation for fast performance
- No backend or login required
- Works offline with simulated fallback logic
- Placeholder image uploads (not persisted)
- Local data is used for MVP demonstration

---

## 🚀 Deployment

For Vercel, Netlify, or static export:

```bash
npm run build
npm run start
```

Or export as static site:

```bash
npm run export
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch
3. Make your changes
4. Test well
5. Submit a pull request

---

## 📄 License

MIT – Free to use and modify.

Made with 🌱 and 💻 by Areesha
```
