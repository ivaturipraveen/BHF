import { Calendar, Clock, MapPin, Ticket, ExternalLink } from "lucide-react";
import { events } from "../data/content";

export default function Events() {
  return (
    <section id="events" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 text-sm font-semibold text-saffron-700 bg-saffron-50 rounded-full border border-saffron-200 mb-4">
            Mark Your Calendar
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900">
            Upcoming Events
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join us in celebrating our rich cultural traditions together
          </p>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {events.map((event, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl border border-saffron-100 bg-gradient-to-br from-white to-saffron-50/30 hover:shadow-xl transition-all duration-300"
              >
                {/* Decorative top bar */}
                <div className="h-2 bg-gradient-to-r from-saffron-400 via-temple-400 to-saffron-500" />

                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-serif font-bold text-gray-900">
                      {event.title}
                    </h3>
                    {event.isPast && (
                      <span className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded-full">
                        Past Event
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar size={18} className="text-saffron-500 shrink-0" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Clock size={18} className="text-saffron-500 shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin size={18} className="text-saffron-500 shrink-0" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Ticket size={18} className="text-saffron-500 shrink-0" />
                      <span>{event.entry}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 leading-relaxed mb-6">
                    {event.description}
                  </p>

                  {event.rsvpLink && !event.isPast && (
                    <a
                      href={event.rsvpLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-saffron-500 to-saffron-600 rounded-full hover:from-saffron-600 hover:to-saffron-700 transition-all shadow-md hover:shadow-lg"
                    >
                      RSVP Now
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-saffron-50/50 rounded-2xl border border-saffron-100">
            <Calendar size={48} className="mx-auto text-saffron-300 mb-4" />
            <p className="text-xl text-gray-500">
              New events coming soon! Stay tuned.
            </p>
          </div>
        )}

        {/* Festivals grid */}
        <div className="mt-20">
          <h3 className="text-2xl font-serif font-bold text-gray-900 text-center mb-10">
            Festivals We Celebrate
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Diwali", emoji: "🪔", desc: "Festival of Lights" },
              { name: "Holi", emoji: "🎨", desc: "Festival of Colors" },
              { name: "Navratri", emoji: "💃", desc: "Nine Nights of Dance" },
              { name: "Janmashtami", emoji: "🙏", desc: "Birth of Krishna" },
              { name: "Ganesh Chaturthi", emoji: "🐘", desc: "Lord Ganesha" },
              { name: "Makar Sankranti", emoji: "🪁", desc: "Harvest Festival" },
              { name: "Ugadi", emoji: "🌿", desc: "New Year" },
              { name: "Raksha Bandhan", emoji: "🧵", desc: "Bond of Protection" },
            ].map((festival, idx) => (
              <div
                key={idx}
                className="group p-5 bg-gradient-to-br from-white to-saffron-50/50 rounded-xl border border-saffron-100 hover:border-saffron-300 hover:shadow-md transition-all text-center"
              >
                <div className="text-3xl mb-2">{festival.emoji}</div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  {festival.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">{festival.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
