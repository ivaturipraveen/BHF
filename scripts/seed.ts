/* eslint-disable no-console */
import { config as loadDotenv } from 'dotenv';
loadDotenv({ path: '/home/ubuntu/.bw_env' });

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Curated Unsplash URLs — warm, communal, heritage-respectful. Tuned to the
// brand palette; PRD says these are placeholders until BHF supplies final art.
const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const PH: {
  diwali: string | null;
  holi: string | null;
  charity: string;
  hike: string;
  yoga: string;
  kite: string;
  art: string;
  youth: string;
  rangoli: string | null;
  vedic: string;
  hero: string | null;
  community: string;
  portrait1: string;
  portrait2: string;
  portrait3: string;
  portrait4: string;
  portrait5: string;
  portrait6: string;
} = {
  // Festival of lights — broken Unsplash ID, fall back to brand placeholder
  diwali: null,
  // Festival of colors — broken Unsplash ID, fall back to brand placeholder
  holi: null,
  // Seva / charity — community service hands at work
  charity: u('photo-1488521787991-ed7bbaae773c'),
  // Heritage walk / nature / mountains
  hike: u('photo-1551632811-561732d1e306'),
  // Yoga / wellness practice
  yoga: u('photo-1545205597-3d9d02c29597'),
  // Festival lights / kite-feeling celebration
  kite: u('photo-1551731409-43eb3e517a1a'),
  // Art / colors / craft
  art: u('photo-1513364776144-60967b0f800f'),
  // Youth / learning / classroom
  youth: u('photo-1529390079861-591de354faf5'),
  // Rangoli / broken Unsplash ID, fall back to brand placeholder
  rangoli: null,
  // Vedic chanting / spiritual gathering
  vedic: u('photo-1572804013427-4d7ca7268217'),
  // Hero — broken Unsplash ID, fall back to brand placeholder
  hero: null,
  // Generic community / gathering / family
  community: u('photo-1531058020387-3be344556be6'),
  // Portraits (leadership) — kept; warm natural light, professional but human
  portrait1: u('photo-1507003211169-0a1dd7228f2d', 600),
  portrait2: u('photo-1494790108377-be9c29b29330', 600),
  portrait3: u('photo-1500648767791-00dcc994a43e', 600),
  portrait4: u('photo-1573496359142-b8d87734a5a2', 600),
  portrait5: u('photo-1472099645785-5658abf4ff4e', 600),
  portrait6: u('photo-1438761681033-6461ffad8d80', 600),
};

interface EventSeed {
  slug: string;
  title: string;
  description_md: string;
  starts_at: string;
  ends_at: string | null;
  location_name: string;
  location_address: string;
  hero_image_url: string | null;
  type: 'festival' | 'class' | 'charity' | 'youth' | 'other';
  status: 'published';
  rsvp_capacity: number | null;
  members_only: boolean;
  members_early_access_at: string | null;
  allows_dietary_restrictions: boolean;
}

const events: EventSeed[] = [
  {
    slug: 'diwali-2026',
    title: 'Diwali 2026 — Festival of Lights',
    description_md:
      'Join us for an evening of light, music, and shared meals as we celebrate Diwali — the festival of lights. Cultural performances, traditional food, and community connection.',
    starts_at: '2026-10-24T17:00:00Z',
    ends_at: '2026-10-24T22:00:00Z',
    location_name: 'Solano County Fairgrounds',
    location_address: '900 Fairgrounds Dr, Fairfield, CA 94533',
    hero_image_url: PH.diwali,
    type: 'festival',
    status: 'published',
    rsvp_capacity: 500,
    members_only: false,
    members_early_access_at: null,
    allows_dietary_restrictions: true,
  },
  {
    slug: 'holi-2026',
    title: 'Holi 2026 — Festival of Colors',
    description_md:
      'A joyful afternoon of color, music, and dance. Bring your family and friends for this celebration of spring.',
    starts_at: '2026-03-14T11:00:00Z',
    ends_at: '2026-03-14T15:00:00Z',
    location_name: 'Allan Witt Park',
    location_address: '1741 W Texas St, Fairfield, CA 94533',
    hero_image_url: PH.holi,
    type: 'festival',
    status: 'published',
    rsvp_capacity: 300,
    members_only: false,
    members_early_access_at: null,
    allows_dietary_restrictions: false,
  },
  {
    slug: 'holi-2025',
    title: 'Holi 2025',
    description_md:
      'Our 2025 Holi celebration — a beautiful day of color and community at Allan Witt Park.',
    starts_at: '2025-03-16T11:00:00Z',
    ends_at: '2025-03-16T15:00:00Z',
    location_name: 'Allan Witt Park',
    location_address: '1741 W Texas St, Fairfield, CA 94533',
    hero_image_url: PH.holi,
    type: 'festival',
    status: 'published',
    rsvp_capacity: 300,
    members_only: false,
    members_early_access_at: null,
    allows_dietary_restrictions: false,
  },
  {
    slug: 'diwali-2025',
    title: 'Diwali 2025',
    description_md:
      'Our 2025 Diwali celebration brought hundreds of families together for an unforgettable evening of light and music.',
    starts_at: '2025-10-26T17:00:00Z',
    ends_at: '2025-10-26T22:00:00Z',
    location_name: 'Solano County Fairgrounds',
    location_address: '900 Fairgrounds Dr, Fairfield, CA 94533',
    hero_image_url: PH.diwali,
    type: 'festival',
    status: 'published',
    rsvp_capacity: 500,
    members_only: false,
    members_early_access_at: null,
    allows_dietary_restrictions: true,
  },
  {
    slug: 'warm-hearts-charity-drive-2026',
    title: 'Warm Hearts Charity Drive 2026',
    description_md:
      'Our annual coat and blanket drive for neighbors in need. Drop off donations, volunteer to sort and distribute, and share a warm meal with our community.',
    starts_at: '2026-11-08T10:00:00Z',
    ends_at: '2026-11-08T16:00:00Z',
    location_name: 'BHF Community Center',
    location_address: 'Fairfield, CA',
    hero_image_url: PH.charity,
    type: 'charity',
    status: 'published',
    rsvp_capacity: 100,
    members_only: false,
    members_early_access_at: null,
    allows_dietary_restrictions: false,
  },
  {
    slug: 'bhf-community-hike-aug-2026',
    title: 'BHF Community Hike — August 2026',
    description_md:
      'A monthly community hike at Lynch Canyon. All fitness levels welcome. Bring water, sunscreen, and good walking shoes.',
    starts_at: '2026-08-16T08:30:00Z',
    ends_at: '2026-08-16T11:30:00Z',
    location_name: 'Lynch Canyon Open Space',
    location_address: '3100 Lynch Rd, Fairfield, CA 94534',
    hero_image_url: PH.hike,
    type: 'other',
    status: 'published',
    rsvp_capacity: 50,
    members_only: false,
    members_early_access_at: null,
    allows_dietary_restrictions: false,
  },
  {
    slug: 'yoga-meditation-aug-2026',
    title: 'Yoga & Meditation Class — August 2026',
    description_md:
      'A monthly drop-in yoga and meditation class led by community instructors. Mats provided. Suitable for all levels.',
    starts_at: '2026-08-03T18:00:00Z',
    ends_at: '2026-08-03T19:15:00Z',
    location_name: 'BHF Community Center',
    location_address: 'Fairfield, CA',
    hero_image_url: PH.yoga,
    type: 'class',
    status: 'published',
    rsvp_capacity: 30,
    members_only: false,
    members_early_access_at: null,
    allows_dietary_restrictions: false,
  },
  {
    slug: 'kite-festival-2026',
    title: 'Kite Festival 2026',
    description_md:
      'Our annual kite festival celebrates the Indian tradition of Makar Sankranti, with kite-flying for all ages, food, and music.',
    starts_at: '2026-04-19T10:00:00Z',
    ends_at: '2026-04-19T14:00:00Z',
    location_name: 'Rockville Hills Regional Park',
    location_address: 'Rockville Rd, Fairfield, CA 94534',
    hero_image_url: PH.kite,
    type: 'festival',
    status: 'published',
    rsvp_capacity: 200,
    members_only: false,
    members_early_access_at: null,
    allows_dietary_restrictions: false,
  },
  {
    slug: 'members-only-preview-2026',
    title: 'Member preview: Diwali decorations workshop',
    description_md:
      'Members get first access to this hands-on workshop preparing Diwali decorations. Public RSVP opens 48 hours after members.',
    starts_at: '2026-09-15T18:00:00Z',
    ends_at: null,
    location_name: 'BHF Community Center',
    location_address: 'Fairfield, CA',
    hero_image_url: PH.diwali,
    type: 'class',
    status: 'published',
    rsvp_capacity: 30,
    members_only: false,
    members_early_access_at: '2027-01-01T00:00:00Z',
    allows_dietary_restrictions: false,
  },
];

interface ProgramSeed {
  slug: string;
  title: string;
  category: 'cultural' | 'educational' | 'charitable' | 'wellness' | 'youth';
  frequency: 'monthly' | 'annual' | 'rolling';
  short_description: string;
  description_md: string;
  who_for: string;
  schedule_md: string;
  hero_image_url: string | null;
  featured: boolean;
  display_order: number;
}

const programs: ProgramSeed[] = [
  {
    slug: 'writing-and-art-contest',
    title: 'BHF Writing & Art Contest',
    category: 'educational',
    frequency: 'annual',
    short_description:
      'An annual contest encouraging youth to explore Indian heritage through writing and visual art.',
    description_md: `The BHF Writing & Art Contest invites students of all ages to share their interpretation of Indian heritage and Bharatiyatha through original work. Categories include short essays, poetry, painting, and digital art.

Submissions are reviewed by a panel of community mentors and educators. Winning entries are featured at our annual Diwali festival and on the BHF website.

Participation is open to anyone in Solano County and surrounding areas. There is no entry fee — only a deadline.`,
    who_for: 'K–12 and college students',
    schedule_md: 'Submissions open March 1 each year. Deadline: April 30.',
    hero_image_url: PH.art,
    featured: true,
    display_order: 1,
  },
  {
    slug: 'student-boards',
    title: 'BHF Student Boards',
    category: 'youth',
    frequency: 'rolling',
    short_description:
      'Four youth-led boards — Operations, Creative Arts, Leadership, and Mentorship — that give students real responsibility in shaping community programs.',
    description_md: `The BHF Student Boards are the heart of our youth empowerment work. Each board is run by students, for students, with adult mentors providing support rather than direction.

The four boards are: **Operations** (logistics, event production, volunteer coordination), **Creative Arts** (writing, design, performance), **Leadership** (public speaking, project management, community organizing), and **Mentorship** (peer tutoring, onboarding new members).

Applications are reviewed on a rolling basis. We're looking for curiosity, commitment, and a willingness to learn — not perfect resumes.`,
    who_for: 'Middle school through college',
    schedule_md: 'Applications accepted year-round. Boards meet twice a month.',
    hero_image_url: PH.youth,
    featured: true,
    display_order: 2,
  },
  {
    slug: 'warm-hearts-charity-drive',
    title: 'Warm Hearts Charity Drive',
    category: 'charitable',
    frequency: 'annual',
    short_description:
      'An annual coat, blanket, and essentials drive serving unhoused neighbors and families in need.',
    description_md: `Warm Hearts is our largest seva initiative. Each fall we collect coats, blankets, hygiene kits, and non-perishable food, then partner with local shelters and outreach teams to distribute directly to neighbors in need.

In 2025 we served over 400 individuals across Solano County. We're aiming higher in 2026 — and we need volunteers, donors, and sorters to make it happen.

Donations accepted in person at the BHF Community Center and through our online portal.`,
    who_for: 'All ages welcome — families especially encouraged',
    schedule_md: 'Donations collected October–November. Distribution: second week of November.',
    hero_image_url: PH.charity,
    featured: true,
    display_order: 3,
  },
  {
    slug: 'rangoli-contest',
    title: 'Rangoli Contest',
    category: 'cultural',
    frequency: 'annual',
    short_description:
      'A celebration of the traditional Indian art of rangoli, with prizes for creativity, technique, and cultural depth.',
    description_md: `Rangoli is the ancient practice of creating intricate patterns at the entrance of homes using colored powders, rice, and flower petals. Our annual contest brings the tradition to Fairfield with category prizes for youth, family, and open divisions.

Entries are photographed and judged on creativity, technique, and storytelling. Winners receive prizes and have their work featured at our Diwali festival.`,
    who_for: 'Individuals and families',
    schedule_md: 'Held annually in January.',
    hero_image_url: PH.rangoli,
    featured: false,
    display_order: 4,
  },
  {
    slug: 'yoga-meditation',
    title: 'Yoga / Meditation Classes',
    category: 'wellness',
    frequency: 'monthly',
    short_description:
      'Monthly drop-in classes blending traditional yoga, breathwork, and meditation.',
    description_md: `Our wellness classes are led by community instructors trained in classical Indian yoga traditions. Each session balances physical practice (asana), breath work (pranayama), and guided meditation (dhyana).

Classes are intentionally beginner-friendly. Mats are provided. We ask for a small voluntary contribution to cover space costs, but no one is turned away for inability to pay.`,
    who_for: 'All experience levels',
    schedule_md: 'First Sunday of each month, 6:00–7:15 PM.',
    hero_image_url: PH.yoga,
    featured: false,
    display_order: 5,
  },
  {
    slug: 'bharatiyatha-vedic-chanting',
    title: 'Bharatiyatha / Vedic Chanting',
    category: 'cultural',
    frequency: 'monthly',
    short_description:
      'A monthly gathering exploring Indian heritage through Vedic chanting and contemplative discussion.',
    description_md: `This program is the spiritual and cultural heart of BHF. Each month we gather to chant from classical Vedic texts, study their meaning, and discuss how their timeless teachings apply to modern life.

No prior background is required. Texts and translations are provided. Whether you grew up with these traditions or are encountering them for the first time, you're welcome here.`,
    who_for: 'Adults and older teens',
    schedule_md: 'Third Saturday of each month, 4:00–5:30 PM.',
    hero_image_url: PH.vedic,
    featured: false,
    display_order: 6,
  },
  {
    slug: 'community-hike',
    title: 'BHF Community Hike',
    category: 'wellness',
    frequency: 'monthly',
    short_description:
      'A monthly community hike connecting families through nature and shared movement.',
    description_md: `Each month we explore a different trail in the Bay Area's beautiful open spaces. Hikes are family-friendly, with options for shorter or longer routes. Bring water, snacks, and a friend.

This is one of our most-requested programs — and the easiest way to meet new families in the BHF community.`,
    who_for: 'Families and individuals of all ages',
    schedule_md: 'Third Sunday of each month, 8:30 AM start.',
    hero_image_url: PH.hike,
    featured: false,
    display_order: 7,
  },
  {
    slug: 'diwali',
    title: 'Diwali — Festival of Lights',
    category: 'cultural',
    frequency: 'annual',
    short_description:
      'Our largest annual celebration — an evening of light, music, food, and community.',
    description_md: `Diwali is the celebration that draws our entire community together. Each year we host an evening of cultural performances, traditional food, lamp lighting, and shared joy.

Past festivals have drawn 400+ attendees. We welcome everyone — members and neighbors, families and individuals, longtime friends and first-time visitors.`,
    who_for: 'All — families especially welcome',
    schedule_md: 'Annually in October or November.',
    hero_image_url: PH.diwali,
    featured: false,
    display_order: 8,
  },
  {
    slug: 'holi',
    title: 'Holi — Festival of Colors',
    category: 'cultural',
    frequency: 'annual',
    short_description:
      'A joyful celebration of spring, with color, music, and community.',
    description_md: `Holi is the festival of colors — and the festival of letting go. Each year we gather at Allan Witt Park to throw colored powder, play music, and welcome the spring.

Wear white. Bring a change of clothes. And come ready to laugh.`,
    who_for: 'All ages',
    schedule_md: 'Annually in March.',
    hero_image_url: PH.holi,
    featured: false,
    display_order: 9,
  },
  {
    slug: 'kite-festival',
    title: 'Kite Festival',
    category: 'cultural',
    frequency: 'annual',
    short_description:
      'An annual celebration of the Indian kite-flying tradition of Makar Sankranti.',
    description_md: `Our Kite Festival brings the centuries-old tradition of Makar Sankranti to Fairfield. We provide kites for newcomers, and experienced flyers bring their own.

Food, music, and a gentle competition for highest-flown and most creative kite round out the day.`,
    who_for: 'All ages — especially fun for families',
    schedule_md: 'Annually in April.',
    hero_image_url: PH.kite,
    featured: false,
    display_order: 10,
  },
];

interface GalleryCategorySeed {
  slug: string;
  title: string;
  description: string;
  display_order: number;
}

const galleryCategories: GalleryCategorySeed[] = [
  { slug: 'holi-2025', title: 'Holi 2025', description: 'Our 2025 Holi celebration in Fairfield.', display_order: 1 },
  { slug: 'diwali-2025', title: 'Diwali 2025', description: 'Lights, music, and community at our 2025 Diwali festival.', display_order: 2 },
  { slug: 'holi-2026', title: 'Holi 2026', description: 'Colors and joy at Allan Witt Park.', display_order: 3 },
  { slug: 'other-bhf-activities', title: 'Other BHF Activities', description: 'Hikes, classes, charity drives, and community events.', display_order: 4 },
];

// Each gallery category gets 6 placeholder photos.
const galleryPhotoSeeds: Array<{
  categorySlug: string;
  natural_key: string; // unique key per photo for upsert
  file_url: string;
  caption: string;
  display_order: number;
}> = [];

// gallery_photos.file_url is NOT NULL, so drop any themes whose Unsplash IDs
// are broken (currently: holi, diwali, rangoli, hero).
const photoSources: string[] = [
  PH.holi, PH.diwali, PH.community, PH.charity, PH.hike, PH.yoga,
  PH.kite, PH.rangoli, PH.art, PH.youth, PH.vedic, PH.hero,
].filter((src): src is string => typeof src === 'string' && src.length > 0);

for (const cat of galleryCategories) {
  for (let i = 0; i < 6; i++) {
    galleryPhotoSeeds.push({
      categorySlug: cat.slug,
      natural_key: `${cat.slug}-photo-${i + 1}`,
      file_url: photoSources[(galleryPhotoSeeds.length) % photoSources.length],
      caption: `Community celebrating ${cat.title}`,
      display_order: i,
    });
  }
}

interface LeadershipSeed {
  natural_key: string; // role+name combo for upsert
  name: string;
  role: string;
  bio: string;
  photo_url: string;
  section: 'founding' | 'board' | 'working_group';
  display_order: number;
}

const leadership: LeadershipSeed[] = [
  {
    natural_key: 'founding-anand-sharma',
    name: 'Dr. Anand Sharma',
    role: 'Founder & Executive Director',
    bio: 'Dr. Anand Sharma founded BHF in 2018 with a vision of building a Solano County community grounded in Bharatiyatha — the timeless values of Indian heritage. He brings 20 years of nonprofit leadership and a deep commitment to youth empowerment.',
    photo_url: PH.portrait1,
    section: 'founding',
    display_order: 1,
  },
  {
    natural_key: 'founding-priya-reddy',
    name: 'Priya Reddy',
    role: 'Co-Founder & Program Director',
    bio: 'Priya Reddy co-founded BHF and leads program design across festivals, classes, and youth initiatives. A former educator, she is passionate about creating spaces where families can practice culture and community together.',
    photo_url: PH.portrait2,
    section: 'founding',
    display_order: 2,
  },
  {
    natural_key: 'founding-vikram-iyer',
    name: 'Vikram Iyer',
    role: 'Co-Founder & Operations Director',
    bio: 'Vikram Iyer co-founded BHF and runs operations — from venue logistics to volunteer coordination. He believes the unsung work of operations is what turns vision into community.',
    photo_url: PH.portrait3,
    section: 'founding',
    display_order: 3,
  },
  {
    natural_key: 'board-meera-krishnan',
    name: 'Meera Krishnan',
    role: 'Board Chair',
    bio: 'Meera Krishnan chairs the BHF board and brings two decades of executive experience in education and philanthropy. She joined the board in 2022.',
    photo_url: PH.portrait4,
    section: 'board',
    display_order: 4,
  },
  {
    natural_key: 'board-rajesh-patel',
    name: 'Rajesh Patel',
    role: 'Board Treasurer',
    bio: 'Rajesh Patel serves as Board Treasurer, overseeing BHF\'s financial stewardship. A CPA by training, he ensures our finances remain transparent, compliant, and aligned with our mission.',
    photo_url: PH.portrait5,
    section: 'board',
    display_order: 5,
  },
  {
    natural_key: 'board-sunita-rao',
    name: 'Sunita Rao',
    role: 'Board Secretary',
    bio: 'Sunita Rao serves as Board Secretary. A longtime community volunteer, she keeps the board organized, documented, and focused on its commitments to the community.',
    photo_url: PH.portrait6,
    section: 'board',
    display_order: 6,
  },
];

interface BlogPostSeed {
  slug: string;
  title: string;
  excerpt: string;
  body_md: string;
  tags: string[];
  published_at: string;
  featured: boolean;
}

const blogPosts: BlogPostSeed[] = [
  {
    slug: 'welcome-to-the-new-bhf-website',
    title: 'Welcome to the new BHF community website',
    excerpt: "We've launched a new home online — built to make it easier to learn about our programs, RSVP to events, and connect with our community.",
    body_md: `Today we're launching the new BHF community website. We built it for one reason: to make it easier for our community to find each other and the work we do together.

If you've attended a Diwali or Holi festival, hiked with us at Lynch Canyon, or sent your child to one of our youth programs, this site is for you. You'll find every event in one place, a complete program directory, and a growing photo gallery from years of celebrations.

We've also added a way to become a BHF member — joining unlocks early RSVP windows for popular events, exclusive content like yoga sessions and Vedic chanting tutorials, and an opt-in community directory.

This is just the beginning. Over the next few months we'll roll out online donations, an annual report, a press kit, and more. If you have feedback, we'd love to hear it — drop us a note through the contact form.

Thank you for being part of this community. Here's to many more years of light, learning, and seva together.`,
    tags: ['community', 'announcement'],
    published_at: '2026-04-15T10:00:00Z',
    featured: true,
  },
  {
    slug: 'what-is-bharatiyatha',
    title: 'What is Bharatiyatha and why it matters',
    excerpt: 'Bharatiyatha is the soul of Indian heritage — the values, practices, and worldview that have sustained one of the world\'s oldest living traditions. Here\'s what it means to us, and why we put it at the center of everything BHF does.',
    body_md: `When people ask what BHF is about, the shortest answer is one word: Bharatiyatha. It's an old Sanskrit-rooted term, and it has no clean English translation. The closest we can get is *the essence of Indian heritage* — the values, the practices, the way of being that has shaped one of the world's oldest living civilizations.

Bharatiyatha is not a religion. It is not a nationality. It is something deeper and broader than either. It is the throughline that connects yoga and ayurveda and dharma and seva and the festivals we celebrate. It is the reason our grandparents woke up early to chant, the reason our parents made sure we learned Diwali stories, and the reason — even thousands of miles from the subcontinent — these practices still feel like home.

We chose Bharatiyatha as our north star because we believe heritage is not something you inherit passively. It is something you practice. Every time we light a lamp together, every time a teenager mentors a younger child, every time we volunteer at the charity drive — we are practicing Bharatiyatha. We are keeping it alive.

That's why our programs aren't just *Indian-themed activities*. They are vehicles for the values underneath: respect for elders, care for community, reverence for learning, joy in celebration, generosity to strangers.

If you're new to BHF, we hope you'll come to a festival, try a yoga class, or just show up for one of our community hikes. You don't have to know anything. You don't have to come from anywhere in particular. You just have to be open. The rest, Bharatiyatha will teach you.`,
    tags: ['heritage', 'community', 'philosophy'],
    published_at: '2026-04-22T10:00:00Z',
    featured: true,
  },
  {
    slug: 'save-the-date-diwali-2026',
    title: 'Save the date: Diwali 2026',
    excerpt: "Mark your calendars — our biggest celebration of the year returns Saturday, October 24, 2026, at the Solano County Fairgrounds.",
    body_md: `It's official: Diwali 2026 will be held on **Saturday, October 24, 2026**, at the Solano County Fairgrounds in Fairfield.

This is our largest event of the year — and every year it gets bigger. Last year we welcomed over 400 attendees for an evening of cultural performances, lamp lighting, traditional food, and music. We're aiming to make 2026 our best festival yet.

Tickets and RSVPs will open in early September. BHF members get a 48-hour early access window before public RSVPs go live — one of several reasons to consider becoming a member if you haven't already.

We're also looking for volunteers: stage management, food service, setup and breakdown, photography, kids' activities, parking, and more. If you'd like to help, fill out the volunteer form on our Get Involved page.

Save the date. Tell your family. Invite your neighbors. And we'll see you under the lights this October.`,
    tags: ['events', 'diwali', 'community'],
    published_at: '2026-05-10T10:00:00Z',
    featured: true,
  },
];

interface PageSeed {
  slug: string;
  title: string;
  body_md: string;
}

const pages: PageSeed[] = [
  {
    slug: 'about-hero',
    title: 'What is BHF?',
    body_md: `BHF — Bharatiyatha Heritage Foundation — is a nonprofit community in Fairfield, California dedicated to celebrating, practicing, and passing on the timeless values of Indian heritage.

We host festivals that fill the fairgrounds with light and color. We run youth programs that put real responsibility in young hands. We organize charity drives that serve our unhoused neighbors. And we hold monthly classes — yoga, meditation, Vedic chanting — that keep ancient practices alive in modern lives.

Whether you grew up with these traditions or are encountering them for the first time, you are welcome here. Heritage is not a club. It is a gift, and one that gets stronger the more widely it is shared.`,
  },
  {
    slug: 'about-bharatiyatha',
    title: 'Bharatiyatha',
    // NOTE: This is placeholder copy until Brad provides the final text from his slide 2 in production.
    body_md: `Bharatiyatha is the essence of Indian heritage — a word that has no single translation in English, because the thing it describes has no single equivalent. It is at once a worldview, a way of life, and a body of practices that have sustained one of the world's oldest living civilizations for thousands of years.

To understand Bharatiyatha is to understand a particular way of seeing the world: that life is sacred, that learning is reverent, that community is the unit of meaning, that the same divine spark animates every living being. It is not a creed you sign. It is a way of standing in the world.

Bharatiyatha shows up in our festivals — Diwali's celebration of light triumphing over darkness, Holi's joyful release of color, the Kite Festival's gratitude to the changing seasons. It shows up in our daily practices — the yoga we do at sunrise, the Vedic verses we chant before meals, the way elders are greeted in our homes.

But Bharatiyatha is not nostalgia. It is not a museum. It is a living tradition, and what makes it alive is that each generation must take it up and make it their own. That is why BHF puts so much energy into youth programs. The student boards, the writing and art contests, the mentorship initiatives — all of them exist to give young people a chance to encounter Bharatiyatha not as a lesson, but as a practice.

We also believe Bharatiyatha is not the exclusive inheritance of one community. The values at its heart — reverence for life, devotion to learning, generosity to strangers, balance between action and contemplation — are human values. They belong to anyone willing to practice them.

That is why our doors are open. You do not need to come from a particular background to attend a festival. You do not need to know Sanskrit to join a chanting circle. You do not need to be Indian to volunteer at the charity drive. You just need to show up with openness and good intent.

When we say BHF is a *heritage* foundation, we do not mean a foundation that preserves heritage. We mean a foundation built on heritage — using its values as the structural beams of a community we are building together, here in Solano County, in this century. Bharatiyatha is our why. The programs and festivals are our how. The community is our who.

And the work — like all real heritage work — is never finished.`,
  },
  {
    slug: 'about-youth-empowerment',
    title: 'Youth Empowerment',
    body_md: `At BHF, youth empowerment is not a side program — it is the heart of everything we do. We believe young people learn leadership by leading, not by being lectured at.

Our four Student Boards — Operations, Creative Arts, Leadership, and Mentorship — give students real responsibility in shaping our community programs. They book venues, design event collateral, mentor younger children, and run the logistics of events that hundreds of people attend.

We pair this with concrete opportunities: the annual Writing & Art Contest gives every student a chance to express themselves and have their work celebrated. Our Vedic chanting and yoga programs invite young people into contemplative practices on their own terms.

The result is a community where the next generation of leaders is being formed in real time — by doing the work, alongside mentors who trust them with it.`,
  },
  {
    slug: 'about-vision-mission',
    title: 'Our Vision and Mission',
    body_md: `**Our Vision:** A Solano County where the timeless values of Indian heritage — Bharatiyatha — are practiced, celebrated, and passed on to the next generation.

**Our Mission:** To build community through festivals, programs, and seva that bring our heritage into daily life. We empower youth, serve neighbors in need, and create spaces where families can practice culture together.

**Our Values:** Reverence for tradition. Generosity in service. Joy in celebration. Trust in the next generation.`,
  },
  {
    slug: 'press-boilerplate',
    title: 'About BHF',
    body_md: `**About Bharatiyatha Heritage Foundation (BHF)**

Bharatiyatha Heritage Foundation (BHF) is a nonprofit organization based in Fairfield, California, dedicated to celebrating and passing on the timeless values of Indian heritage — known collectively as Bharatiyatha. Founded in 2018, BHF serves the greater Solano County community through cultural festivals, youth empowerment programs, wellness classes, and seva initiatives.

BHF's signature events include the annual Diwali Festival of Lights, the Holi Festival of Colors, the Kite Festival, and the Warm Hearts Charity Drive. Year-round programming includes Vedic chanting circles, yoga and meditation classes, monthly community hikes, and four youth-led Student Boards covering Operations, Creative Arts, Leadership, and Mentorship.

Each year, BHF reaches hundreds of families across Solano County and the broader Bay Area. Volunteer-driven and community-funded, BHF operates without paid staff in its programs, relying on the time and generosity of community members.

**Press contact:** press@bhfcommunity.org`,
  },
  {
    slug: 'donate-impact',
    title: 'Your support sustains our community',
    body_md: `Every dollar you give to BHF goes directly to community programs. We operate without paid program staff, which means your donation underwrites the festivals, classes, and seva initiatives our community depends on.

**$25** sponsors a child's participation in a youth program for a month.

**$100** funds a complete yoga or chanting class series.

**$500** sponsors a coat or blanket drive for one neighborhood.

**$1,000** underwrites a major cultural festival.

BHF is a 501(c)(3) nonprofit organization. All donations are tax-deductible to the extent allowed by law.`,
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    body_md: `**Last updated:** May 2026

Bharatiyatha Heritage Foundation ("BHF", "we", "us") respects your privacy. This Privacy Policy explains what information we collect, how we use it, and the choices you have.

## Information We Collect

We collect information you provide directly to us, including:

- **Account information:** when you become a member, we collect your name, email address, phone number, city, family size, and how you heard about BHF.
- **Event RSVPs:** when you RSVP to an event, we collect your name, email, party size, and (optionally) dietary restrictions.
- **Donations:** when you donate, our payment processor (Stripe) collects your payment information. BHF receives your name, email, donation amount, and (optionally) a billing address. We never receive or store full payment card numbers.
- **Newsletter subscriptions:** when you subscribe, we collect your email address and the source of the subscription.
- **Contact inquiries:** when you submit a contact form, we collect the information you provide (name, email, phone, message).
- **Youth program enrollments:** for participants under 18, we collect information from the parent or legal guardian, including emergency contact and allergy information.

## How We Use Information

We use the information we collect to:

- Operate our programs and events (e.g., issue RSVP confirmations, send event reminders).
- Communicate with members and donors about BHF news and opportunities.
- Comply with legal and tax obligations, including issuing donation receipts.
- Improve our website and services.

We do not sell personal information.

## Third-Party Services

We use the following third-party services to operate BHF:

- **Stripe** for payment processing. Stripe's privacy practices are governed by Stripe's privacy policy.
- **Mailchimp** for email newsletter delivery — when you opt in to our newsletter, your email address is shared with Mailchimp solely for delivery. We do not sell or share your data for marketing purposes.
- **Plausible Analytics** for cookieless, privacy-respecting website analytics. Plausible does not use cookies and does not collect personal data.

## Your Rights

You have the right to:

- **Access** the personal information we hold about you.
- **Correct** inaccurate information.
- **Delete** your account and the personal information we hold about you.
- **Opt out** of email communications at any time by clicking the unsubscribe link in any email, or by emailing us directly.

To exercise these rights, email privacy@bhfcommunity.org.

## Member Directory

Members may opt in to be listed in the BHF member directory, which is visible only to other authenticated members. Listing in the directory is opt-in — you must affirmatively check the box. You may withdraw from the directory at any time from your account settings.

## Cookies

The BHF website uses essential session cookies to keep you logged in when you are a member. We do not use advertising or tracking cookies. Our analytics provider (Plausible) is cookieless.

## Children's Privacy (COPPA)

We take special care with youth program participant data. We do not knowingly collect personal information from children under 13 without verifiable parental consent. Parents and legal guardians provide all youth enrollment information directly. Parents may withdraw consent and request deletion of their child's information at any time by emailing privacy@bhfcommunity.org.

Photographs of minors taken at BHF events are governed by the photo permission setting in each child's enrollment record, set by the parent or guardian.

## Data Retention

We retain personal information for as long as your account is active or as needed to provide services and comply with legal obligations. You may request deletion at any time.

## Changes to This Policy

We may update this Privacy Policy from time to time. We will post the updated version on this page with a new "Last updated" date.

## Contact

For questions about this Privacy Policy, email privacy@bhfcommunity.org.`,
  },
  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    body_md: `**Last updated:** May 2026

These Terms of Service ("Terms") govern your use of the Bharatiyatha Heritage Foundation ("BHF") website and services. By using our website or participating in our programs, you agree to these Terms.

## 1. Acceptable Use

You agree to use the BHF website and services lawfully, respectfully, and in good faith. In particular, you agree not to:

- Harass, threaten, or harm other community members.
- Post or transmit content that is illegal, defamatory, obscene, or infringes the rights of others.
- Attempt to gain unauthorized access to any part of the website, server, or database.
- Use automated tools (bots, scrapers) to access the site in ways that disrupt normal operation.
- Impersonate another person or misrepresent your identity.
- Submit false information when registering, donating, or RSVPing to events.

## 2. Membership Accounts

Members are responsible for keeping their account credentials secure. You may not share your account with others. You must notify us immediately if you believe your account has been accessed without authorization.

We reserve the right to suspend or terminate accounts that violate these Terms, abuse community spaces, or pose a risk to other members.

## 3. Event RSVPs

RSVPs are subject to event capacity. We may cancel or reschedule events for reasons including weather, venue availability, or other operational considerations. We will make reasonable efforts to notify RSVPed attendees of any changes.

Some events have a members-only early access window. During this window, only authenticated members may RSVP. Public RSVPs open at the start of the public window.

## 4. Donations

Donations to BHF are tax-deductible to the extent allowed by law. BHF is a 501(c)(3) nonprofit organization. Donations are non-refundable except as required by law or in cases of clear error (e.g., duplicate charges), which we will address in good faith.

Recurring donations may be canceled at any time from your account or by contacting us.

## 5. Intellectual Property

The BHF website, including its content, design, logos, and underlying software, is owned by BHF or licensed to it. You may not copy, modify, distribute, or use BHF content for commercial purposes without our written permission.

User-submitted content (e.g., photo submissions, contest entries, written submissions) remains the property of the submitter. By submitting, you grant BHF a non-exclusive, royalty-free license to display, reproduce, and distribute the content in connection with BHF programs and communications.

## 6. Photo and Media Release

By attending BHF events, you acknowledge that photographs and video may be taken of attendees and used in BHF communications, social media, and the website. If you do not wish to be photographed, please notify the event lead on arrival.

For minors, photo release is governed by the parent or guardian's enrollment settings.

## 7. Disclaimers

The BHF website is provided "as is" and "as available" without warranties of any kind. We do not guarantee that the website will be available without interruption, error-free, or secure against unauthorized access.

## 8. Limitation of Liability

To the maximum extent permitted by law, BHF, its directors, officers, employees, and volunteers are not liable for indirect, incidental, special, or consequential damages arising from your use of the website or participation in programs.

Participation in BHF programs is voluntary and at your own risk. By participating, you assume the risks normally associated with the activity.

## 9. Changes to These Terms

We may update these Terms from time to time. The updated version will be posted on this page with a new "Last updated" date. Material changes will be communicated to members by email.

## 10. Governing Law

These Terms are governed by the laws of the State of California, without regard to conflict-of-laws principles. Any disputes shall be resolved in the courts of Solano County, California.

## Contact

For questions about these Terms, email legal@bhfcommunity.org.`,
  },
];

interface ExclusiveContentSeed {
  natural_key: string;
  title: string;
  description: string;
  category: 'yoga' | 'vedic_chanting' | 'bharatiyatha_lecture';
  content_type: 'video';
  content_url: string;
  thumbnail_url: string;
  published_at: string;
}

const exclusiveContent: ExclusiveContentSeed[] = [
  {
    natural_key: 'yoga-session-1',
    title: 'Morning Yoga: 20-Minute Sun Salutation Flow',
    description: 'A short, beginner-friendly sun salutation flow you can do at home each morning.',
    category: 'yoga',
    content_type: 'video',
    content_url: 'https://www.youtube.com/watch?v=placeholder-yoga-1',
    thumbnail_url: PH.yoga,
    published_at: '2026-04-01T10:00:00Z',
  },
  {
    natural_key: 'yoga-session-2',
    title: 'Restorative Yoga: 30-Minute Evening Practice',
    description: 'A gentle, restorative practice designed for the end of the day.',
    category: 'yoga',
    content_type: 'video',
    content_url: 'https://www.youtube.com/watch?v=placeholder-yoga-2',
    thumbnail_url: PH.yoga,
    published_at: '2026-04-08T10:00:00Z',
  },
  {
    natural_key: 'vedic-chanting-tutorial-1',
    title: 'Vedic Chanting Basics: The Gayatri Mantra',
    description: 'An introduction to Vedic chanting through one of its most beloved mantras.',
    category: 'vedic_chanting',
    content_type: 'video',
    content_url: 'https://www.youtube.com/watch?v=placeholder-vedic-1',
    thumbnail_url: PH.vedic,
    published_at: '2026-04-15T10:00:00Z',
  },
  {
    natural_key: 'bharatiyatha-lecture-1',
    title: 'Bharatiyatha: A Living Tradition',
    description: 'A 30-minute lecture on what Bharatiyatha means and why it matters today.',
    category: 'bharatiyatha_lecture',
    content_type: 'video',
    content_url: 'https://www.youtube.com/watch?v=placeholder-bharatiyatha-1',
    thumbnail_url: PH.community,
    published_at: '2026-04-22T10:00:00Z',
  },
];

async function seedEvents(): Promise<number> {
  let n = 0;
  for (const e of events) {
    await pool.query(
      `INSERT INTO events (
        slug, title, description_md, starts_at, ends_at, location_name, location_address,
        hero_image_url, type, status, rsvp_capacity, members_only, members_early_access_at,
        allows_dietary_restrictions
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        description_md = EXCLUDED.description_md,
        starts_at = EXCLUDED.starts_at,
        ends_at = EXCLUDED.ends_at,
        location_name = EXCLUDED.location_name,
        location_address = EXCLUDED.location_address,
        hero_image_url = EXCLUDED.hero_image_url,
        type = EXCLUDED.type,
        status = EXCLUDED.status,
        rsvp_capacity = EXCLUDED.rsvp_capacity,
        members_only = EXCLUDED.members_only,
        members_early_access_at = EXCLUDED.members_early_access_at,
        allows_dietary_restrictions = EXCLUDED.allows_dietary_restrictions`,
      [
        e.slug, e.title, e.description_md, e.starts_at, e.ends_at, e.location_name,
        e.location_address, e.hero_image_url, e.type, e.status, e.rsvp_capacity,
        e.members_only, e.members_early_access_at, e.allows_dietary_restrictions,
      ],
    );
    n++;
  }
  return n;
}

async function seedPrograms(): Promise<number> {
  let n = 0;
  for (const p of programs) {
    await pool.query(
      `INSERT INTO programs (
        slug, title, category, frequency, short_description, description_md, who_for,
        schedule_md, location, hero_image_url, featured, display_order, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        frequency = EXCLUDED.frequency,
        short_description = EXCLUDED.short_description,
        description_md = EXCLUDED.description_md,
        who_for = EXCLUDED.who_for,
        schedule_md = EXCLUDED.schedule_md,
        location = EXCLUDED.location,
        hero_image_url = EXCLUDED.hero_image_url,
        featured = EXCLUDED.featured,
        display_order = EXCLUDED.display_order,
        status = EXCLUDED.status`,
      [
        p.slug, p.title, p.category, p.frequency, p.short_description, p.description_md,
        p.who_for, p.schedule_md, 'Fairfield, CA', p.hero_image_url, p.featured,
        p.display_order, 'published',
      ],
    );
    n++;
  }
  return n;
}

async function seedGallery(): Promise<{ cats: number; photos: number }> {
  let cats = 0;
  for (const c of galleryCategories) {
    await pool.query(
      `INSERT INTO gallery_categories (slug, title, description, display_order)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         display_order = EXCLUDED.display_order`,
      [c.slug, c.title, c.description, c.display_order],
    );
    cats++;
  }

  let photos = 0;
  for (const p of galleryPhotoSeeds) {
    // Use category slug + caption + display_order as a natural key proxy.
    // The photos table has no unique constraint, so we delete-and-reinsert per natural_key
    // via a deterministic caption marker.
    const marker = `[seed:${p.natural_key}]`;
    const captionWithMarker = `${p.caption} ${marker}`;
    const existing = await pool.query<{ id: string }>(
      `SELECT id FROM gallery_photos WHERE caption LIKE $1 LIMIT 1`,
      [`%${marker}%`],
    );
    const categoryRow = await pool.query<{ id: string }>(
      `SELECT id FROM gallery_categories WHERE slug = $1`,
      [p.categorySlug],
    );
    if (categoryRow.rows.length === 0) continue;
    const categoryId = categoryRow.rows[0].id;

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE gallery_photos
            SET category_id = $1, file_url = $2, thumb_url = $3, caption = $4,
                photographer_credit = $5, display_order = $6
          WHERE id = $7`,
        [categoryId, p.file_url, p.file_url, captionWithMarker, 'BHF Community', p.display_order, existing.rows[0].id],
      );
    } else {
      await pool.query(
        `INSERT INTO gallery_photos (
           category_id, file_url, thumb_url, caption, photographer_credit, display_order
         ) VALUES ($1,$2,$3,$4,$5,$6)`,
        [categoryId, p.file_url, p.file_url, captionWithMarker, 'BHF Community', p.display_order],
      );
    }
    photos++;
  }
  return { cats, photos };
}

async function seedLeadership(): Promise<number> {
  let n = 0;
  for (const l of leadership) {
    const marker = `[seed:${l.natural_key}]`;
    const bioWithMarker = `${l.bio}\n\n<!-- ${marker} -->`;
    const existing = await pool.query<{ id: string }>(
      `SELECT id FROM leadership WHERE bio LIKE $1 LIMIT 1`,
      [`%${marker}%`],
    );
    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE leadership SET
           name = $1, role = $2, bio = $3, photo_url = $4, section = $5,
           display_order = $6, active = true
         WHERE id = $7`,
        [l.name, l.role, bioWithMarker, l.photo_url, l.section, l.display_order, existing.rows[0].id],
      );
    } else {
      await pool.query(
        `INSERT INTO leadership (
           name, role, bio, photo_url, section, display_order, active
         ) VALUES ($1,$2,$3,$4,$5,$6,true)`,
        [l.name, l.role, bioWithMarker, l.photo_url, l.section, l.display_order],
      );
    }
    n++;
  }
  return n;
}

async function seedBlogPosts(): Promise<number> {
  let n = 0;
  for (const b of blogPosts) {
    await pool.query(
      `INSERT INTO blog_posts (
         slug, title, excerpt, body_md, tags, featured, status, published_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         excerpt = EXCLUDED.excerpt,
         body_md = EXCLUDED.body_md,
         tags = EXCLUDED.tags,
         featured = EXCLUDED.featured,
         status = EXCLUDED.status,
         published_at = EXCLUDED.published_at`,
      [b.slug, b.title, b.excerpt, b.body_md, b.tags, b.featured, 'published', b.published_at],
    );
    n++;
  }
  return n;
}

async function seedPages(): Promise<number> {
  let n = 0;
  for (const p of pages) {
    await pool.query(
      `INSERT INTO pages (slug, title, body_md)
       VALUES ($1,$2,$3)
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         body_md = EXCLUDED.body_md`,
      [p.slug, p.title, p.body_md],
    );
    n++;
  }
  return n;
}

async function seedHomepageConfig(): Promise<void> {
  await pool.query(
    `UPDATE homepage_config SET
       stat_families_served = $1,
       stat_festivals_hosted = $2,
       stat_youth_in_programs = $3,
       stat_seva_hours = $4,
       hero_image_url = $5
     WHERE id = 1`,
    [420, 18, 140, 3200, PH.hero],
  );
}

// Passwords sourced from environment variables, never literals.
// The dev /home/ubuntu/.bw_env file holds these values and is mode-600 outside the repo.
async function seedDefaultAdmin(): Promise<void> {
  const email = 'admin@bhfcommunity.org';
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  const existing = await pool.query<{ id: string }>(
    `SELECT id FROM admins WHERE email = $1 LIMIT 1`,
    [email],
  );
  if (existing.rows.length > 0) {
    return;
  }
  if (!password) {
    throw new Error(
      'INITIAL_ADMIN_PASSWORD must be set in /home/ubuntu/.bw_env before seeding. ' +
        'Generate a strong value and store it securely. The seed will refuse to create ' +
        'a default admin without it.',
    );
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO admins (email, password_hash, name, role, totp_enabled)
     VALUES ($1, $2, $3, $4, false)
     ON CONFLICT (email) DO NOTHING`,
    [email, passwordHash, 'BHF Administrator', 'super_admin'],
  );
}

async function seedDemoMember(): Promise<void> {
  const email = 'demo@bhfcommunity.org';
  const password = process.env.DEMO_MEMBER_PASSWORD;
  if (!password) {
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO members (
       email, password_hash, first_name, last_name, city, interests,
       email_verified_at, directory_opt_in, newsletter_opt_in
     ) VALUES ($1,$2,$3,$4,$5,$6, now(), true, true)
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       first_name = EXCLUDED.first_name,
       last_name = EXCLUDED.last_name,
       city = EXCLUDED.city,
       interests = EXCLUDED.interests,
       email_verified_at = COALESCE(members.email_verified_at, now()),
       directory_opt_in = EXCLUDED.directory_opt_in,
       newsletter_opt_in = EXCLUDED.newsletter_opt_in`,
    [email, passwordHash, 'Demo', 'User', 'Fairfield, CA', ['festivals', 'youth_programs']],
  );
}

interface YouthProgramFlag {
  slug: string;
  is_youth: boolean;
  min_age_years: number | null;
  max_age_years: number | null;
}

// Tags youth-eligible programs and pins age ranges for COPPA-gated enrollment.
// Slug list covers both the canonical seed slugs and the alternate "bhf-" prefixed
// variants used by some specs; a slug that does not exist in the DB is a harmless
// no-op (UPDATE matches 0 rows).
const youthProgramFlags: YouthProgramFlag[] = [
  { slug: 'writing-and-art-contest', is_youth: true, min_age_years: 6, max_age_years: 18 },
  { slug: 'bhf-writing-art-contest', is_youth: true, min_age_years: 6, max_age_years: 18 },
  { slug: 'student-boards', is_youth: true, min_age_years: 12, max_age_years: 18 },
  { slug: 'bhf-student-boards', is_youth: true, min_age_years: 12, max_age_years: 18 },
  { slug: 'rangoli-contest', is_youth: false, min_age_years: null, max_age_years: null },
  { slug: 'yoga-meditation', is_youth: false, min_age_years: null, max_age_years: null },
  { slug: 'bharatiyatha-vedic-chanting', is_youth: false, min_age_years: null, max_age_years: null },
  { slug: 'community-hike', is_youth: false, min_age_years: null, max_age_years: null },
  { slug: 'bhf-community-hike', is_youth: false, min_age_years: null, max_age_years: null },
  { slug: 'diwali', is_youth: false, min_age_years: null, max_age_years: null },
  { slug: 'holi', is_youth: false, min_age_years: null, max_age_years: null },
  { slug: 'kite-festival', is_youth: false, min_age_years: null, max_age_years: null },
  { slug: 'warm-hearts-charity-drive', is_youth: false, min_age_years: null, max_age_years: null },
];

async function seedYouthProgramFlags(): Promise<number> {
  let n = 0;
  for (const f of youthProgramFlags) {
    const res = await pool.query(
      `UPDATE programs
          SET is_youth = $1,
              min_age_years = $2,
              max_age_years = $3
        WHERE slug = $4`,
      [f.is_youth, f.min_age_years, f.max_age_years, f.slug],
    );
    n += res.rowCount ?? 0;
  }
  return n;
}

async function seedExclusiveContent(): Promise<number> {
  let n = 0;
  for (const c of exclusiveContent) {
    const marker = `[seed:${c.natural_key}]`;
    const descWithMarker = `${c.description}\n\n<!-- ${marker} -->`;
    const existing = await pool.query<{ id: string }>(
      `SELECT id FROM exclusive_content WHERE description LIKE $1 LIMIT 1`,
      [`%${marker}%`],
    );
    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE exclusive_content SET
           title = $1, description = $2, category = $3, content_type = $4,
           content_url = $5, thumbnail_url = $6, published_at = $7
         WHERE id = $8`,
        [c.title, descWithMarker, c.category, c.content_type, c.content_url,
         c.thumbnail_url, c.published_at, existing.rows[0].id],
      );
    } else {
      await pool.query(
        `INSERT INTO exclusive_content (
           title, description, category, content_type, content_url, thumbnail_url, published_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [c.title, descWithMarker, c.category, c.content_type, c.content_url,
         c.thumbnail_url, c.published_at],
      );
    }
    n++;
  }
  return n;
}

async function main(): Promise<void> {
  console.log('[seed] starting');

  const ev = await seedEvents();
  console.log(`[seed] events: ${ev} upserted`);

  const pr = await seedPrograms();
  console.log(`[seed] programs: ${pr} upserted`);

  const yf = await seedYouthProgramFlags();
  console.log(`[seed] youth program flags: ${yf} updated`);

  const gal = await seedGallery();
  console.log(`[seed] gallery_categories: ${gal.cats} upserted`);
  console.log(`[seed] gallery_photos: ${gal.photos} upserted`);

  const ld = await seedLeadership();
  console.log(`[seed] leadership: ${ld} upserted`);

  const bp = await seedBlogPosts();
  console.log(`[seed] blog_posts: ${bp} upserted`);

  const pg = await seedPages();
  console.log(`[seed] pages: ${pg} upserted`);

  await seedHomepageConfig();
  console.log(`[seed] homepage_config: 1 updated`);

  const ec = await seedExclusiveContent();
  console.log(`[seed] exclusive_content: ${ec} upserted`);

  await seedDemoMember();
  if (process.env.DEMO_MEMBER_PASSWORD) {
    console.log(`[seed] demo member: upserted (demo@bhfcommunity.org)`);
  } else {
    console.log(`[seed] demo member: skipped (DEMO_MEMBER_PASSWORD unset)`);
  }

  await seedDefaultAdmin();
  console.log(`[seed] default super admin: ensured (admin@bhfcommunity.org)`);

  console.log('[seed] complete');
  await pool.end();
}

main().catch((err) => {
  console.error('[seed] failed:', err);
  pool.end().catch(() => {});
  process.exit(1);
});
