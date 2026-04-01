// ===========================================
// HOME PAGE (Landing Page)
// ===========================================

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import {
  Shield,
  Camera,
  CreditCard,
  Bell,
  CheckCircle,
  ArrowRight,
  Zap,
  Lock,
  BarChart3,
} from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'AI-Powered Detection',
    description:
      'Advanced YOLO-based system detects violations in real-time with high accuracy.',
  },
  {
    icon: Zap,
    title: 'Instant Processing',
    description:
      'Violations are processed and recorded within seconds of detection.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description:
      'Vehicle owners receive instant email notifications with detailed challans.',
  },
  {
    icon: CreditCard,
    title: 'Easy Payments',
    description:
      'Pay fines online securely through our integrated Stripe payment system.',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description:
      'Your data is protected with enterprise-grade security measures.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description:
      'Comprehensive dashboards for citizens, admins, and super admins.',
  },
];

// const stats = [
//   { value: '99.5%', label: 'Detection Accuracy' },
//   { value: '<1s', label: 'Processing Time' },
//   { value: '24/7', label: 'Monitoring' },
//   { value: '100K+', label: 'Violations Processed' },
// ];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span>AI-Powered Traffic Management</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Smart Traffic Violation{' '}
              <span className="gradient-text">Management System</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Revolutionizing traffic enforcement with AI-powered detection,
              automated notifications, and seamless online fine payments.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/register">
                <Button size="lg" className="gap-2 text-base">
                  Start Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-base">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          {/* <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/30 py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything You Need
            </h2>
            <p className="mt-4 text-muted-foreground">
              A comprehensive solution for modern traffic violation management
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-xl border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-muted-foreground">
              Simple, automated, and efficient violation processing
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-4xl">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Detection',
                  description:
                    'AI cameras detect traffic violations in real-time using advanced computer vision.',
                },
                {
                  step: '02',
                  title: 'Notification',
                  description:
                    'Vehicle owners receive instant email notifications with detailed challan PDFs.',
                },
                {
                  step: '03',
                  title: 'Payment',
                  description:
                    'Pay fines easily through our secure online payment portal.',
                },
              ].map((item, index) => (
                <div key={index} className="relative text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="mb-2 font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  {index < 2 && (
                    <div className="absolute right-0 top-8 hidden h-0.5 w-full bg-gradient-to-r from-primary/50 to-transparent md:block md:w-1/2 md:translate-x-1/2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join thousands of citizens managing their traffic violations
              efficiently.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/register">
                <Button size="lg" className="gap-2">
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* <Logo size="sm" /> */}
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TrafficGuard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
