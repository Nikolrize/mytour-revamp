export type Destination = {
  id?: string;
  name: string;
  state: string;
  category: string;
  image: string;
  note: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type ItineraryStop = {
  id?: string;
  day: number;
  time: string;
  place: string;
  area: string;
  note: string;
  latitude?: number | null;
  longitude?: number | null;
  startTime?: string | null;
  endTime?: string | null;
};

export type Itinerary = {
  slug: string;
  title: string;
  author: string;
  authorAvatar?: string | null;
  location: string;
  days: string;
  category: string;
  rating: string;
  saves: number;
  image: string;
  note: string;
  description: string;
  interests?: string[];
  isPublic: boolean;
  status: "Planning" | "Ongoing" | "Completed";
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
  authorAvatar?: string | null;
  date: string;
  rating: number;
  message: string;
};

export type CommunityAuthor = { name: string; avatarUrl: string | null };
export type CommunityPost = {
  id: string;
  content: string;
  images: string[];
  createdAt: string;
  author: CommunityAuthor;
  canDelete: boolean;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  trip: Itinerary | null;
  tripIsOwner: boolean;
  attachmentUnavailable: boolean;
};
export type CommunityComment = {
  id: string;
  content: string;
  createdAt: string;
  author: CommunityAuthor;
  canDelete: boolean;
};

export type TripFilters = {
  search: string;
  state: string;
  tags: string[];
  sort: "latest" | "saved" | "rating";
};
