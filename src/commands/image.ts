/**
 * Image Command - Generate and manipulate images
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { generateImage, upscaleImage } from '../lib/api.js';
import { getDefaultImageModel } from '../lib/config.js';
import {
  formatSuccess,
  formatError,
  getChalk,
  detectOutputFormat,
} from '../lib/output.js';

export function registerImageCommand(program: Command): void {
  // Generate image
  program
    .command('image <prompt...>')
    .description('Generate an image from a text prompt')
    .option('-m, --model <model>', 'Model to use')
    .option('-o, --output <path>', 'Save image to file')
    .option('-w, --width <pixels>', 'Image width', '1024')
    .option('-h, --height <pixels>', 'Image height', '1024')
    .option('-n, --count <number>', 'Number of images to generate', '1')
    .option('-f, --format <format>', 'Output format (pretty|json)')
    .action(async (promptParts: string[], options) => {
      const prompt = promptParts.join(' ');
      const model = options.model || getDefaultImageModel();
      const format = detectOutputFormat(options.format);
      const c = getChalk();

      try {
        const images = await generateImage(prompt, {
          model,
          width: parseInt(options.width, 10),
          height: parseInt(options.height, 10),
          n: parseInt(options.count, 10),
        });

        if (format === 'json') {
          console.log(JSON.stringify({ images }, null, 2));
          return;
        }

        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          
          if (options.output) {
            // Download and save
            const response = await fetch(img.url);
            const buffer = await response.arrayBuffer();
            
            let outputPath = options.output;
            if (images.length > 1) {
              const ext = path.extname(outputPath);
              const base = path.basename(outputPath, ext);
              const dir = path.dirname(outputPath);
              outputPath = path.join(dir, `${base}_${i + 1}${ext}`);
            }
            
            fs.writeFileSync(outputPath, Buffer.from(buffer));
            console.log(formatSuccess(`Saved to ${outputPath}`));
          } else {
            console.log(`${c.cyan('🖼️  Image URL:')} ${img.url}`);
          }

          if (img.revised_prompt) {
            console.log(`${c.dim('Revised prompt:')} ${img.revised_prompt}`);
          }
        }
      } catch (error) {
        console.error(formatError(error instanceof Error ? error.message : String(error)));
        process.exit(1);
      }
    });

  // Upscale image
  program
    .command('upscale <image>')
    .description('Upscale an image')
    .option('-m, --model <model>', 'Model to use')
    .option('-s, --scale <factor>', 'Scale factor (2 or 4)', '2')
    .option('-o, --output <path>', 'Save result to file')
    .option('-f, --format <format>', 'Output format (pretty|json)')
    .action(async (imagePath: string, options) => {
      const format = detectOutputFormat(options.format);
      const c = getChalk();

      // Resolve path
      const resolvedPath = path.resolve(imagePath);
      
      if (!fs.existsSync(resolvedPath)) {
        console.error(formatError(`File not found: ${imagePath}`));
        process.exit(1);
      }

      try {
        const result = await upscaleImage(resolvedPath, {
          model: options.model,
          scale: parseInt(options.scale, 10),
        });

        if (format === 'json') {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        if (options.output) {
          const response = await fetch(result.url);
          const buffer = await response.arrayBuffer();
          fs.writeFileSync(options.output, Buffer.from(buffer));
          console.log(formatSuccess(`Saved upscaled image to ${options.output}`));
        } else {
          console.log(`${c.cyan('🖼️  Upscaled URL:')} ${result.url}`);
        }
      } catch (error) {
        console.error(formatError(error instanceof Error ? error.message : String(error)));
        process.exit(1);
      }
    });
}
