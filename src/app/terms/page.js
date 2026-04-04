import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata = {
  title: "Terms & Conditions - Chaman Tour and Travels",
  description: "Terms and Conditions for using Chaman Tour and Travels cab services.",
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

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#181611] font-display flex flex-col">
      <Header activePage="terms" />

      <main className="flex-1">
        <div className="bg-gradient-to-br from-[#1e1a0e] to-[#181611] py-16 px-4 border-b border-white/5">
          <div className="max-w-3xl mx-auto">
            <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary/20 inline-block mb-6">Legal</span>
            <h1 className="text-4xl font-black text-white mb-3">Terms & <span className="text-primary">Conditions</span></h1>
            <p className="text-white/40 text-sm">Last updated: April 2025 · Chaman Tour and Travels</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-14">
          <Section title="Acceptance of Terms">
            <p>By booking a cab, self-drive car, or a driver through Chaman Tour and Travels (chamancab.com), you agree to be bound by these terms and conditions. If you do not agree, please do not use our services.</p>
          </Section>

          <Section title="Booking & Confirmation">
            <p>All bookings are subject to vehicle/driver availability. A booking is only confirmed after you receive a confirmation message or reference ID from us.</p>
            <p>We reserve the right to cancel or modify a booking in case of unforeseen circumstances such as vehicle breakdown, natural disaster, or other force majeure events.</p>
          </Section>

          <Section title="Passenger Responsibilities">
            <p>Passengers must be ready at the pickup location at the scheduled time. Excessive waiting time beyond 30 minutes may incur additional charges.</p>
            <p>Passengers are responsible for any damage caused to the vehicle during the trip.</p>
            <p>Carrying prohibited items, smoking inside the cab, or misbehaving with the driver is strictly not allowed and may result in immediate trip termination without refund.</p>
          </Section>

          <Section title="Pricing & Payments">
            <p>All prices displayed are inclusive of driver allowance and basic tolls unless stated otherwise. Additional highway tolls, state permits, and parking charges will be payable by the passenger.</p>
            <p>For outstation trips, a night halt charge may apply if the journey extends overnight.</p>
            <p>Payment can be made via cash or UPI at time of trip completion unless a prepaid booking is made.</p>
          </Section>

          <Section title="Self Drive Terms">
            <p>A refundable security deposit is required for all self-drive bookings. The deposit will be returned within 48 hours after the vehicle is returned in its original condition.</p>
            <p>The customer must hold a valid Indian driving license. Driving under the influence of alcohol or drugs is strictly prohibited.</p>
            <p>Fuel cost during the rental period is the customer's responsibility.</p>
            <p>Any traffic fines or challans during the rental period are to be borne by the customer.</p>
          </Section>

          <Section title="Limitation of Liability">
            <p>Chaman Tour and Travels shall not be liable for any delays caused by traffic, road conditions, or acts of God.</p>
            <p>We are not responsible for any personal belongings left behind in any vehicle.</p>
          </Section>

          <Section title="Governing Law">
            <p>These terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Lucknow, Uttar Pradesh.</p>
          </Section>

          <Section title="Contact">
            <p>For questions regarding these terms, contact us at <a href="https://wa.me/916386499107" className="text-primary hover:underline">+91 6386499107</a>.</p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
