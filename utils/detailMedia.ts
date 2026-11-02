import type { PokemonCries, PokemonSprites } from '~/types/pokemon';

export const defaultArtworkUrl = (
  sprites: PokemonSprites,
  id: number
): string =>
  sprites.other?.['official-artwork']?.front_default ?? artworkUrl(id);

// No shiny artwork: fall back to the default, so the viewer can tell they match
export const shinyArtworkUrl = (sprites: PokemonSprites, id: number): string =>
  sprites.other?.['official-artwork']?.front_shiny ??
  defaultArtworkUrl(sprites, id);

export const pickCryUrl = (cries: PokemonCries): string | null =>
  cries.latest ?? cries.legacy ?? null;
