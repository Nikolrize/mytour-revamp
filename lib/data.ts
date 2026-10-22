import type { Destination, Itinerary, TravelerProfile, TripComment } from "@/lib/type";

export const destinations: Destination[] = [
  {
    name: "George Town",
    state: "Penang",
    category: "Culture",
    image:
      "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=1000&q=85",
    note: "Street art, shophouses & makan",
  },
  {
    name: "Langkawi",
    state: "Kedah",
    category: "Islands",
    image:
      "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1000&q=85",
    note: "Slow island days, your way",
  },
  {
    name: "Kuala Lumpur",
    state: "Kuala Lumpur",
    category: "City",
    image:
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1000&q=85",
    note: "Big city energy, local finds",
  },
  {
    name: "Cameron Highlands",
    state: "Pahang",
    category: "Nature",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1000&q=85",
    note: "Tea hills & cool-air mornings",
  },
  {
    name: "Kota Kinabalu",
    state: "Sabah",
    category: "Nature",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85",
    note: "Sea, sunset & mountain views",
  },
  {
    name: "Melaka",
    state: "Melaka",
    category: "Culture",
    image:
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1000&q=85",
    note: "A little history around every corner",
  },
];

export const categories = ["All places", "Culture", "Nature", "Islands", "City"];

export const itineraries: Itinerary[] = [
  {
    slug: "melaka-weekend",
    title: "A weekend in Melaka",
    author: "Nadia A.",
    location: "Melaka",
    days: "2 days",
    category: "Food & culture",
    rating: "4.9",
    saves: 128,
    image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1200&q=85",
    note: "Old streets, good coffee, and nowhere to rush.",
    description: "A relaxed route through heritage lanes, riverside cafés, and small spots worth finding.",
    isPublic: true,
    status: "Ready to go",
    stops: [
      { day: 1, time: "9:00 AM", place: "Jonker Street", area: "Bandar Hilir", note: "Start with coffee and a wander through the old town." },
      { day: 1, time: "12:30 PM", place: "Kampung Kling Mosque", area: "Jonker Walk", note: "Take a quiet break and explore the surrounding heritage streets." },
      { day: 1, time: "4:00 PM", place: "Melaka River Walk", area: "Riverside", note: "Follow the river as the afternoon light softens." },
      { day: 2, time: "10:00 AM", place: "A Famosa", area: "Stadthuys quarter", note: "See the historic centre before the day warms up." },
      { day: 2, time: "1:00 PM", place: "Local lunch stop", area: "Banda Hilir", note: "Leave room for one last plate before heading home." },
    ],
  },
  {
    slug: "penang-at-your-pace",
    title: "Penang, at your pace",
    author: "Amir R.",
    location: "George Town",
    days: "3 days",
    category: "Culture & food",
    rating: "4.8",
    saves: 96,
    image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=1200&q=85",
    note: "Murals, markets, and one more plate to share.",
    description: "A local-first island itinerary with plenty of time to wander between meals.",
    isPublic: true,
    status: "Planning",
    stops: [
      { day: 1, time: "9:00 AM", place: "Armenian Street", area: "George Town", note: "Walk the heritage lanes before they get busy." },
      { day: 1, time: "12:00 PM", place: "Hin Bus Depot", area: "George Town", note: "Browse independent shops and grab lunch nearby." },
      { day: 2, time: "10:30 AM", place: "Balik Pulau", area: "Southwest Penang", note: "Slow down for local produce and a countryside detour." },
      { day: 3, time: "8:30 AM", place: "Tanjung Bungah", area: "Northeast Penang", note: "Finish with breakfast by the water." },
    ],
  },
  {
    slug: "langkawi-slow-days",
    title: "A softer side of Langkawi",
    author: "Mei L.",
    location: "Langkawi",
    days: "4 days",
    category: "Island escape",
    rating: "5.0",
    saves: 74,
    image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=85",
    note: "Quiet beaches and no alarms before sunrise.",
    description: "An easygoing island loop for beach time, local seafood, and sunset stops.",
    isPublic: true,
    status: "Completed",
    stops: [
      { day: 1, time: "3:00 PM", place: "Pantai Cenang", area: "Southwest Langkawi", note: "Settle in with a beach walk and sunset." },
      { day: 2, time: "9:30 AM", place: "Kilim Geoforest Park", area: "Northeast Langkawi", note: "Explore mangroves and limestone scenery." },
      { day: 3, time: "11:00 AM", place: "Tanjung Rhu", area: "North Langkawi", note: "Keep the day open for swimming and a long lunch." },
    ],
  },
];

export const myTrips: Itinerary[] = itineraries.map((itinerary, index): Itinerary => ({
  ...itinerary,
  slug: `my-${itinerary.slug}`,
  author: "You",
  isPublic: false,
  saves: 0,
  status: index === 0 ? "Ready to go" : index === 1 ? "Planning" : "Completed",
}));

export const currentProfile: TravelerProfile = {
  name: "Alex Tan",
  username: "alexwanders",
  location: "Kuala Lumpur, Malaysia",
  bio: "Always up for a slow morning, a local food stop, and taking the scenic route.",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=85",
  coverImage: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1800&q=85",
  joined: "2025",
  interests: ["Local food", "Culture", "Nature", "Slow travel"],
  tripsPlanned: myTrips.length,
  tripsShared: 2,
  placesExplored: 12,
};

export const tripComments: Record<string, TripComment[]> = {
  "melaka-weekend": [
    { id: "melaka-1", author: "Farah N.", date: "2 weeks ago", rating: 5, message: "Tried the riverside walk at sunset and it was lovely. The relaxed pace made this easy to follow." },
    { id: "melaka-2", author: "Daniel L.", date: "1 month ago", rating: 4, message: "Great food and heritage stops. I added an extra hour around Jonker Street." },
  ],
  "penang-at-your-pace": [
    { id: "penang-1", author: "Siti R.", date: "5 days ago", rating: 5, message: "A really thoughtful mix of food and wandering time. Saving this for my next Penang visit." },
  ],
  "langkawi-slow-days": [
    { id: "langkawi-1", author: "Jason W.", date: "3 weeks ago", rating: 5, message: "The slower island itinerary was exactly what we needed. Tanjung Rhu was a highlight." },
  ],
};