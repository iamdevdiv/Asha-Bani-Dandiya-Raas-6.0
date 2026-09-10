/**
 * Message Templates Engine for Asha Bani Dandiya Raas 2026.
 * Server-side helper methods for fetching and updating template configurations in DB,
 * re-exporting core template structures and interpolation methods.
 */

import { getSettings, updateSetting } from './db';
import { DEFAULT_TEMPLATES } from './message-templates-core';

export * from './message-templates-core';

/**
 * Fetches all template settings from database (with fallback to defaults).
 */
export async function getMessageTemplates(): Promise<Record<string, string>> {
  const settings = await getSettings();
  const result: Record<string, string> = {};

  for (const [key, def] of Object.entries(DEFAULT_TEMPLATES)) {
    result[key] = settings[key] ? settings[key] : def.defaultText;
  }

  // Toggle for same template across all ambassador tiers (default: true)
  result['template_ambassador_same_for_all'] =
    settings['template_ambassador_same_for_all'] !== undefined
      ? settings['template_ambassador_same_for_all']
      : 'true';

  return result;
}

/**
 * Saves a single or multiple message template settings.
 */
export async function saveMessageTemplate(key: string, value: string): Promise<void> {
  await updateSetting(key, value);
}

/**
 * Resets a template key to its default text.
 */
export async function resetMessageTemplate(key: string): Promise<string> {
  const def = DEFAULT_TEMPLATES[key];
  if (def) {
    await updateSetting(key, def.defaultText);
    return def.defaultText;
  }
  return '';
}
