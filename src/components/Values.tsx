import { Globe, Flame, Heart, BookOpen, Landmark } from "lucide-react";
import { coreValues } from "../data/content";

const iconMap = {
  globe: Globe,
  flame: Flame,
  heart: Heart,
  "book-open": BookOpen,
  landmark: Landmark,
} as const;

export default function Values() {
  return (
    <section id="values" className="py-20 md:py-28 bg-gradient-to-b from-saffron-50/60 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 text-sm font-semibold text-saffron-700 bg-white rounded-full border border-saffron-200 mb-4">
            What We Stand For
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900">
            Our Core Values
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            The principles that guide everything we do
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {coreValues.map((value, idx) => {
            const Icon = iconMap[value.icon];
            return (
              <div
                key={idx}
                className="group text-center p-6 bg-white rounded-2xl border border-gray-100 hover:border-saffron-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-saffron-100 to-temple-100 flex items-center justify-center text-saffron-600 mb-4 group-hover:from-saffron-200 group-hover:to-temple-200 transition-all duration-300">
                  <Icon size={28} />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {value.title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
