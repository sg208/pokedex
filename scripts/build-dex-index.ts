// Writes public/data/dex-index.json: a static snapshot of types, base stat
// totals, evolution standing, the type chart and level-up move metadata.
// One PokeAPI GraphQL request; run by hand with `pnpm data:refresh`.
import { writeFile, mkdir } from 'node:fs/promises';

const ENDPOINT = 'https://beta.pokeapi.co/graphql/v1beta';
const DEX_MAX = 1025;
const OUT_DIR = new URL('../public/data/', import.meta.url);

const QUERY = `{
  types: pokemon_v2_type(where: {id: {_lte: 18}}, order_by: {id: asc}) { id name }
  efficacy: pokemon_v2_typeefficacy { damage_factor damage_type_id target_type_id }
  pokemon: pokemon_v2_pokemon(where: {id: {_lte: ${DEX_MAX}}}, order_by: {id: asc}) {
    id name
    types: pokemon_v2_pokemontypes(order_by: {slot: asc}) { type: pokemon_v2_type { name } }
    stats: pokemon_v2_pokemonstats { base_stat }
    species: pokemon_v2_pokemonspecy { evolves_from_species_id }
  }
  moves: pokemon_v2_move(order_by: {name: asc}) {
    name power
    type: pokemon_v2_type { name }
    damageClass: pokemon_v2_movedamageclass { name }
  }
  versionGroups: pokemon_v2_versiongroup(order_by: {order: asc}) { name order }
}`;

interface Response {
  data: {
    types: { id: number; name: string }[];
    efficacy: {
      damage_factor: number;
      damage_type_id: number;
      target_type_id: number;
    }[];
    pokemon: {
      id: number;
      name: string;
      types: { type: { name: string } }[];
      stats: { base_stat: number }[];
      species: { evolves_from_species_id: number | null };
    }[];
    moves: {
      name: string;
      power: number | null;
      type: { name: string } | null;
      damageClass: { name: string } | null;
    }[];
    versionGroups: { name: string; order: number }[];
  };
}

const fail = (message: string): never => {
  throw new Error(`dex-index: ${message}`);
};

const main = async (): Promise<void> => {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: QUERY }),
  });
  if (!response.ok) fail(`request failed with ${response.status}`);
  const { data } = (await response.json()) as Response;

  if (data.types.length !== 18) fail('expected 18 types');
  if (data.pokemon.length !== DEX_MAX) fail(`expected ${DEX_MAX} Pokémon`);
  if (data.pokemon.at(-1)?.id !== DEX_MAX) fail(`last id is not ${DEX_MAX}`);

  const types = data.types.map((type) => type.name);
  const indexById = new Map(data.types.map((type, i) => [type.id, i]));
  // chart[attacker][defender], as a plain multiplier
  const chart = types.map(() => types.map(() => 1));
  for (const row of data.efficacy) {
    const attacker = indexById.get(row.damage_type_id);
    const defender = indexById.get(row.target_type_id);
    if (attacker === undefined || defender === undefined) continue;
    chart[attacker]![defender] = row.damage_factor / 100;
  }

  const parentById = new Map(
    data.pokemon.map((mon) => [mon.id, mon.species.evolves_from_species_id])
  );
  const parentIds = new Set(
    data.pokemon.flatMap((mon) => mon.species.evolves_from_species_id ?? [])
  );
  const stageOf = (id: number): number => {
    const parent = parentById.get(id);
    return parent ? 1 + stageOf(parent) : 0;
  };

  const pokemon = data.pokemon.map((mon) => ({
    id: mon.id,
    name: mon.name,
    types: mon.types.map((entry) => entry.type.name),
    bst: mon.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
    stage: stageOf(mon.id),
    isFinal: !parentIds.has(mon.id),
  }));
  if (pokemon.some((mon) => mon.types.length === 0 || mon.bst === 0)) {
    fail('a Pokémon is missing types or stats');
  }

  const moves = Object.fromEntries(
    data.moves.map((move) => [
      move.name,
      {
        type: move.type?.name ?? 'normal',
        power: move.power,
        damageClass: move.damageClass?.name ?? 'status',
      },
    ])
  );
  const versionGroups = Object.fromEntries(
    data.versionGroups.map((group) => [group.name, group.order])
  );

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(
    new URL('dex-index.json', OUT_DIR),
    `${JSON.stringify({ types, chart, pokemon, moves, versionGroups })}\n`
  );
  process.stdout.write(
    `dex-index: ${pokemon.length} Pokémon, ${data.moves.length} moves\n`
  );
};

await main();
