import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata = {
  title: "Refund Policy - Chaman Tour and Travels",
  description: "Refund and Cancellation Policy for Chaman Tour and Travels cab services.",
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

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#181611] font-display flex flex-col">
      <Header activePage="refund" />

      <main className="flex-1">
        <div className="bg-gradient-to-br from-[#1e1a0e] to-[#181611] py-16 px-4 border-b border-white/5">
          <div className="max-w-3xl mx-auto">
            <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary/20 inline-block mb-6">Legal</span>
            <h1 className="text-4xl font-black text-white mb-3">Refund & <span className="text-primary">Cancellation Policy</span></h1>
            <p className="text-white/40 text-sm">Last updated: April 2025 · Chaman Tour and Travels</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-14">
          {/* Quick Summary Table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-12">
            <div className="bg-primary/10 border-b border-white/10 px-6 py-4">
              <h2 className="text-white font-black">Cancellation Summary</h2>
            </div>
            <div className="divide-y divide-white/5">
              {[
                { when: "More than 24 hours before trip", refund: "Full Refund" },
                { when: "12 – 24 hours before trip", refund: "50% Refund" },
                { when: "Less than 12 hours before trip", refund: "No Refund" },
                { when: "Driver/Vehicle Not Available (our fault)", refund: "Full Refund" },
              ].map(({ when, refund }) => (
                <div key={when} className="flex items-center justify-between px-6 py-4">
                  <span className="text-white/60 text-sm">{when}</span>
                  <span className={`font-black text-sm ${refund === "Full Refund" ? "text-green-400" : refund === "50% Refund" ? "text-yellow-400" : "text-red-400"}`}>{refund}</span>
                </div>
              ))}
            </div>
          </div>

          <Section title="Cancellation Policy">
            <p>You may cancel a booking by contacting us via WhatsApp or phone. The cancellation time is calculated from when we confirm receipt of your cancellation request.</p>
            <p>Cancellations must be made before the driver departs from our base location. Once the driver is en route, no cancellation or refund will be provided.</p>
          </Section>

          <Section title="Refund Process">
            <p>Refunds (where applicable) will be processed within <strong className="text-white">5–7 business days</strong> to the original payment method.</p>
            <p>For UPI payments, refunds are typically processed within 2–3 business days.</p>
            <p>We do not issue cash refunds for online payments. Refunds are returned via the same channel used for payment.</p>
          </Section>

          <Section title="Self Drive Deposit Refund">
            <p>The security deposit for self-drive bookings is fully refundable, provided the vehicle is returned on time and in its original condition with no damage.</p>
            <p>Deposit refunds are processed within 48 hours of vehicle return and inspection.</p>
            <p>If damage is found, the cost of repair will be deducted from the deposit before refund.</p>
          </Section>

          <Section title="Non-Refundable Situations">
            <p>No refund will be issued in the following cases:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Cancellation within 12 hours of the trip start time</li>
              <li>No-show by the passenger at the pickup location</li>
              <li>Trip terminated mid-way due to passenger misconduct</li>
              <li>Damage to vehicle during self-drive rental</li>
            </ul>
          </Section>

          <Section title="How to Cancel">
            <p>To cancel a booking, please contact us immediately via:</p>
            <p>WhatsApp: <a href="https://wa.me/916386499107" className="text-primary hover:underline">+91 6386499107</a></p>
            <p>Call: <a href="tel:+916386499107" className="text-primary hover:underline">+91 6386499107</a></p>
            <p>Please have your booking reference ID ready when you contact us.</p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
