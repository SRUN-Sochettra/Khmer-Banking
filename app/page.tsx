// app/page.tsx
import Link from "next/link"
import {
  Building2,
  ShieldCheck,
  ArrowRightLeft,
  FileText,
  Smartphone,
  ChevronRight,
  Lock,
  Zap,
  Globe,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-primary-foreground">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">KhmerBank</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-primary-foreground text-sm transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Open Account
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-border rounded-full px-4 py-1.5 text-primary text-sm font-medium mb-8">
          <ShieldCheck className="w-4 h-4" />
          Secure Digital Banking for Cambodia
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
          Banking that{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-blue-600">
            works for you
          </span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Send money instantly, download statements, and manage your
          finances — all secured with OTP verification and end-to-end
          encryption.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 rounded-xl transition-colors text-lg w-full sm:w-auto justify-center"
          >
            Get Started Free
            <ChevronRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 border border-muted hover:border-muted-foreground hover:bg-card text-foreground font-semibold px-8 py-4 rounded-xl transition-colors text-lg w-full sm:w-auto justify-center"
          >
            Sign In
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-14 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            OTP Protected Transfers
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            256-bit SSL Encrypted
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            Instant Transfers
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            USD & KHR Accounts
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="border-t border-border bg-muted/50">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A complete digital banking experience built for
              modern Cambodia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<ArrowRightLeft className="w-6 h-6 text-primary" />}
              iconBg="bg-primary/10"
              title="Instant Transfers"
              description="Send money to any KhmerBank account instantly. Every transfer is secured with a one-time password sent to your email."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-primary" />}
              iconBg="bg-primary/10"
              title="OTP Security"
              description="Two-factor authentication on every transaction. Your money never moves without your explicit approval."
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6 text-primary" />}
              iconBg="bg-primary/10"
              title="PDF Statements"
              description="Download official monthly bank statements as PDF. Every download is logged for compliance and your security."
            />
            <FeatureCard
              icon={<Smartphone className="w-6 h-6 text-accent" />}
              iconBg="bg-accent/10"
              title="KHQR Payments"
              description="Receive payments via KHQR — Cambodia&apos;s national QR payment standard powered by Bakong."
            />
            <FeatureCard
              icon={<Lock className="w-6 h-6 text-destructive" />}
              iconBg="bg-destructive/10"
              title="Audit Trail"
              description="Every action on your account is logged. View your full security history in the Security Center at any time."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6 text-primary" />}
              iconBg="bg-primary/10"
              title="Multi-Currency"
              description="Hold and transfer both USD and KHR. Built for the Cambodian dual-currency economy."
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get started in minutes
          </h2>
          <p className="text-muted-foreground text-lg">
            No paperwork. No branch visits. 100% online.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard
            number="01"
            title="Create Account"
            description="Register with your name, email, and Cambodian phone number. Takes less than 2 minutes."
          />
          <StepCard
            number="02"
            title="Verify Your Email"
            description="Enter the 6-digit OTP sent to your email to activate your account securely."
          />
          <StepCard
            number="03"
            title="Start Banking"
            description="Send money, download statements, and manage your finances from anywhere."
          />
        </div>
      </section>

      {/* ── Upcoming Features ─────────────────────────────── */}
      <section className="border-t border-border bg-muted/50">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Coming Soon
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              We are constantly working to improve KhmerBank. Here is what is on the roadmap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-primary" />}
              iconBg="bg-primary/10"
              title="Instant Loan Approvals"
              description="Get access to credit in seconds with our upcoming AI-powered loan approval system."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-primary" />}
              iconBg="bg-primary/10"
              title="Advanced Security Analytics"
              description="Detailed insights and AI monitoring for your account activity."
            />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="bg-linear-to-br from-blue-600/20 to-blue-800/20 border border-border rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
              Join KhmerBank today and experience digital banking
              built for Cambodia.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Open Your Account
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="bg-primary p-1 rounded">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-primary-foreground">KhmerBank</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm">Phnom Penh, Cambodia</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} KhmerBank. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  )
}

// ─── Sub Components ───────────────────────────────────────────

function FeatureCard({
  icon,
  iconBg,
  title,
  description,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
}) {
  return (
    <div className="bg-card border border-border hover:border-muted rounded-2xl p-6 transition-colors group">
      <div className={`${iconBg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-primary-foreground font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="relative text-center">
      <div className="text-6xl font-black text-primary/20 mb-4">{number}</div>
      <h3 className="text-primary-foreground font-semibold text-xl mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}