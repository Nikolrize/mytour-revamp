export type Destination = {
  name: string;
  state: string;
  category: string;
  image: string;
  note: string;
};

export type ItineraryStop = {
  day: number;
  time: string;
  place: string;
  area: string;
  note: string;
};

export type Itinerary = {
  slug: string;
  title: string;
  author: string;
  location: string;
  days: string;
  category: string;
  rating: string;
  saves: number;
  image: string;
  note: string;
  description: string;
  isPublic: boolean;
  status: "Planning" | "Ready to go" | "Completed";
  stops: ItineraryStop[];
};

export type TravelerProfile = {
  name: string;
  username: string;
  location: string;
  bio: string;
  avatar: string;
  coverImage: string;
  joined: string;
  interests: string[];
  tripsPlanned: number;
  tripsShared: number;
  placesExplored: number;
};

export type TripComment = {
  id: string;
  author: string;
  date: string;
  rating: number;
  message: string;
};