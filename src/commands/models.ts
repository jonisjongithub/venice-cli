/**
 * Models Command - List and filter available models
 */

import { Command } from 'commander';
import { listModels } from '../lib/api.js';
import {
  formatError,
  getChalk,
  detectOutputFormat,
} from '../lib/output.js';
import type { Model } from '../types/index.js';

export function registerModelsCommand(program: Command): void {
  program
    .command('models')
    .description('List available models')
    .option('-t, --type <type>', 'Filter by type (text|image|audio|embedding|code)')
    .option('-s, --search <query>', 'Search models by name')
    .option('--privacy', 'Show only privacy-preserving models')
    .option('-f, --format <format>', 'Output format (pretty|json)')
    .action(async (options) => {
      const format = detectOutputFormat(options.format);
      const c = getChalk();

      try {
        let models = await listModels();

        // Filter by type
        if (options.type) {
          const typeMap: Record<string, string[]> = {
            text: ['text', 'chat', 'llm'],
            image: ['image', 'diffusion', 'flux', 'sdxl'],
            audio: ['audio', 'tts', 'stt', 'whisper', 'speech'],
            embedding: ['embedding', 'embed'],
            code: ['code', 'codestral', 'deepseek-coder'],
          };
          const searchTerms = typeMap[options.type.toLowerCase()] || [options.type];
          models = models.filter((m: Model) =>
            searchTerms.some(term =>
              m.id?.toLowerCase().includes(term) ||
              m.type?.toLowerCase().includes(term)
            )
          );
        }

        // Filter by search query
        if (options.search) {
          const query = options.search.toLowerCase();
          models = models.filter((m: Model) =>
            m.id?.toLowerCase().includes(query) ||
            m.model_spec?.description?.toLowerCase().includes(query)
          );
        }

        // Filter by privacy
        if (options.privacy) {
          models = models.filter((m: Model) =>
            m.model_spec?.capabilities?.privacy
          );
        }

        // Sort by id
        models.sort((a: Model, b: Model) => (a.id || '').localeCompare(b.id || ''));

        if (format === 'json') {
          console.log(JSON.stringify(models, null, 2));
          return;
        }

        if (models.length === 0) {
          console.log(c.yellow('No models found matching your criteria.'));
          return;
        }

        console.log(c.bold(`\n📋 Available Models (${models.length})\n`));

        // Group by type
        const grouped = groupModelsByType(models);

        for (const [type, typeModels] of Object.entries(grouped)) {
          console.log(c.bold(`\n${getTypeEmoji(type)} ${capitalizeFirst(type)} Models`));
          console.log(c.dim('─'.repeat(50)));

          for (const model of typeModels) {
            const privacy = model.model_spec?.capabilities?.privacy ? c.green('🔒') : c.dim('📊');
            console.log(`  ${privacy} ${c.cyan(model.id)}`);
            
            if (model.model_spec?.description) {
              const desc = model.model_spec.description;
              const truncated = desc.length > 60 ? desc.slice(0, 60) + '...' : desc;
              console.log(`     ${c.dim(truncated)}`);
            }
          }
        }

        console.log(`\n${c.dim('🔒 = Privacy-preserving (no data retention)')}`);
        console.log(c.dim('📊 = Standard model'));
      } catch (error) {
        console.error(formatError(error instanceof Error ? error.message : String(error)));
        process.exit(1);
      }
    });
}

function groupModelsByType(models: Model[]): Record<string, Model[]> {
  const groups: Record<string, Model[]> = {};

  for (const model of models) {
    let type = 'other';
    const id = (model.id || '').toLowerCase();

    if (id.includes('llama') || id.includes('mistral') || id.includes('qwen') || 
        id.includes('dolphin') || id.includes('nous') || id.includes('deepseek') && !id.includes('coder')) {
      type = 'text';
    } else if (id.includes('flux') || id.includes('sdxl') || id.includes('fluently') ||
               id.includes('stable-diffusion') || id.includes('image')) {
      type = 'image';
    } else if (id.includes('whisper') || id.includes('tts') || id.includes('kokoro') ||
               id.includes('speech') || id.includes('audio')) {
      type = 'audio';
    } else if (id.includes('embed') || id.includes('bge')) {
      type = 'embedding';
    } else if (id.includes('coder') || id.includes('codestral')) {
      type = 'code';
    }

    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(model);
  }

  return groups;
}

function getTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    text: '💬',
    image: '🖼️',
    audio: '🎵',
    embedding: '📐',
    code: '💻',
    other: '📦',
  };
  return emojis[type] || '📦';
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
