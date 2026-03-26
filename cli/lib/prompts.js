import { checkbox, password, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cats = JSON.parse(readFileSync(join(__dirname, 'categories.json'), 'utf-8')).categories;

/**
 * Let the user select which skill categories to configure
 * @returns {Promise<string[]>} Array of selected category IDs
 */
export async function selectCategories() {
  const choices = cats.map(c => ({
    name: `${c.name} — ${c.description}`,
    value: c.id,
    checked: false
  }));

  const selected = await checkbox({
    message: 'Which skill categories do you want to configure?',
    choices
  });

  return selected;
}

/**
 * Prompt the user for API keys for the selected categories
 * Skips keys that are already configured in existingKeys
 * @param {string[]} selectedCategoryIds - Category IDs to prompt for
 * @param {Record<string, string>} existingKeys - Already configured keys
 * @returns {Promise<Record<string, string>>} New keys collected from user
 */
export async function promptKeys(selectedCategoryIds, existingKeys) {
  const newKeys = {};

  for (const categoryId of selectedCategoryIds) {
    const category = cats.find(c => c.id === categoryId);
    if (!category) continue;

    for (const provider of category.providers) {
      const envVar = provider.envVar;

      if (existingKeys[envVar] && existingKeys[envVar].trim() !== '') {
        console.log(chalk.gray(`  ${envVar} already set — skipping`));
        continue;
      }

      console.log(chalk.cyan(`  ${provider.name}`));
      console.log(chalk.dim(`  (${provider.hint})`));

      const value = await password({
        message: `${envVar}:`,
        mask: '*',
        validate: v => v.trim().length > 0 || 'Key cannot be empty'
      });

      if (value && value.trim() !== '') {
        newKeys[envVar] = value.trim();
      }
    }
  }

  return newKeys;
}
