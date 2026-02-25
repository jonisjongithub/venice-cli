/**
 * Audio Commands - Text-to-speech and transcription
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { textToSpeech, transcribe } from '../lib/api.js';
import { getDefaultVoice } from '../lib/config.js';
import {
  formatSuccess,
  formatError,
  getChalk,
  detectOutputFormat,
} from '../lib/output.js';

export function registerAudioCommands(program: Command): void {
  // Text to speech
  program
    .command('tts <text...>')
    .alias('speak')
    .description('Convert text to speech')
    .option('-v, --voice <voice>', 'Voice to use')
    .option('-m, --model <model>', 'Model to use', 'tts-kokoro')
    .option('-o, --output <path>', 'Output file path', 'output.mp3')
    .option('--format <fmt>', 'Audio format (mp3|wav|opus)', 'mp3')
    .action(async (textParts: string[], options) => {
      let text = textParts.join(' ');
      
      // Read from stdin if no text provided
      if (!text && !process.stdin.isTTY) {
        text = await readStdin();
      }

      if (!text) {
        console.error(formatError('No text provided. Usage: venice tts "Your text"'));
        process.exit(1);
      }

      const voice = options.voice || getDefaultVoice();

      try {
        const audioBuffer = await textToSpeech(text, {
          model: options.model,
          voice,
          format: options.format,
        });

        // Determine output path
        let outputPath = options.output;
        if (!outputPath.endsWith(`.${options.format}`)) {
          outputPath = outputPath.replace(/\.[^.]+$/, `.${options.format}`);
        }

        fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
        console.log(formatSuccess(`Saved audio to ${outputPath}`));
      } catch (error) {
        console.error(formatError(error instanceof Error ? error.message : String(error)));
        process.exit(1);
      }
    });

  // Transcription
  program
    .command('transcribe <audio>')
    .description('Transcribe audio to text')
    .option('-m, --model <model>', 'Model to use', 'whisper-large')
    .option('-l, --language <lang>', 'Audio language (ISO code)')
    .option('-f, --format <format>', 'Output format (pretty|json|raw)')
    .action(async (audioPath: string, options) => {
      const format = detectOutputFormat(options.format);

      // Resolve path
      const resolvedPath = path.resolve(audioPath);
      
      if (!fs.existsSync(resolvedPath)) {
        console.error(formatError(`File not found: ${audioPath}`));
        process.exit(1);
      }

      try {
        const result = await transcribe(resolvedPath, {
          model: options.model,
          language: options.language,
        });

        if (format === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(result.text);
        }
      } catch (error) {
        console.error(formatError(error instanceof Error ? error.message : String(error)));
        process.exit(1);
      }
    });

  // List available voices
  program
    .command('voices')
    .description('List available TTS voices')
    .option('-f, --format <format>', 'Output format (pretty|json)')
    .action((options) => {
      const format = detectOutputFormat(options.format);
      const c = getChalk();

      // Common Kokoro voices
      const voices = [
        { id: 'af_sky', name: 'Sky (American Female)', language: 'en-US' },
        { id: 'af_bella', name: 'Bella (American Female)', language: 'en-US' },
        { id: 'af_nicole', name: 'Nicole (American Female)', language: 'en-US' },
        { id: 'am_adam', name: 'Adam (American Male)', language: 'en-US' },
        { id: 'am_michael', name: 'Michael (American Male)', language: 'en-US' },
        { id: 'bf_emma', name: 'Emma (British Female)', language: 'en-GB' },
        { id: 'bf_isabella', name: 'Isabella (British Female)', language: 'en-GB' },
        { id: 'bm_george', name: 'George (British Male)', language: 'en-GB' },
        { id: 'bm_lewis', name: 'Lewis (British Male)', language: 'en-GB' },
      ];

      if (format === 'json') {
        console.log(JSON.stringify(voices, null, 2));
        return;
      }

      console.log(c.bold('Available TTS Voices\n'));
      console.log(`${c.dim('ID'.padEnd(15))} ${c.dim('Name'.padEnd(30))} ${c.dim('Language')}`);
      console.log(c.dim('─'.repeat(60)));

      for (const voice of voices) {
        console.log(`${c.cyan(voice.id.padEnd(15))} ${voice.name.padEnd(30)} ${voice.language}`);
      }

      console.log(`\n${c.dim('Usage: venice tts "Hello world" --voice af_bella')}`);
    });
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8').trim();
}
