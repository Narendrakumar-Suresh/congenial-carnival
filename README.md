# Congenial Carnival

A modern, feature-rich note-taking application built with Next.js, TypeScript, and Supabase. This application provides a clean, intuitive interface for creating and managing your personal notes with rich text editing capabilities.

## ✨ Features

- **Rich Text Editing** - Built with Tiptap for a powerful writing experience
- **Markdown Support** - Write and preview markdown content
- **Code Highlighting** - Syntax highlighting for code blocks
- **Dark/Light Mode** - Toggle between light and dark themes
- **Real-time Sync** - Notes are automatically saved and synced with Supabase
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Keyboard Shortcuts** - Optimized for power users

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Editor**: Tiptap with various extensions
- **State Management**: React Hooks
- **Type Safety**: TypeScript
- **Linting & Formatting**: Biome

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- pnpm (recommended) or npm
- Supabase account

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/personal-notes.git
   cd personal-notes
   ```

2. Install dependencies

   ```bash
   pnpm install
   # or
   npm install
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase URL and anon key

4. Run the development server

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Deployment

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fpersonal-notes&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20credentials%20needed%20for%20the%20app%20to%20work.&envLink=https%3A%2F%2Fsupabase.com%2Fdocs%2Fguides%2Fgetting-started%2Fquickstarts%2Fnextjs)

### Other Platforms

This is a standard Next.js application and can be deployed to any platform that supports Next.js, including:

- Vercel (recommended)
- Netlify
- AWS Amplify
- Self-hosted on a VPS

## 🧪 Testing

Run the linter:

```bash
pnpm lint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
- [Tiptap](https://tiptap.dev/) - The headless editor framework
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework

---

Made with ❤️ by [Your Name]
