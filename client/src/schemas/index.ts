import z from "zod";
export const RegistrationSchema = z.object({
  email: z.email({ message: "please provide a valid email" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  name: z
    .string()
    .min(3, { message: " Name must be at least 6 characters" })
    .max(50, { message: "Name is too long" }),

  code: z.optional(
    z
      .string()
      .min(6, {
        message: "Code must be at least 6 characters",
      })
      .max(6, {
        message: "Code is too long",
      })
  ),
  isShowPassword: z.optional(z.boolean()),
});

export const AccountVerificationSchema = z.object({
  email: z.email({ message: "please provide a valid email" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  name: z
    .string()
    .min(3, { message: " Name must be at least 6 characters" })
    .max(50, { message: "Name is too long" }),

  code: z
    .string()
    .min(6, {
      message: "Code must be at least 6 characters",
    })
    .max(6, {
      message: "Code is too long",
    }),
});

export const LoginSchema = z.object({
  email: z.email(),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  isShowPassword: z.optional(z.boolean()),
});

export const ResetSchema = z.object({
  email: z.string().email({ message: "please provide a valid email" }),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: "Token is required" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    isShowPassword: z.optional(z.boolean()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const CreateSimpleSongSchema = z.object({
  description: z
    .string()
    .min(10, { message: "Please give a clear description" }),
  instrumental: z.boolean().optional().default(false),
  inspiration: z.array(z.string()).optional(),
});
export const CreateCustomSongSchema = z.object({
  lyrics: z.string().min(10, { message: "Please provide some lyrics" }),
  instrumental: z.boolean().default(false),
  prompt: z.string().min(5, { message: "Please provide a valid prompt" }),

  lyricsType: z.enum(["described", "custom"]).default("custom"),
});
const BotPromptSchema = z.object({
  prompt: z.string().min(5, { message: "Please provide a valid prompt" }),
  shareTo: z
    .array(z.enum(["whatsapp", "audius", "youtube", "facebook"]))
    .optional(),
});
export const CreateBeatBotSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Please provide a valid title" })
    .optional(),
  description: z.string().min(10, {
    message: "Please provide a valid description for the beat bot",
  }),
  promptDetails: z
    .array(BotPromptSchema)
    .min(1, { message: "Please provide at least one prompt detail" })
    .max(5, { message: "You can provide up to 5 prompt details" }),
  frequency: z
    .array(
      z.enum([
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ])
    )
    .min(1, { message: "Please select at least one day" })
    .default(["monday"]),
  isActive: z.boolean().optional().default(true),
});

export const ShareSongSchema = z.object({
  shareTo: z
    .array(z.enum(["whatsapp", "audius", "youtube", "facebook"]))
    .optional(),
});
