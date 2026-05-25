import {
  Users,
  Sparkles,
  GraduationCap,
  HeartHandshake,
  HandHelping,
} from "lucide-react";
import { vision, missionItems } from "../data/content";

const iconMap = {
  users: Users,
  sparkles: Sparkles,
  "graduation-cap": GraduationCap,
  "heart-handshake": HeartHandshake,
  "hand-helping": HandHelping,
} as const;

export default function About() {
  return (
    <section id="about" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Vision */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block px-4 py-1.5 text-sm font-semibold text-saffron-700 bg-saffron-50 rounded-full border border-saffron-200 mb-4">
            Who We Are
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900">
            {vision.title}
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            {vision.description}
          </p>
        </div>

        {/* Mission */}
        <div className="text-center mb-12">
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
            Our Mission
          </h3>
          <p className="mt-3 text-gray-500">
            BHF is committed to building a stronger Bharatiya community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missionItems.map((item, idx) => {
            const Icon = iconMap[item.icon];
            return (
              <div
                key={idx}
                className="group relative p-8 bg-gradient-to-br from-white to-saffron-50/50 rounded-2xl border border-saffron-100 hover:border-saffron-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-saffron-400 to-saffron-600 flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon size={26} />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
