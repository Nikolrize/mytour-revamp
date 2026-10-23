import { z } from "zod";

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

export const tripReportSchema = z.object({
  reason: z.string().trim().min(1, "Enter a reason.").max(120),
  details: z.string().trim().max(1000),
});

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
