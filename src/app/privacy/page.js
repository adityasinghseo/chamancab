import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata = {
  title: "Privacy Policy - Chaman Tour and Travels",
  description: "Privacy Policy for Chaman Tour and Travels - how we handle your data.",
};

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
      <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
      {title}
    </h2>
    <div className="text-white/60 leading-relaxed space-y-3 pl-4">{children}</div>
  </div>
);

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#181611] font-display flex flex-col">
      <Header activePage="privacy" />

      <main className="flex-1">
        <div className="bg-gradient-to-br from-[#1e1a0e] to-[#181611] py-16 px-4 border-b border-white/5">
          <div className="max-w-3xl mx-auto">
            <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary/20 inline-block mb-6">Legal</span>
            <h1 className="text-4xl font-black text-white mb-3">Privacy <span className="text-primary">Policy</span></h1>
            <p className="text-white/40 text-sm">Last updated: April 2025 · Chaman Tour and Travels</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-14">
          <Section title="Information We Collect">
            <p>When you make a booking, we collect your name, mobile number, and email address. This information is used solely to process your booking and communicate trip details.</p>
            <p>We do not collect or store any payment card details. All payment processing is handled by certified third-party payment gateways.</p>
          </Section>

          <Section title="How We Use Your Information">
            <p>Your contact information is used to confirm bookings, send trip updates, and provide customer support.</p>
            <p>We may use your mobile number to send booking confirmation messages via SMS or WhatsApp.</p>
            <p>We do NOT sell, rent, or share your personal information with any third parties for marketing purposes.</p>
          </Section>

          <Section title="OTP Verification">
            <p>For security, we verify your mobile number using a One-Time Password (OTP) before confirming certain bookings. This ensures only you can place a booking using your number.</p>
          </Section>

          <Section title="Data Storage & Security">
            <p>Your booking data is stored securely on our servers. We follow industry-standard practices to protect your data from unauthorized access.</p>
            <p>We retain booking records for a minimum of 12 months for legal and operational compliance.</p>
          </Section>

          <Section title="Cookies">
            <p>Our website uses session cookies to maintain your login state during a browsing session. These cookies are deleted when you close your browser and do not track any personal activity.</p>
          </Section>

          <Section title="Your Rights">
            <p>You have the right to request access to, correction of, or deletion of your personal data held by us. To make such a request, contact us via WhatsApp at <a href="https://wa.me/916386499107" className="text-primary hover:underline">+91 6386499107</a>.</p>
          </Section>

          <Section title="Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of our services constitutes acceptance of the revised policy.</p>
          </Section>

          <Section title="Contact Us">
            <p>For privacy-related queries, reach us at <a href="https://wa.me/916386499107" className="text-primary hover:underline">+91 6386499107</a> or visit our office at Lucknow, Uttar Pradesh.</p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
