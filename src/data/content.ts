export const siteConfig = {
  name: "Bharatiya Heritage Foundation",
  shortName: "BHF",
  tagline: "Preserving Traditions | Strengthening Community | Celebrating Culture",
  email: "support@bhfcommunity.org",
  phone: "(707) 555-0142",
  address: "Fairfield, CA",
  donateHref: "/donate",
  copyright: `© ${new Date().getFullYear()} Bharatiya Heritage Foundation. All Rights Reserved.`,
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Get Involved", href: "/get-involved" },
  { label: "Blog", href: "/blog" },
];

export const vision = {
  title: "Our Vision",
  description:
    "To cultivate a vibrant and inclusive community that preserves, celebrates, and promotes Bharatiya heritage while empowering kids and youth with cultural values, leadership skills, and a deep-rooted sense of identity.",
};

export const missionItems = [
  {
    title: "Building Community",
    description:
      "Organizing networking events, family meetups, and collaborative forums to foster strong relationships and support systems.",
    icon: "users" as const,
  },
  {
    title: "Celebrating Culture",
    description:
      "Hosting grand festivals such as Diwali, Navratri, Holi, and Janmashtami, fostering unity and joy in the community.",
    icon: "sparkles" as const,
  },
  {
    title: "Empowering Youth",
    description:
      "Providing leadership training, heritage learning, and mentorship opportunities that build confidence, character, and strong identity.",
    icon: "graduation-cap" as const,
  },
  {
    title: "Connecting Generations",
    description:
      "Creating meaningful intergenerational interactions where traditions, wisdom, and values are shared and preserved.",
    icon: "heart-handshake" as const,
  },
  {
    title: "Serving Society",
    description:
      "Engaging in humanitarian efforts such as food drives, senior assistance programs, and volunteer-driven community service initiatives.",
    icon: "hand-helping" as const,
  },
];

export const coreValues = [
  {
    title: "Unity in Diversity",
    description: "Respecting and celebrating all regional cultures of Bharat.",
    icon: "globe" as const,
  },
  {
    title: "Dharma",
    description:
      "Educate and promote Dharmic way of life — living with integrity, responsibility, and ethical values.",
    icon: "flame" as const,
  },
  {
    title: "Seva",
    description:
      "Upholding selfless service and a commitment to social good.",
    icon: "heart" as const,
  },
  {
    title: "Education & Growth",
    description:
      "Encouraging lifelong learning in Dharmic culture, history, contributions to science, technology, arts, literature, and leadership.",
    icon: "book-open" as const,
  },
  {
    title: "Heritage Preservation",
    description:
      "Honoring Bharatiya traditions by understanding Dharmic philosophies and transferring this knowledge to future generations while evolving with modern times.",
    icon: "landmark" as const,
  },
];

export interface Event {
  title: string;
  date: string;
  time: string;
  location: string;
  entry: string;
  description: string;
  rsvpLink?: string;
  isPast: boolean;
}

export const events: Event[] = [
  {
    title: "Holi Celebration 2026",
    date: "Mar 15, 2026",
    time: "2:00 PM - 6:00 PM",
    location: "Cordelia Community Park, Fairfield - CA",
    entry: "Free Entry with RSVP Only",
    description:
      "Let's Celebrate Holi (Festival of Colors) with Free Food, Organic Colors, Music, Dance & Games. Hosted by FHT and BHF.",
    rsvpLink: "https://tinyurl.com/Holi2026-BHF-FHT",
    isPast: true,
  },
];
