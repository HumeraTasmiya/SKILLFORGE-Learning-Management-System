/** SkillForge localStorage keys; migrates legacy SkillNova keys once per tab. */
export const STORAGE = {
  token: 'skillforge_token',
  user: 'skillforge_user',
  theme: 'skillforge_theme',
  playgroundCode: 'skillforge_playground_code',
};

const LEGACY = {
  token: 'skillnova_token',
  user: 'skillnova_user',
  theme: 'skillnova_theme',
  playgroundCode: 'skillnova_playground_code',
};

let migrated = false;

export function migrateLegacyStorage() {
  if (migrated) return;
  migrated = true;
  try {
    Object.keys(STORAGE).forEach((k) => {
      const next = STORAGE[k];
      const prev = LEGACY[k];
      if (!next || !prev) return;
      if (localStorage.getItem(next) == null) {
        const oldVal = localStorage.getItem(prev);
        if (oldVal != null) {
          localStorage.setItem(next, oldVal);
          localStorage.removeItem(prev);
        }
      }
    });
  } catch {
    /* ignore private mode / quota */
  }
}
