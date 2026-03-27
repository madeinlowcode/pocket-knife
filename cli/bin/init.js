#!/usr/bin/env node
import chalk from 'chalk';
import { selectCategories, promptKeys } from '../lib/prompts.js';
import { validateKey } from '../lib/validate.js';
import { mergeEnv, getEnvPath } from '../lib/env-writer.js';
import * as dotenv from 'dotenv';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { confirm } from '@inquirer/prompts';

function showBanner() {
  const banner = `
${chalk.bold.cyan('  ____            _        _        _  __      _  __     ')}
${chalk.bold.cyan(' |  _ \\ ___   ___| | _____| |_     | |/ /_ __ (_)/ _| ___ ')}
${chalk.bold.cyan(' | |_) / _ \\ / __| |/ / _ \\ __|____| \' /| \'_ \\| | |_ / _ \\')}
${chalk.bold.cyan(' |  __/ (_) | (__|   <  __/ ||_____| . \\| | | | |  _|  __/')}
${chalk.bold.cyan(' |_|   \\___/ \\___|_|\\_\\___|\\__|     |_|\\_\\_| |_|_|_|  \\___|')}
`;
  console.log(banner);
  console.log(chalk.dim('  84 AI skills for Claude Code — your keys, no middleman'));
  console.log(chalk.dim(`  v1.0.0 | github.com/madeinlowcode/pocket-knife\n`));
}

async function main() {
  showBanner();
  console.log(chalk.bold('  Configure your AI provider keys in ~/.claude/.env\n'));

  // Check Node.js version
  const nodeVersion = parseInt(process.versions.node.split('.')[0]);
  if (nodeVersion < 18) {
    console.error(chalk.red(`Error: Node.js 18+ required. Current version: ${process.versions.node}`));
    process.exit(1);
  }

  // Read existing keys
  const envPath = getEnvPath();
  let existingKeys = {};
  if (existsSync(envPath)) {
    existingKeys = dotenv.parse(readFileSync(envPath, 'utf-8'));
  }

  // Select categories
  const selectedIds = await selectCategories();

  if (selectedIds.length === 0) {
    console.log(chalk.yellow('\nNo categories selected. Run again to configure.'));
    process.exit(0);
  }

  // Collect keys
  const newKeys = await promptKeys(selectedIds, existingKeys);

  if (Object.keys(newKeys).length === 0) {
    console.log(chalk.green('\nAll selected keys are already configured!'));
    process.exit(0);
  }

  // Validate each key
  for (const [envVar, key] of Object.entries(newKeys)) {
    process.stdout.write(`  Validating ${envVar}... `);
    const result = await validateKey(envVar, key);

    if (result.skipped) {
      console.log(chalk.gray('skipped (no validation endpoint)'));
    } else if (result.valid) {
      console.log(chalk.green('valid'));
    } else {
      console.log(chalk.yellow(`could not validate: ${result.error || 'check key'}`));
      const save = await confirm({ message: 'Save anyway?', default: false });
      if (!save) {
        delete newKeys[envVar];
      }
    }
  }

  // Write keys to .env
  const { added, skipped } = await mergeEnv(newKeys);

  // Display summary
  console.log(chalk.bold.green('\nSetup complete!'));
  if (added.length > 0) {
    console.log(`  Added: ${added.join(', ')}`);
  }
  if (skipped.length > 0) {
    console.log(`  Already set: ${skipped.join(', ')}`);
  }

  console.log('\nRestart your Claude Code session for the keys to take effect.');
  console.log('Run /pocket-knife:setup inside Claude Code to verify.\n');
}

main().catch(err => {
  console.error(chalk.red('Error: ' + err.message));
  process.exit(1);
});
