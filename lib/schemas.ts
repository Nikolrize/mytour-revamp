import { tripInterestOptions } from "@/lib/data";
import { z } from "zod";

const newPasswordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128);

export const tripPlanSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Give your trip a name.")
      .max(80, "Trip names can be up to 80 characters."),
    description: z
      .string()
      .trim()
      .max(2000, "Descriptions can be up to 2,000 characters.")
      .optional(),
    states: z.array(z.string().min(1)).min(1, "Choose at least one state."),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    startTime: z.string(),
    endTime: z.string(),
    travellers: z.string().min(1),
    style: z.string().min(1),
    interests: z.array(z.string()),
  })
  .superRefine((value, context) => {
    if (value.startDate && value.endDate && value.endDate < value.startDate) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "The end date must be after the start date.",
      });
    }
    if (
      value.startDate &&
      value.endDate &&
      value.startDate.toDateString() === value.endDate.toDateString() &&
      value.startTime &&
      value.endTime &&
      value.endTime < value.startTime
    ) {
      context.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be later than start time.",
      });
    }
  });

export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Enter a display name.")
    .max(60, "Name must be 60 characters or fewer."),
  avatarUrl: z.union([
    z.literal(""),
    z.string().url("Enter a valid image URL.").max(2048),
  ]),
  bio: z.string().max(240, "Bio must be 240 characters or fewer."),
});

export const commentSchema = z.object({
  rating: z.number().int().min(1, "Choose a rating.").max(5),
  message: z
    .string()
    .trim()
    .min(1, "Write a comment.")
    .max(500, "Comment must be 500 characters or fewer."),
});

export const tripStopSchema = z
  .object({
    title: z.string().trim().min(1, "Enter a stop name.").max(160),
    description: z.string().max(1000),
    day: z.coerce.number().int().min(1).max(31),
    startTime: z.string(),
    endTime: z.string(),
    mapsUrl: z
      .string()
      .trim()
      .url("Paste a valid Google Maps share link.")
      .max(2048),
  })
  .superRefine((value, context) => {
    let host = "";
    try {
      host = new URL(value.mapsUrl).hostname.toLowerCase();
    } catch {
      /* The URL schema reports invalid links. */
    }
    if (
      !(
        host === "maps.app.goo.gl" ||
        host === "goo.gl" ||
        host === "google.com" ||
        host.endsWith(".google.com") ||
        /^google\.[a-z.]+$/.test(host) ||
        /^.+\.google\.[a-z.]+$/.test(host)
      )
    ) {
      context.addIssue({
        code: "custom",
        path: ["mapsUrl"],
        message: "Use a Google Maps share link.",
      });
    }
    if (value.startTime && value.endTime && value.endTime <= value.startTime) {
      context.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be later than start time.",
      });
    }
  });

export const createAuthFormSchema = (isSignup: boolean) =>
  z
    .object({
      name: z.string(),
      email: z.string().trim().email("Enter a valid email address."),
      password: isSignup
        ? z.string().min(8, "Password must contain at least 8 characters.")
        : z.string().min(1, "Enter your password."),
      confirmPassword: z.string(),
      agreed: z.boolean(),
    })
    .superRefine((value, context) => {
      if (!isSignup) return;
      if (!value.name.trim()) {
        context.addIssue({
          code: "custom",
          path: ["name"],
          message: "Enter your name.",
        });
      }
      if (!value.confirmPassword) {
        context.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Confirm your password.",
        });
      } else if (value.password !== value.confirmPassword) {
        context.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Those passwords do not match.",
        });
      }
      if (!value.agreed) {
        context.addIssue({
          code: "custom",
          path: ["agreed"],
          message: "Agree to the terms to continue.",
        });
      }
    });

export const tripDetailsSchema = z.object({
  title: z.string().trim().min(1, "Enter a trip name.").max(80),
  description: z.string().trim().max(2000),
});

export const contentReportSchema = z.object({
  reason: z.string().trim().min(1, "Enter a reason.").max(120),
  details: z.string().trim().max(1000),
});

export const tripReportSchema = contentReportSchema;

export const editStopSchema = z
  .object({
    title: z.string().trim().min(1, "Enter a stop name.").max(160),
    description: z.string().max(1000),
    day: z.number().int().min(1).max(31),
    startTime: z.union([
      z.literal(""),
      z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
    ]),
    endTime: z.union([
      z.literal(""),
      z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
    ]),
  })
  .refine(
    (value) =>
      !value.startTime || !value.endTime || value.endTime > value.startTime,
    { path: ["endTime"], message: "End time must be later than start time." },
  );

export const communityPostSchema = z.object({
  content: z
    .string()
    .trim()
    .max(5000, "Posts can contain up to 5,000 characters."),
  tripId: z.union([z.literal(""), z.string().uuid()]).default(""),
});
export const communityCommentSchema = z.object({
  content: z.string().trim().min(1, "Write a comment.").max(1000),
});

// Account roles are assigned only when an administrator creates an account.
export const adminAccountCreateSchema = z
  .object({
    displayName: z.string().trim().min(1, "Enter a name.").max(60),
    email: z.string().trim().email("Enter a valid email."),
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm the password.").max(128),
    role: z.enum(["admin", "client"]),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
export const adminAccountEditSchema = z
  .object({
    email: z.string().trim().email("Enter a valid email."),
    password: z.union([z.literal(""), newPasswordSchema]),
    confirmPassword: z.string().max(128),
    displayName: z.string().trim().min(1, "Enter a name.").max(60),
  })
  .strict()
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

// Password recovery forms share validation with their API routes.
export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
});
export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string().max(128),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const geocodeRequestSchema = z.object({
  places: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(160),
        area: z.string().trim().max(500),
      }),
    )
    .min(1)
    .max(10),
});

export const adminPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(12).default(12),
  search: z.string().trim().max(200).default(""),
  role: z.enum(["all", "admin", "client"]).default("all"),
  status: z
    .enum(["all", "active", "inactive", "flagged", "reviewed"])
    .default("all"),
  visibility: z.enum(["all", "published", "private"]).default("all"),
  phase: z.enum(["all", "planning", "ongoing", "completed"]).default("all"),
  type: z.enum(["all", "trip", "post"]).default("all"),
  accountRole: z
    .enum(["all", "client", "admin", "master_admin"])
    .default("all"),
  sort: z.enum(["latest", "oldest"]).default("latest"),
});

const clock = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
export const generatedStopsSchema = z
  .array(
    z
      .object({
        destinationId: z.string().default(""),
        title: z.string().trim().min(1).max(160),
        state: z.string().trim().min(1),
        day: z.number().int().min(1).max(14),
        startTime: clock,
        endTime: clock,
        notes: z.string().max(1000),
      })
      .refine((stop) => stop.endTime > stop.startTime, "Invalid time range"),
  )
  .min(1)
  .max(56);

export const tripPageQuerySchema = z.object({
  scope: z.enum(["public", "mine", "saved", "all"]),
  page: z.coerce.number().int().min(1).max(100000),
  pageSize: z.coerce.number().int().min(1).max(12),
  search: z.string().trim().max(200),
  state: z.string().max(80),
  tags: z.array(z.enum(tripInterestOptions)).max(tripInterestOptions.length),
  sort: z.enum(["latest", "saved", "rating"]),
  status: z.enum(["all", "Planning", "Ongoing", "Completed"]),
  publicOnly: z.enum(["true", "false"]),
});

export const publicProfileQuerySchema = z.object({
  userId: z.guid(),
  page: z.coerce.number().int().min(1).max(100000),
  kind: z.enum(["trips", "posts"]),
});
