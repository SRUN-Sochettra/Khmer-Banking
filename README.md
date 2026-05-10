# 🏦 Khmer Banking

## ✨ Overview

**Khmer Banking** is a premium, full-stack digital banking application built with the latest modern web technologies. It provides a seamless and secure experience for managing finances, performing transfers, and tracking spending with a beautiful, responsive interface.

The application features deep integration with the **Bakong KHQR** system, making it ideal for the Cambodian market while maintaining a global standard for design and security.

## 🚀 Features

-   **📊 Dynamic Dashboard**: Real-time overview of balance, spending trends, and recent activities.
-   **💸 Secure Transfers**: Peer-to-peer transfers and external account management.
-   **🇰🇭 KHQR Integration**: Generate and scan Bakong-compatible KHQR codes for seamless payments.
-   **📑 Financial Statements**: Generate and download professional PDF statements of your transaction history.
-   **🔒 Robust Security**: Secure authentication, OTP verification, and password reset flows.
-   **🌓 Dark Mode**: Fully responsive design with native dark mode support.
-   **📈 Visual Analytics**: Interactive charts and insights powered by Recharts.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/))
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **Auth**: [NextAuth.js v5](https://next-auth.js.org/)
-   **Emails**: [Resend](https://resend.com/)
-   **Components**: [Shadcn UI](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## ⚙️ Getting Started

### Prerequisites

-   Node.js 18+
-   npm / yarn / pnpm / bun
-   A PostgreSQL database (Neon recommended)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/banking-app.git
    cd banking-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Copy `.env.example` to `.env` and fill in your credentials.
    ```bash
    cp .env.example .env
    ```

4.  **Database Setup:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for a better banking experience.
