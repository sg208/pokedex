const SLUG_PATTERN = /^[a-z0-9-]+$/;

// Same shape buildDetailRoutes accepts; guards every path built from a name
export const isPokemonSlug = (value: unknown): value is string =>
  typeof value === 'string' && SLUG_PATTERN.test(value);
