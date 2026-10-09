import { z } from "zod";

const urlOrPath = z
  .string()
  .max(2048)
  .refine(
    (value) =>
      value === "" ||
      value.startsWith("/") ||
      value.startsWith("/api/uploads/") ||
      /^https:\/\//.test(value),
    "URL must be https or an internal path"
  );

export const adminSettingsSchema = z
  .object({
    contact: z
      .object({
        email: z.string().email().max(254),
        phone: z.string().max(50),
        address: z.string().max(500),
        website: z.string().max(2048),
      })
      .optional(),
    social_links: z
      .object({
        facebook: urlOrPath,
        instagram: urlOrPath,
        twitter: urlOrPath,
        youtube: urlOrPath,
        linkedin: urlOrPath,
      })
      .optional(),
    hero: z
      .object({
        title: z.string().max(200),
        subtitle: z.string().max(1000),
        tagline: z.string().max(200),
        imageUrl: urlOrPath.nullable(),
        videoUrl: urlOrPath.nullable().optional(),
      })
      .optional(),
    about: z
      .object({
        label: z
          .object({
            ar: z.string().max(200),
            en: z.string().max(200),
          })
          .optional(),
        title: z
          .object({
            ar: z.string().max(300),
            en: z.string().max(300),
          })
          .optional(),
        mission: z.object({
          ar: z.string().max(2000),
          en: z.string().max(2000),
        }),
        vision: z.object({
          ar: z.string().max(2000),
          en: z.string().max(2000),
        }),
        presenceLabel: z
          .object({
            ar: z.string().max(500),
            en: z.string().max(500),
          })
          .optional(),
        values: z
          .array(
            z.object({
              ar: z.string().max(100),
              en: z.string().max(100),
            })
          )
          .max(20),
        yearsOfExperience: z.string().max(20).optional(),
      })
      .optional(),
    branding: z
      .object({
        logoUrl: urlOrPath.nullable(),
        logoMarkUrl: urlOrPath.nullable(),
        faviconUrl: urlOrPath.nullable(),
      })
      .optional(),
  })
  .strict();
