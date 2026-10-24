export const tripInterestOptions = [
  "Local food",
  "Culture",
  "Nature",
  "Beaches",
  "Slow mornings",
  "Hidden gems",
] as const;

export const stateImages: Record<string, string> = {
  Johor: "/images/states/johor.jpg",
  Kedah: "/images/states/kedah.jpg",
  Kelantan: "/images/states/kelantan.jpg",
  "Kuala Lumpur": "/images/states/kuala%20lumpur.webp",
  Labuan: "/images/states/labuan.jpg",
  Melaka: "/images/states/melaka.jpg",
  "Negeri Sembilan": "/images/states/negeri%20sembilan.jpg",
  Pahang: "/images/states/pahang.webp",
  Perak: "/images/states/perak.webp",
  Perlis: "/images/states/perlis.jpg",
  "Pulau Pinang": "/images/states/penang.webp",
  Penang: "/images/states/penang.webp",
  Putrajaya: "/images/states/putrajaya.jpg",
  Sabah: "/images/states/sabah.jpg",
  Sarawak: "/images/states/sarawak.jpg",
  Selangor: "/images/states/selangor.jpg",
  Terengganu: "/images/states/terengganu.jpg",
};

export const homeItineraryPreview = {
  title: "Penang, at your pace",
  days: "3 days",
  day: 1,
  stops: [
    {
      time: "9:00 AM",
      area: "George Town",
      place: "Breakfast on Campbell Street",
      note: "Start the morning with kopi and a local breakfast.",
    },
    {
      time: "11:00 AM",
      area: "George Town",
      place: "Armenian Street",
      note: "Explore the murals and heritage shophouses at your own pace.",
    },
    {
      time: "2:00 PM",
      area: "George Town",
      place: "Hin Bus Depot",
      note: "Browse the creative spaces and pause for an afternoon coffee.",
    },
  ],
};
