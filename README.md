# 🌐 Conflux AI — Official Enterprise Web Platform (`confluxai.in`)

[![GitHub License](https://img.shields.io/github/license/Tarunjit45/Conflux-AI?style=flat-square)](LICENSE)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)](https://confluxai.in)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**Conflux AI** (`confluxai.in`) is a production-grade, high-authority digital platform and blog engine. Powered by React 18, Vite, TypeScript, and TailwindCSS, the platform is integrated with an **autonomous 4x daily cloud content pipeline** and Vercel CI/CD for continuous search engine indexation and generative AI citations.

---

## 🌟 Key Platform Features

- **⚡ High-Performance Architecture:** Built with Vite and React 18, delivering instant page loads, smooth framer-motion micro-animations, and 100% Lighthouse score optimization.
- **📚 Text-First Editorial & SEO Engine:** Clean, text-focused typography layout optimized for maximum readability. Removes layout clutters while providing structured H1-H3 sections, key takeaways, and FAQ blocks.
- **🤖 Schema.org `TechArticle` & `FAQPage` JSON-LD:** Structured metadata embedded directly in every article header to ensure instant crawling by Googlebot and reference indexing by LLMs (Gemini, ChatGPT, Perplexity, Claude).
- **💖 Persistent Real Reader Engagement:**
  - **Interactive Like Reactions:** Readers can click `❤️ Like Article` to increment reactions in real time, with browser-level `localStorage` & Supabase persistence.
  - **Reader Discussion System:** Integrated comment submission form allowing genuine visitors to post technical thoughts and join discussions.
- **🔄 Dual DB & Static JSON Fallback:** Fetches content from Supabase REST DB, with seamless fallback to `public/data/articles.json` for 100% uptime reliability on Vercel.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or 20.x
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Tarunjit45/Conflux-AI.git
cd Conflux-AI

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```
Generates the optimized production build in the `dist/` directory.

---

## 📁 Repository Directory Structure

```
Conflux-AI/
├── components/            # Production UI Components & Pages
│   ├── BlogPage.tsx       # Main Blog Feed & Search Page
│   ├── BlogSection.tsx    # Homepage Freshness Layer Feed
│   ├── ArticleDetail.tsx  # Article Reader Page (Markdown Parser + JSON-LD + Comments)
│   └── LandingPage.tsx    # Primary Enterprise Landing Page
├── public/                # Static Assets & Fallback Data
│   └── data/
│       └── articles.json  # Auto-updated daily article JSON feed
├── lib/
│   └── supabase.ts        # Supabase API Client Setup
├── index.html             # HTML5 Entry Point & Meta Tags
├── vercel.json            # Vercel Single-Page App Rewrite Configuration
├── package.json           # Project Dependencies & Build Scripts
└── vite.config.ts         # Vite Bundler Configuration
```

---

## 📄 License & Governance

Licensed under the **MIT License**. See [LICENSE](LICENSE) for details.  
Designed & Developed by **[Tarunjit](https://github.com/Tarunjit45)** for **Conflux AI**.
