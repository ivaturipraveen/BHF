import { ArrowDown } from "lucide-react";
import { siteConfig } from "../data/content";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-saffron-50 via-white to-temple-50" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-saffron-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-temple-200/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

      {/* Rangoli-inspired decorative pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-2 border-saffron-900 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-saffron-900 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border-2 border-saffron-900 rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Om symbol as decorative element */}
        <div className="mb-6 text-saffron-400 text-5xl font-serif select-none opacity-60">
          ॐ
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-gray-900 leading-tight tracking-tight">
          {siteConfig.name}
        </h1>

        <div className="mt-6 flex items-center justify-center gap-3 text-saffron-600 font-medium text-base sm:text-lg">
          <span>Preserving Traditions</span>
          <span className="w-1.5 h-1.5 rounded-full bg-saffron-400" />
          <span>Strengthening Community</span>
          <span className="w-1.5 h-1.5 rounded-full bg-saffron-400" />
          <span>Celebrating Culture</span>
        </div>

        <p className="mt-8 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          A vibrant community dedicated to preserving, celebrating, and promoting
          the rich heritage of Bharat for present and future generations.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#about"
            className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-saffron-500 to-saffron-600 rounded-full hover:from-saffron-600 hover:to-saffron-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Discover Our Mission
          </a>
          <a
            href="#events"
            className="px-8 py-4 text-base font-semibold text-saffron-700 bg-white border-2 border-saffron-200 rounded-full hover:bg-saffron-50 hover:border-saffron-300 transition-all"
          >
            Upcoming Events
          </a>
        </div>

        <a
          href="#about"
          className="inline-flex items-center justify-center mt-16 w-10 h-10 rounded-full border-2 border-saffron-300 text-saffron-500 animate-bounce hover:bg-saffron-50 transition-colors"
          aria-label="Scroll to about section"
        >
          <ArrowDown size={20} />
        </a>
      </div>
    </section>
  );
}
