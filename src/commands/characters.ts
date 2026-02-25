/**
 * Characters Command - List available chat characters/personas
 */

import { Command } from 'commander';
import { getAvailableCharacters } from './chat.js';
import { getChalk, detectOutputFormat } from '../lib/output.js';

// Character details
const CHARACTER_DETAILS: Record<string, { name: string; description: string; sample: string }> = {
  pirate: {
    name: 'Pirate Captain',
    description: 'A swashbuckling sea captain who speaks in nautical terms',
    sample: 'Arrr, matey! What brings ye to these digital waters?',
  },
  wizard: {
    name: 'Wise Wizard',
    description: 'A mystical sage with ancient knowledge',
    sample: 'Greetings, seeker of wisdom. The stars foretold your coming...',
  },
  scientist: {
    name: 'Brilliant Scientist',
    description: 'A precise, analytical mind focused on data and evidence',
    sample: 'Based on current evidence, I can provide several hypotheses...',
  },
  poet: {
    name: 'Romantic Poet',
    description: 'An artistic soul who finds beauty in everything',
    sample: 'Like moonlight dancing on still waters, your question stirs my soul...',
  },
  coder: {
    name: 'Senior Engineer',
    description: 'A practical developer focused on clean, maintainable code',
    sample: "Let's break this down into manageable components...",
  },
  teacher: {
    name: 'Patient Teacher',
    description: 'An educator who explains concepts clearly',
    sample: "Great question! Let me explain this step by step...",
  },
  comedian: {
    name: 'Stand-up Comedian',
    description: 'Finds humor in everything while still being helpful',
    sample: "Why did the AI cross the road? To process the other side! But seriously...",
  },
  philosopher: {
    name: 'Deep Philosopher',
    description: 'Questions assumptions and explores ideas deeply',
    sample: 'But what is the true nature of your question? Let us examine...',
  },
};

export function registerCharactersCommand(program: Command): void {
  program
    .command('characters')
    .description('List available chat characters/personas')
    .option('-f, --format <format>', 'Output format (pretty|json)')
    .action((options) => {
      const format = detectOutputFormat(options.format);
      const c = getChalk();
      const characters = getAvailableCharacters();

      if (format === 'json') {
        const data = characters.map(id => ({
          id,
          ...CHARACTER_DETAILS[id],
        }));
        console.log(JSON.stringify(data, null, 2));
        return;
      }

      console.log(c.bold('\n🎭 Available Characters\n'));
      console.log(c.dim('Use these personas to customize how the AI responds.\n'));

      for (const id of characters) {
        const details = CHARACTER_DETAILS[id] || { name: id, description: '', sample: '' };
        
        console.log(`${c.cyan(c.bold(id))} — ${details.name}`);
        console.log(`  ${c.dim(details.description)}`);
        if (details.sample) {
          console.log(`  ${c.italic(`"${details.sample}"`)}`);
        }
        console.log('');
      }

      console.log(c.dim('Usage: venice chat --character pirate "Tell me about AI"'));
    });
}
