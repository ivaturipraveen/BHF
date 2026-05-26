import { Calendar, Clock, MapPin, Ticket, ExternalLink } from "lucide-react";
import { events } from "@/data/content";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export default function Events() {
  return (
    <Section id="events" className="bg-white">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 text-sm font-semibold text-saffron bg-cream rounded-full mb-4">
            Mark Your Calendar
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-indigo">
            Upcoming Events
          </h2>
          <p className="mt-4 text-lg text-warm-gray">
            Join us in celebrating our rich cultural traditions together
          </p>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {events.map((event, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl border border-cream bg-cream/30 transition-colors duration-300"
              >
                <div className="h-2 bg-saffron" />

                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-display text-2xl font-semibold text-indigo">
                      {event.title}
                    </h3>
                    {event.isPast && (
                      <span className="px-3 py-1 text-xs font-semibold text-warm-gray bg-white rounded-full">
                        Past Event
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-warm-gray">
                      <Calendar size={18} className="text-saffron shrink-0" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-warm-gray">
                      <Clock size={18} className="text-saffron shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-warm-gray">
                      <MapPin size={18} className="text-saffron shrink-0" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-warm-gray">
                      <Ticket size={18} className="text-saffron shrink-0" />
                      <span>{event.entry}</span>
                    </div>
                  </div>

                  <p className="text-warm-gray leading-relaxed mb-6">
                    {event.description}
                  </p>

                  {event.rsvpLink && !event.isPast && (
                    <a
                      href={event.rsvpLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-saffron rounded-full hover:bg-amber-burnt transition-colors"
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
          <div className="text-center py-16 bg-cream/50 rounded-2xl border border-cream">
            <Calendar size={48} className="mx-auto text-saffron mb-4" />
            <p className="text-xl text-warm-gray">
              New events coming soon! Stay tuned.
            </p>
          </div>
        )}

        <div className="mt-20">
          <h3 className="font-display text-2xl font-semibold text-indigo text-center mb-10">
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
                className="p-5 bg-cream/40 rounded-xl border border-cream hover:border-saffron/40 transition-colors text-center"
              >
                <div className="text-3xl mb-2">{festival.emoji}</div>
                <h4 className="font-semibold text-indigo text-sm">
                  {festival.name}
                </h4>
                <p className="text-xs text-warm-gray mt-1">{festival.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
