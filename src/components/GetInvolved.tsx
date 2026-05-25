import { Mail, HandHeart, CalendarHeart, Gift } from "lucide-react";

export default function GetInvolved() {
  return (
    <section id="get-involved" className="py-20 md:py-28 bg-gradient-to-b from-white to-saffron-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 text-sm font-semibold text-saffron-700 bg-white rounded-full border border-saffron-200 mb-4">
            Be Part of the Change
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900">
            Get Involved
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            Become a part of a thriving community that values culture,
            leadership, and service. Your involvement helps sustain and enrich
            our collective identity and heritage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="group p-8 bg-white rounded-2xl border border-saffron-100 hover:border-saffron-300 hover:shadow-xl transition-all duration-300 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-saffron-100 to-saffron-200 flex items-center justify-center text-saffron-600 mb-5 group-hover:scale-110 transition-transform">
              <HandHeart size={30} />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              Volunteer
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Contribute your time and skills to help organize events, teach
              cultural programs, or support community outreach.
            </p>
          </div>

          <div className="group p-8 bg-white rounded-2xl border border-saffron-100 hover:border-saffron-300 hover:shadow-xl transition-all duration-300 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-temple-100 to-temple-200 flex items-center justify-center text-temple-600 mb-5 group-hover:scale-110 transition-transform">
              <CalendarHeart size={30} />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              Attend Events
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Join our festivals, community meetups, and cultural programs to
              connect and celebrate together.
            </p>
          </div>

          <div className="group p-8 bg-white rounded-2xl border border-saffron-100 hover:border-saffron-300 hover:shadow-xl transition-all duration-300 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-maroon-100 to-maroon-200 flex items-center justify-center text-maroon-600 mb-5 group-hover:scale-110 transition-transform">
              <Gift size={30} />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              Sponsor
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Support our initiatives through sponsorship and help us create
              bigger, better celebrations for the community.
            </p>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-saffron-600 via-saffron-500 to-temple-500 p-10 md:p-16 text-center">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white rounded-full" />
          </div>

          <div className="relative z-10">
            <Mail size={40} className="mx-auto text-white/80 mb-5" />
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
              Ready to Connect?
            </h3>
            <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
              For inquiries, volunteering, or sponsorship opportunities, reach
              out to us. We'd love to hear from you!
            </p>
            <a
              href="mailto:support@bhfcommunity.org"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-saffron-700 bg-white rounded-full hover:bg-saffron-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Mail size={18} />
              support@bhfcommunity.org
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
