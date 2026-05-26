import { Mail, HandHeart, CalendarHeart, Gift } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export default function GetInvolved() {
  return (
    <Section id="get-involved" className="bg-cream/60">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 text-sm font-semibold text-saffron bg-white rounded-full mb-4">
            Be Part of the Change
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-indigo">
            Get Involved
          </h2>
          <p className="mt-4 text-lg text-warm-gray leading-relaxed">
            Become a part of a thriving community that values culture,
            leadership, and service. Your involvement helps sustain and enrich
            our collective identity and heritage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-8 bg-white rounded-2xl border border-cream hover:border-saffron/40 transition-colors duration-300 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-cream flex items-center justify-center text-saffron mb-5">
              <HandHeart size={30} />
            </div>
            <h4 className="font-display text-xl font-semibold text-indigo mb-3">
              Volunteer
            </h4>
            <p className="text-warm-gray leading-relaxed">
              Contribute your time and skills to help organize events, teach
              cultural programs, or support community outreach.
            </p>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-cream hover:border-saffron/40 transition-colors duration-300 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-cream flex items-center justify-center text-saffron mb-5">
              <CalendarHeart size={30} />
            </div>
            <h4 className="font-display text-xl font-semibold text-indigo mb-3">
              Attend Events
            </h4>
            <p className="text-warm-gray leading-relaxed">
              Join our festivals, community meetups, and cultural programs to
              connect and celebrate together.
            </p>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-cream hover:border-saffron/40 transition-colors duration-300 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-cream flex items-center justify-center text-saffron mb-5">
              <Gift size={30} />
            </div>
            <h4 className="font-display text-xl font-semibold text-indigo mb-3">
              Sponsor
            </h4>
            <p className="text-warm-gray leading-relaxed">
              Support our initiatives through sponsorship and help us create
              bigger, better celebrations for the community.
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-indigo p-10 md:p-16 text-center">
          <Mail size={40} className="mx-auto text-cream mb-5" />
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-white mb-4">
            Ready to Connect?
          </h3>
          <p className="text-lg text-cream mb-8 max-w-xl mx-auto">
            For inquiries, volunteering, or sponsorship opportunities, reach
            out to us. We&apos;d love to hear from you!
          </p>
          <a
            href="mailto:support@bhfcommunity.org"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-indigo bg-white rounded-full hover:bg-cream transition-colors"
          >
            <Mail size={18} />
            support@bhfcommunity.org
          </a>
        </div>
      </Container>
    </Section>
  );
}
