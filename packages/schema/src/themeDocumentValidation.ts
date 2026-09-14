import { z } from "zod";

type UnknownRecord = Record<string, unknown>;

const isoDateTimeSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Invalid date-time string",
});

const unknownRecordSchema = z.record(z.string(), z.unknown());

const themeDocumentSchema = z
  .object({
    id: z.string().min(1).max(100),
    name: z.string().min(1).max(120),
    description: z.string().max(500).optional(),
    version: z.number().int().min(2),
    isActive: z.boolean(),
    createdAt: isoDateTimeSchema.optional(),
    updatedAt: isoDateTimeSchema.optional(),
    tokens: unknownRecordSchema.optional(),
    colorMode: z
      .object({
        light: unknownRecordSchema.optional(),
        dark: unknownRecordSchema.optional(),
      })
      .strict()
      .optional(),
    extend: z.record(z.string(), unknownRecordSchema).optional(),
  })
  .strict();

export type ThemeDocument = z.infer<typeof themeDocumentSchema>;

export interface ThemeValidationIssue {
  path: string;
  message: string;
}

export interface ThemeValidationResult {
  ok: boolean;
  data?: ThemeDocument;
  issues: ThemeValidationIssue[];
}

function issuePath(path: PropertyKey[]): string {
  if (path.length === 0) return "$";
  return path
    .map((segment) => {
      if (typeof segment === "number") {
        return `[${segment}]`;
      }
      if (typeof segment === "symbol") {
        return segment.toString();
      }
      return segment;
    })
    .join(".");
}

export function validateThemeDocument(input: unknown): ThemeValidationResult {
  const parsed = themeDocumentSchema.safeParse(input);
  if (!parsed.success) {
    const issues: ThemeValidationIssue[] = parsed.error.issues.map((issue) => ({
      path: issuePath(issue.path),
      message: issue.message,
    }));
    return { ok: false, issues };
  }

  return { ok: true, data: parsed.data, issues: [] };
}

export function isThemeDocumentCandidate(input: unknown): input is UnknownRecord {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return false;
  }

  const record = input as UnknownRecord;
  return "tokens" in record || "$schema" in record;
}
