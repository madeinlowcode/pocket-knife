import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { existsSync, readFileSync, appendFileSync, mkdirSync } from 'node:fs';
import * as dotenv from 'dotenv';

/**
 * Get the path to ~/.claude/.env
 * @returns {string} Absolute path to the env file
 */
export function getEnvPath() {
  return join(homedir(), '.claude', '.env');
}

/**
 * Read existing keys from the env file
 * @param {string} envPath - Path to the env file
 * @returns {Record<string, string>} Parsed env variables
 */
function readExistingKeys(envPath) {
  if (!existsSync(envPath)) {
    return {};
  }
  return dotenv.parse(readFileSync(envPath, 'utf-8'));
}

/**
 * Ensure the .claude directory exists
 * @param {string} envPath - Path to the env file
 */
function ensureClaudeDir(envPath) {
  const dir = dirname(envPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Merge new keys into ~/.claude/.env without overwriting existing keys
 * @param {Record<string, string>} newKeys - Keys to add
 * @returns {Promise<{added: string[], skipped: string[]}>} Lists of added and skipped keys
 */
export async function mergeEnv(newKeys) {
  const envPath = getEnvPath();
  ensureClaudeDir(envPath);
  const existing = readExistingKeys(envPath);

  // Filter: only add keys that don't exist or have empty values in existing
  const keysToAdd = {};
  const skipped = [];

  for (const [key, value] of Object.entries(newKeys)) {
    if (existing[key] && existing[key].trim() !== '') {
      skipped.push(key);
    } else {
      keysToAdd[key] = value;
    }
  }

  if (Object.keys(keysToAdd).length === 0) {
    return { added: [], skipped };
  }

  // Build append string with timestamp comment
  const timestamp = new Date().toISOString();
  const header = `\n# Added by pocket-knife init (${timestamp})\n`;
  const entries = Object.entries(keysToAdd)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  appendFileSync(envPath, header + entries + '\n', 'utf-8');

  return {
    added: Object.keys(keysToAdd),
    skipped
  };
}
