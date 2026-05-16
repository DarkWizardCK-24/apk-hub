<div align="center">

# 📦 APK Hub

### _The developer-first platform for Android APK distribution_

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

> 🤖 **Upload** · 📥 **Share** · 🔍 **Discover** · 📊 **Track** — All in one terminal-styled hub.

---

![APK Hub Banner](https://capsule-render.vercel.app/api?type=waving&color=FF6B2B&height=200&section=header&text=APK%20Hub&fontSize=60&fontAlignY=35&animation=fadeIn&fontColor=ffffff&desc=Android%20Build%20Distribution%20Platform&descAlignY=55&descSize=20)

</div>

---

## 🚀 What is APK Hub?

**APK Hub** is a full-stack web application built for Android developers who want a clean, fast, and powerful way to distribute their APK builds. No clunky dashboards — just a terminal-aesthetic interface that gets out of your way.

Whether you're sharing a debug build with your QA team or publishing a public release for early adopters, APK Hub has you covered.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **GitHub Auth** | Secure sign-in via Supabase Auth with GitHub OAuth |
| 📤 **APK Upload** | Upload `.apk` files with metadata, icons, and changelogs |
| 🗂️ **Version Tracking** | Multiple builds per app — debug & release — with version codes |
| 🔍 **Smart Search** | Search and filter by category in real-time |
| 📊 **Download Tracking** | Auto-incremented download counter per build |
| 🔗 **Share Links** | Generate shareable links for any build |
| 🌐 **Public / Private** | Toggle app visibility — share what you want |
| 🧾 **Build Metadata** | Min SDK, Target SDK, permissions, SHA-256 checksum |
| 🗃️ **Categories** | Utility, Game, Productivity, Social, Media, Finance, Education |
| 🖥️ **Terminal UI** | Developer-first terminal aesthetic with neon orange & cyan accents |
| ⚡ **Framer Motion** | Smooth, performant animations throughout |
| 📱 **Responsive** | Works on mobile, tablet, and desktop |

---

## 🛠️ Tech Stack

```
📦 APK Hub
├── 🌐 Framework     → Next.js 16 (App Router)
├── ⚛️  UI Library    → React 19
├── 🎨 Styling       → Tailwind CSS v4
├── 🗃️  Database      → Supabase (PostgreSQL)
├── 🔐 Auth          → Supabase Auth (GitHub OAuth)
├── 📁 Storage       → Supabase Storage
├── ✨ Animations    → Framer Motion
├── 🔔 Toasts        → React Hot Toast
├── 🧠 Language      → TypeScript
└── 🎯 Icons         → React Icons
```

---

## 🗂️ Project Structure

```
apk-hub/
├── 📁 app/
│   ├── 📄 page.tsx              # Browse / Home page
│   ├── 📄 layout.tsx            # Root layout
│   ├── 📁 apps/[id]/            # App detail page
│   ├── 📁 upload/               # APK upload page
│   ├── 📁 dashboard/            # User dashboard
│   ├── 📁 explore/              # Explore all apps
│   ├── 📁 login/                # Login page
│   ├── 📁 register/             # Register page
│   ├── 📁 share/[token]/        # Shareable build link
│   └── 📁 api/auth/callback/    # OAuth callback
├── 📁 components/
│   ├── 📁 apk/                  # APK-specific components
│   ├── 📁 auth/                 # Auth components
│   ├── 📁 home/                 # Landing page sections
│   ├── 📁 layout/               # Navbar & Footer
│   └── 📁 ui/                   # Reusable UI primitives
├── 📁 lib/
│   ├── 📄 db.ts                 # Database helpers & types
│   ├── 📄 supabase.ts           # Supabase client
│   ├── 📄 supabase-server.ts    # Server-side Supabase
│   └── 📁 supabase/             # Schema & config
├── 📁 context/
│   └── 📄 AuthContext.jsx       # Global auth context
└── 📁 supabase/
    └── 📄 schema.sql            # Database schema
```

---

## ⚙️ Getting Started

### Prerequisites

- 🟢 **Node.js** v18+
- 📦 **npm** or **yarn**
- 🗄️ **Supabase** account (free tier works great)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/DarkWizardCK-24/apk-hub.git
cd apk-hub
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Set up environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> 💡 Get these from your [Supabase dashboard](https://supabase.com) → Project Settings → API

### 4️⃣ Set up the database

Run the SQL schema in your Supabase SQL editor:

```bash
# The schema is located at:
supabase/schema.sql
```

Or run the setup script:

```bash
node setup-db.mjs
```

### 5️⃣ Set up Supabase Storage

Create a storage bucket named **`apk-files`** in your Supabase project with public access enabled.

### 6️⃣ Configure GitHub OAuth

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Enable **GitHub** and add your GitHub OAuth App credentials
3. Set the callback URL to: `https://your-domain.com/auth/callback`

### 7️⃣ Run the dev server

```bash
npm run dev
```

> 🌐 Opens at **http://localhost:3010**

---

## 📋 Database Schema

```sql
-- Core tables
✅ profiles          -- User profiles linked to Supabase Auth
✅ apk_apps          -- App registry (name, slug, category, tags...)
✅ apk_builds        -- Build records (version, file_url, SHA-256...)
```

**`apk_apps`** fields:
- `name`, `slug`, `description`, `package_name`
- `icon_url`, `category`, `tags[]`
- `is_public` — toggle visibility

**`apk_builds`** fields:
- `version_name`, `version_code`
- `file_url`, `file_size`, `sha256`
- `build_type` — `debug` | `release`
- `min_sdk`, `target_sdk`, `permissions[]`
- `download_count` — auto-incremented via RPC

---

## 🎨 UI Design

APK Hub uses a **terminal-inspired dark aesthetic** with:

- 🟠 **Neon Orange** (`#FF6B2B`) — primary accent
- 🔵 **Cyan Glow** (`#00E5FF`) — secondary accent
- 🖤 **Deep Navy** (`#0B1020`) — background
- 🔤 **Monospace font** — developer feel throughout

---

## 🔑 Key Pages

| Route | Description |
|---|---|
| `/` | Browse all public APKs with search & filters |
| `/upload` | Upload a new app or build (auth required) |
| `/apps/[id]` | App detail with build history & downloads |
| `/dashboard` | Your uploaded apps (private dashboard) |
| `/explore` | Explore all apps by category |
| `/share/[token]` | Shareable link for a specific build |
| `/login` | Sign in with GitHub |

---

## 📦 App Categories

```
🔧 Utility     🎮 Game        📈 Productivity   💬 Social
🎵 Media       💰 Finance     🎓 Education      🔮 Other
```

---

## 🚢 Deployment

### Deploy on Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/DarkWizardCK-24/apk-hub)

1. Connect your GitHub repo to Vercel
2. Add your environment variables in Vercel dashboard
3. Deploy! 🚀

---

## 📜 Scripts

```bash
npm run dev       # Start dev server on port 3010
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. 🍴 Fork the repo
2. 🌿 Create a feature branch (`git checkout -b feature/awesome-feature`)
3. 💾 Commit your changes (`git commit -m 'Add awesome feature'`)
4. 📤 Push to the branch (`git push origin feature/awesome-feature`)
5. 🔁 Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [DarkWizardCK-24](https://github.com/DarkWizardCK-24)**

![Footer](https://capsule-render.vercel.app/api?type=waving&color=FF6B2B&height=120&section=footer)

⭐ **Star this repo if you found it useful!** ⭐

</div>