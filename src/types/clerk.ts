export type clerkUserPayload = {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export type CustomPublicMetadata = {
  dbUserId?: string;
}

export type CustomSessionClaims = {
  publicMetadata?: CustomPublicMetadata;
  [key: string]: unknown;
}