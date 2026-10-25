import type { Button } from "@/components/ui/button";
import type * as schemas from "@/lib/schemas";
import type { LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import type { z } from "zod";

// Domain
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
  authorId?: string;
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
  isOwner?: boolean;
  status: "Planning" | "Ongoing" | "Completed";
  stops: ItineraryStop[];
};

export type TripComment = {
  id: string;
  author: string;
  authorId?: string;
  authorAvatar?: string | null;
  date: string;
  rating: number;
  message: string;
};

export type CommunityAuthor = {
  id?: string;
  name: string;
  avatarUrl: string | null;
};

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

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PublicProfileResponse = PaginationMeta & {
  profile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
  };
  counts: { trips: number; posts: number };
  trips: Itinerary[];
  posts: CommunityPost[];
  isOwnProfile: boolean;
  signedIn: boolean;
};

export type ProfileActivityKind = "recent" | "trips" | "posts";

export type AdminReportDetail = {
  id: string;
  targetType: "trip" | "post";
  contentId: string;
  title: string;
  reason: string;
  details: string | null;
  status: "open" | "resolved" | "dismissed";
  reporterId: string;
  reporter: string;
  createdAt: string;
  reviewedById: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
};

export type AdminFilterDefinition = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

export type AdminRecordKind = "trips" | "reports";

export type LocatedStop = ItineraryStop & {
  latitude: number;
  longitude: number;
};

export type LatLng = [number, number];

export type AdminKind = "users" | "trips" | "reports";

export type CursorPage<T> = { nextPage: number | null } & T;

export type Coordinates = { latitude: number; longitude: number };

export type GeneratedStop = {
  destinationId?: string;
  title: string;
  description: string;
  day: number;
  date: string | null;
  startTime: string;
  endTime: string;
  latitude: number | null;
  longitude: number | null;
  area: string;
};

export type ProfileRecord = {
  id?: string;
  display_name: string;
  role?: "client" | "admin" | "master_admin";
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at?: string;
};

export type AccountRole = ManagedAccount["role"];

export type AdminRow = {
  id: string;
  primary: string;
  secondary: string;
  reason?: string;
  category?: string;
  status: string;
  meta: string;
  action: string;
};

export type AdminRecordCollections = {
  trips?: Itinerary[];
  reports?: AdminReport[];
};

export type AdminRecordActionValues = { item: AdminRecord };

export type AdminReportResponse = { report: AdminReportDetail };

export type AuthResponse = { redirectTo?: string };

export type MessageResponse = { message: string };

export type TripCommentsData = { comments: TripComment[] };

export type TripCommentResponse = { comment: TripComment };

export type CommunityPageOptions = {
  search?: string;
  kind?: string;
  sort?: string;
  postId?: string;
  page?: number;
};

export type CommunityPostsData = { posts: CommunityPost[] };

export type CreatedRecordResponse = { id: string };

export type CommunityCommentsData = { comments: CommunityComment[] };

export type ManagedAccountPageOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
  accountRole?: string;
  sort?: string;
};

export type ManagedAccountsData = { users: ManagedAccount[] };

export type AccountEmailResponse = { email: string };

export type GeocodeResponse = {
  coordinates: (Coordinates | null)[];
};

export type RoadRouteResponse = {
  coordinates: [number, number][];
};

export type PasswordRequestsData = { requests: PasswordResetRequest[] };

export type StatesResponse = {
  states: { id: number; name: string; code: string }[];
};

export type GeneratedStopsResponse = { stops: GeneratedStop[] };

export type ProfileResponse = { profile: ProfileRecord | null };

export type AvatarUploadResponse = { avatarUrl: string };

export type TripDetailResponse = { trip: Itinerary; isOwner: boolean };

export type TripStopsResponse = { stops: TripStopRecord[] };

export type TripSaveResponse = { saved: boolean };

// Forms
export type AuthValues = z.infer<
  ReturnType<typeof schemas.createAuthFormSchema>
>;

export type TripPlanValues = z.infer<typeof schemas.tripPlanSchema>;

export type ProfileValues = z.infer<typeof schemas.profileSchema>;

export type CommentValues = z.infer<typeof schemas.commentSchema>;

export type TripStopInput = z.input<typeof schemas.tripStopSchema>;

export type StopValues = z.output<typeof schemas.tripStopSchema>;

export type AdminAccountCreateValues = z.output<
  typeof schemas.adminAccountCreateSchema
>;

export type AdminAccountEditValues = z.output<
  typeof schemas.adminAccountEditSchema
>;

export type ResetPasswordValues = z.output<typeof schemas.resetPasswordSchema>;

export type ForgotPasswordValues = z.output<
  typeof schemas.forgotPasswordSchema
>;

export type CommunityCommentValues = z.output<
  typeof schemas.communityCommentSchema
>;

export type CommunityPostValues = z.output<typeof schemas.communityPostSchema>;

export type ContentReportValues = z.output<typeof schemas.contentReportSchema>;

export type TripDetailsValues = z.output<typeof schemas.tripDetailsSchema>;

export type EditStopValues = z.output<typeof schemas.editStopSchema>;

export type CommunityPostInput = z.input<typeof schemas.communityPostSchema>;

export type CreateCommunityPostValues = {
  values: CommunityPostValues;
  photos: File[];
};

export type EditManagedAccountValues = {
  id: string;
  values: AdminAccountEditValues;
};

export type UpdateAccountStatusValues = {
  id: string;
  status: "active" | "inactive";
};

export type ResolvePasswordRequestValues = {
  id: string;
  password: string;
  confirmPassword: string;
};

export type CreateTripValues = {
  values: TripPlanValues;
  stops: GeneratedStop[];
};

export type EditTripStopValues = {
  stopId: string;
  values: EditStopValues;
};

// Components
export type AdminDatabaseTableProps = {
  kind: AdminRecordKind;
  searchPlaceholder: string;
  initialSearch?: string;
  compact?: boolean;
};

export type AdminTableProps = {
  rows: AdminRow[];
  entityLabel: string;
  searchPlaceholder: string;
  initialSearch?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  total?: number;
  filters?: ReactNode;
  onAction?: (row: AdminRow) => void;
  onRowClick?: (row: AdminRow) => void;
  pendingActionId?: string;
  renderExtraActions?: (row: AdminRow) => ReactNode;
};

export type AuthPageProps = { mode: "login" | "signup" };

export type ConfirmActionProps = {
  children: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onConfirm: () => Promise<unknown>;
  pending?: boolean;
  error?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  className?: string;
  confirmClassName?: string;
  destructive?: boolean;
  ariaLabel?: string;
};

export type DateTimePickerProps = {
  id: string;
  label: string;
  date: Date | undefined;
  time: string;
  minDate?: Date;
  minTime?: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
};

export type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export type ItineraryCardProps = {
  itinerary: Itinerary;
  showAuthor?: boolean;
  isSaved?: boolean;
  isOwner?: boolean;
  showStatus?: boolean;
};

export type MetricCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconTone: string;
  detail?: string;
  variant?: "compact" | "dashboard";
};

export type TripCommentsProps = { tripSlug: string; canReview?: boolean };

export type AddAccountDialogProps = { role: "admin" | "client" };

export type EditAccountDialogProps = { account: ManagedAccount };

export type ResetRequestDialogProps = { request: PasswordResetRequest };

export type AdminReportDialogProps = {
  selection: AdminReportSelection | null;
  onClose: () => void;
};

export type AdminShellProps = { children: ReactNode };

export type AdminTableFiltersProps = {
  definitions: AdminFilterDefinition[];
  defaults: Record<string, string>;
  onApply: (values: Record<string, string>) => void;
};

export type AccountTableProps = {
  role: "admin" | "client";
  search: string;
  compact: boolean;
};

export type AdminUsersProps = { compact?: boolean };

export type AuthorProfileLinkProps = {
  authorId?: string;
  children: ReactNode;
  className?: string;
};

export type CommunityAuthorProps = {
  author: CommunityAuthor;
  createdAt?: string;
};

export type CommunityCommentsProps = {
  postId: string;
  signedIn: boolean;
};

export type PhotoPreviewProps = {
  file: File;
  onRemove: () => void;
  disabled: boolean;
};

export type CommunityComposerProps = {
  author: CommunityAuthor;
  onPublished?: () => void;
};

export type CommunityDeleteProps = {
  kind: "post" | "comment";
  pending: boolean;
  error?: string;
  onConfirm: () => Promise<unknown>;
};

export type AttachedItineraryProps = {
  post: CommunityPost;
  signedIn: boolean;
};

export type CommunityPostCardProps = {
  post: CommunityPost;
  signedIn: boolean;
};

export type CommunityFeedProps = {
  moderation?: boolean;
  postId?: string;
};

export type CommunityPostTextProps = { content: string };

export type CommunityPostPhotosProps = {
  images: string[];
  author: string;
};

export type CommunityReportProps = {
  postId: string;
  signedIn: boolean;
};

export type ExploreTripsProps = {
  embedded?: boolean;
  maxItems?: number;
};

export type ItineraryPaginationProps = {
  page: number;
  totalPages: number;
  busy?: boolean;
  label?: string;
  onPageChange: (page: number) => void;
};

export type FitStopsProps = { stops: LocatedStop[]; route: LatLng[] };

export type LeafletRouteMapProps = {
  stops: ItineraryStop[];
};

export type LoadingBlockProps = {
  children: ReactNode;
  label?: string;
  className?: string;
};

export type TripCardGridSkeletonProps = { count?: number };

export type TableLoadingSkeletonProps = {
  rows?: number;
  columns?: number;
  toolbar?: boolean;
};

export type CommunityFeedSkeletonProps = { count?: number };

export type CommentsLoadingSkeletonProps = {
  label?: string;
};

export type MetricsLoadingSkeletonProps = { count?: number };

export type PageLoadingSkeletonProps = {
  label?: string;
};

export type NewPlanMenuProps = {
  label?: string;
  className?: string;
};

export type PlanBuilderProps = { mode?: "ai" | "manual" };

export type ProfileActivityProps = {
  kind: ProfileActivityKind;
  onKindChange: (kind: ProfileActivityKind) => void;
  page: number;
  onPageChange: (page: number) => void;
  data?: PublicProfileResponse;
  recentData?: TripPageResponse;
  includeRecent?: boolean;
  pending: boolean;
  fetching: boolean;
  error?: Error | null;
};

export type ProfileStatsProps = { items: { label: string; value: number }[] };

export type ProvidersProps = { children: ReactNode };

export type PublicProfileContentProps = { userId: string };

export type ReportConfirmationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export type RouteMapProps = { stops: ItineraryStop[] };

export type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder: string;
  id?: string;
  disabled?: boolean;
};

export type TravellerProfileCardProps = {
  name: string;
  avatar?: string | null;
  bio?: string | null;
  createdAt: string;
  action?: ReactNode;
  children?: ReactNode;
};

export type TripActionsProps = {
  trip: Itinerary;
  isOwner: boolean;
  isEditing: boolean;
  onEditingChange: (enabled: boolean) => void;
};

export type TripStateCoverProps = { trip: Itinerary };

export type TripStatusBadgeProps = { status: Itinerary["status"] };

export type TripStopEditorProps = {
  tripId: string;
  stop: ItineraryStop;
};

export type TripStopManagerProps = {
  tripId?: string;
  onAdd?: (values: StopValues) => Promise<void>;
  pending?: boolean;
  error?: string;
};

export type TripTagsProps = {
  interests?: string[];
  limit?: number;
};

export type PasswordFieldsProps = {
  idPrefix: string;
  password: UseFormRegisterReturn;
  confirmation: UseFormRegisterReturn;
  disabled?: boolean;
  passwordLabel?: string;
  confirmLabel?: string;
  description?: string;
  passwordError?: string;
  confirmError?: string;
};

export type ItineraryDayHeaderProps = {
  day: number | string;
  stopCount: number;
  area?: string;
};

export type AdminPageOptions = {
  page: number;
  pageSize: number;
  search: string;
  filters: Record<string, string>;
};
export type GeocodePlace = { name: string; area: string };

export type AdminOverviewResponse = {
  users: number;
  publicTrips: number;
  posts: number;
  openReports: number;
};

export type AdminReport = {
  id: string;
  targetType: "trip" | "post";
  trip_id?: string | null;
  post_id?: string | null;
  title?: string | null;
  tripTitle?: string | null;
  reporter?: string | null;
  reason?: string | null;
  details?: string | null;
  status: "open" | "resolved" | "dismissed";
};
export type AdminRecord = Itinerary | AdminReport;
export type AdminReportSelection = { id: string; targetType: "trip" | "post" };

export type TripStopRecord = {
  id: string;
  trip_id: string;
  destination_id: string | null;
  title: string;
  description: string | null;
  stop_date: string | null;
  start_time: string | null;
  end_time: string | null;
  position: number;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  created_at: string;
};
export type ApiErrorResponse = { message: string; code: string };
