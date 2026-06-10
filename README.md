# ⚡ SuperPrompt

> Your all-in-one AI writing toolkit — improve prompts, rephrase text, and humanise AI-generated content instantly.

![SuperPrompt](https://img.shields.io/badge/SuperPrompt-Live-violet?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?style=for-the-badge&logo=netlify)

## 🚀 Live Demo

**[ssuperprompt.netlify.app](https://ssuperprompt.netlify.app)**

---

## ✨ Features

### ✨ Improve
Transform weak AI prompts into powerful, well-structured ones. Choose from 6 tones and get a quality score comparing your original vs improved prompt.

- 6 tone options: General, Formal, Casual, Technical, Creative, Concise
- Prompt scoring: Clarity, Specificity, Effectiveness (1–10)
- Before/after comparison with AI-generated improvement summary

### 🔄 Rephrase
Rewrite any sentence or paragraph in a different tone — for everyday life, not just AI prompts.

- 8 tone options: Formal, Casual, Polite, Assertive, Empathetic, Humorous, Academic, Simple
- Great for emails, messages, essays, and more
- One-click copy to clipboard

### 🧹 Humanise
Detect and remove AI-sounding patterns from any text to make it sound genuinely human.

- AI detection score before and after (e.g. 87% → 23%)
- Removes AI tells: em-dashes, "delve into", "it's worth noting", "furthermore", and more
- Shows detected AI signals as tags
- Works with ChatGPT, Claude, Gemini, and any AI-generated content

### 📋 History
Every session is automatically saved to your browser.

- Filter by feature type (Improve / Rephrase / Humanise)
- Expand any entry to see the full original vs output
- Restore any past session back to the editor
- Keeps last 30 entries

---

## 🛠️ Built With

| Tech | Purpose |
|------|---------|
| [React 18](https://react.dev/) | UI framework |
| [Vite](https://vitejs.dev/) | Build tool |
| [Tailwind CSS v4](https://tailwindcss.com/) | Styling |
| [OpenRouter API](https://openrouter.ai/) | AI model access |
| [Netlify](https://netlify.com/) | Hosting + serverless functions |

---

## 🔧 Run Locally

### Prerequisites
- Node.js 18+
- An [OpenRouter API key](https://openrouter.ai/) (free tier works)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/danveil/SuperPrompt.git
cd SuperPrompt

# 2. Install dependencies
npm install

# 3. Create your environment file
echo "OPENROUTER_API_KEY=your_key_here" > .env

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
SuperPrompt/
├── netlify/
│   └── functions/
│       └── improve.js        # Serverless proxy — keeps API key secure
├── src/
│   ├── App.jsx               # Main app (all tabs and features)
│   ├── main.jsx              # React entry point
│   └── index.css             # Tailwind import
├── .env                      # Local env variables (never committed)
├── .gitignore
├── vite.config.js
└── package.json
```

---

## 🔐 Security

API keys are **never exposed to the browser**. All requests are routed through a Netlify serverless function (`netlify/functions/improve.js`) that injects the key server-side. The `.env` file is listed in `.gitignore` and never committed to the repository.

---

## 🚀 Deploy Your Own

1. Fork this repo
2. Create a free account at [netlify.com](https://netlify.com)
3. Connect your forked repo to Netlify
4. Add your environment variable in **Site Configuration → Environment Variables**:
   ```
   OPENROUTER_API_KEY=your_key_here
   ```
5. Deploy — your site will be live in under a minute

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<div align="center">
  <p>Built with ☕ by <a href="https://github.com/danveil">danveil</a></p>
</div>