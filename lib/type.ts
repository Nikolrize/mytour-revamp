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
  isSaved?: boolean;
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
  canReport: boolean;
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

export type ManagedAccount = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: "master_admin" | "admin" | "client";
  status: "active" | "inactive";
  created_at: string;
  tripCount: number;
  postCount: number;
};

export type PasswordResetRequest = {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  role: ManagedAccount["role"];
  requestedAt: string;
};

export type TripPageOptions = {
  scope?: "public" | "mine" | "saved" | "all";
  page?: number;
  pageSize?: number;
  search?: string;
  state?: string;
  tags?: string[];
  sort?: TripFilters["sort"];
  status?: "all" | Itinerary["status"];
  publicOnly?: boolean;
};
export type TripPageResponse = {
  trips: Itinerary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  states: string[];
  stats?: {
    saved: number;
    planned: number;
    shared: number;
    places: number;
    planning: number;
    ongoing: number;
    completed: number;
  };
};

// Shared metadata for database-paginated collections.
export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
