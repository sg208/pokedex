import { describe, it, expect } from 'vitest';

// Protects: the footer and legal pages read the repo URL from app config.
// Turns red if repoUrl drifts to another repo. No other test pins the value.
describe('app config', () => {
  it('points repoUrl at the pokedex repository', () => {
    expect(useAppConfig().repoUrl).toBe('https://github.com/sg208/pokedex');
  });
});
