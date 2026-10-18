import type { DisplayDocument, DisplayValidationError } from "@homeslate/schema";

export type DisplaySummary = {
  id: string;
  name: string;
};

export type DisplayRecord = {
  id: string;
  publicId: string;
  document: DisplayDocument;
};

export interface DisplayStore {
  get(id: string): Promise<DisplayRecord | null>;
  getByPublicId(publicId: string): Promise<DisplayRecord | null>;
  put(id: string, document: DisplayDocument): Promise<void>;
  create(document: DisplayDocument): Promise<DisplayRecord>;
  list(): Promise<DisplaySummary[]>;
  remove(id: string): Promise<void>;
  /** Hashed viewer passcode, or null when the display has no passcode. */
  getPasscodeHash(id: string): Promise<string | null>;
  /** Sets the hashed viewer passcode, or clears it with `null`. */
  setPasscode(id: string, passcodeHash: string | null): Promise<void>;
}

export class InvalidDisplayDocumentError extends Error {
  readonly errors: DisplayValidationError[];
  constructor(errors: DisplayValidationError[]) {
    super("Invalid display document");
    this.name = "InvalidDisplayDocumentError";
    this.errors = errors;
  }
}

export class DisplayNotFoundError extends Error {
  readonly id: string;
  constructor(id: string) {
    super(`Display not found: ${id}`);
    this.name = "DisplayNotFoundError";
    this.id = id;
  }
}
