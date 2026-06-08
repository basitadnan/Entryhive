import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Database, Eye, FileText, ArrowLeft, Scale, UserCheck, AlertTriangle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SECTIONS = [
  {
    id: 'privacy',
    icon: Shield,
    title: 'Privacy Policy',
    color: 'from-emerald-400 to-teal-600',
    content: [
      {
        heading: 'Information We Collect',
        icon: Database,
        text: `When you create an account on NATPrep, we collect the following personal information:

• **Full Name** — used to personalize your experience and display on leaderboards.
• **Email Address** — used for account authentication, password recovery, and important service notifications.
• **Selected Group** — your chosen NAT test group (e.g., NAT-IE, NAT-IM) so we can provide relevant content and study materials.
• **Referral Code** — if you were referred by another user, we store this code to attribute referrals.

We may also automatically collect usage data such as practice session scores, quiz performance, and study activity to power your performance analytics dashboard.`
      },
      {
        heading: 'How We Store Your Data',
        icon: Lock,
        text: `All personal data is securely stored using **Supabase**, a trusted open-source backend platform that provides:

• **Row-Level Security (RLS)** — ensuring each user can only access their own data.
• **Encrypted connections** — all data transmitted between your device and our servers uses TLS/SSL encryption.
• **Secure authentication** — passwords are hashed and never stored in plain text.

Your data is stored on servers managed by Supabase's infrastructure providers and is subject to their security standards and compliance measures.`
      },
      {
        heading: 'How We Use Your Data',
        icon: Eye,
        text: `We use your personal information strictly for the following purposes:

• **Account Management** — to create, maintain, and secure your NATPrep account.
• **Personalized Learning** — to provide group-specific practice questions, study plans, and performance analytics.
• **Leaderboard & Rankings** — to display your name and scores on public leaderboards within the platform.
• **Referral Program** — to track and credit referrals between users.
• **Service Improvement** — to analyze aggregated, anonymized usage patterns to improve our platform.

We do **not** sell, rent, or share your personal data with third parties for marketing purposes.`
      },
      {
        heading: 'Data Retention & Deletion',
        icon: UserCheck,
        text: `We retain your personal data for as long as your account is active. You may request deletion of your account and all associated data at any time by contacting us at the email address provided below.

Upon account deletion, we will permanently remove your personal information from our active databases within 30 days. Some anonymized, aggregated data may be retained for analytical purposes.`
      },
    ]
  },
  {
    id: 'terms',
    icon: Scale,
    title: 'Terms of Service',
    color: 'from-amber-400 to-orange-600',
    content: [
      {
        heading: 'Acceptance of Terms',
        icon: FileText,
        text: `By creating an account or using NATPrep in any way, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the platform.

These terms apply to all users of the platform, including visitors, registered users, and any other persons who access or use NATPrep.`
      },
      {
        heading: 'Account Responsibilities',
        icon: UserCheck,
        text: `When you create an account on NATPrep, you agree to:

• **Provide accurate information** — including your real name and a valid email address.
• **Keep your credentials secure** — you are responsible for maintaining the confidentiality of your password.
• **Not share your account** — each account is for individual use only.
• **Not engage in cheating** — any form of manipulation of scores, leaderboards, or mock test results is prohibited.

We reserve the right to suspend or terminate accounts that violate these terms without prior notice.`
      },
      {
        heading: 'Acceptable Use',
        icon: Shield,
        text: `You agree not to:

• Attempt to gain unauthorized access to other users' accounts or data.
• Use automated scripts, bots, or scrapers to interact with the platform.
• Reproduce, redistribute, or sell any content from NATPrep without written permission.
• Upload harmful, offensive, or misleading content through any platform feature (e.g., feedback forms).
• Interfere with or disrupt the platform's servers, security, or functionality.

Violation of these terms may result in immediate account suspension or permanent ban.`
      },
      {
        heading: 'Disclaimer & Limitation of Liability',
        icon: AlertTriangle,
        text: `NATPrep is an educational preparation tool and is **not** affiliated with, endorsed by, or officially connected to the National Testing Service (NTS) of Pakistan.

• All practice questions and study materials are created independently for educational purposes.
• We do **not** guarantee specific exam results or scores.
• The platform is provided "as is" without warranties of any kind, either express or implied.
• NATPrep shall not be liable for any indirect, incidental, or consequential damages arising from the use of the platform.`
      },
      {
        heading: 'Changes to Terms',
        icon: FileText,
        text: `We reserve the right to modify these Terms of Service and Privacy Policy at any time. When we make significant changes, we will notify users via the platform or email.

Continued use of NATPrep after any modifications constitutes acceptance of the updated terms.`
      },
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function Legal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative selection:bg-primary/30">
      {/* Background */}
      <div className="bg-animation">
        <div className="stars" />
        <div className="stars2" />
      </div>
      <div className="bg-orb-3" />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-border/20 bg-background/50 backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-9 h-9 rounded-lg overflow-hidden border border-primary/40 flex items-center justify-center glow-primary"
          >
            <img src="./logo.png" alt="NAT Prep Logo" className="w-full h-full object-cover" />
          </motion.div>
          <span className="font-bold text-lg tracking-wide text-foreground">
            NAT<span className="text-primary">Prep</span>
          </span>
        </div>
        <Button onClick={() => navigate(-1)} variant="ghost" className="text-muted-foreground hover:text-primary gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </motion.nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
            <Shield className="w-3 h-3" /> Legal & Privacy
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 tracking-tight">
            <span className="text-gradient">Privacy Policy</span>
            <span className="text-foreground"> & </span>
            <span className="text-gradient">Terms of Service</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
            We believe in transparency. Here's exactly what data we collect, how we use it, and the rules that govern our platform.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-3">
            Last updated: June 8, 2026
          </p>
        </motion.div>
      </div>

      {/* Content Sections */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-24">
        {SECTIONS.map((section) => (
          <div key={section.id} className="mb-16">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-8"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg`}>
                <section.icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{section.title}</h2>
            </motion.div>

            {/* Section Content Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="space-y-4"
            >
              {section.content.map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="glass-card rounded-2xl p-6 md:p-8 border-white/5 hover:border-primary/20 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.heading}
                    </h3>
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line legal-content">
                    {item.text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-8 md:p-12 border-primary/20 text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto mb-5 glow-primary">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Questions or Concerns?</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              If you have any questions about our privacy practices or these terms, feel free to reach out to us.
            </p>
            <a
              href="mailto:adnanabdulbasit75@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary font-semibold hover:bg-primary/20 transition-all"
            >
              <Mail className="w-4 h-4" /> adnanabdulbasit75@gmail.com
            </a>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center mt-auto bg-black/40 backdrop-blur-lg">
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-primary/20 flex items-center justify-center mx-auto mb-4">
          <img src="./logo.png" alt="NAT Prep Logo" className="w-full h-full object-cover" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">NAT<span className="text-primary">Prep</span> © 2026</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Built with ❤️ for Pakistani Students</p>
      </footer>
    </div>
  );
}
