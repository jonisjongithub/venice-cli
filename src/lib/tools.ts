/**
 * Built-in Tools for Function Calling
 * 
 * These tools can be used with --tools flag in chat command.
 */

import type { ToolDefinition } from '../types/index.js';
import * as readline from 'readline';
import { getChalk } from './output.js';

// Built-in tool definitions
export const BUILTIN_TOOLS: Record<string, ToolDefinition> = {
  calculator: {
    type: 'function',
    function: {
      name: 'calculator',
      description: 'Perform mathematical calculations. Supports basic arithmetic, powers, roots, and common math functions.',
      parameters: {
        type: 'object',
        properties: {
          expression: {
            type: 'string',
            description: 'Mathematical expression to evaluate (e.g., "2 + 2", "sqrt(16)", "sin(3.14)")',
          },
        },
        required: ['expression'],
      },
    },
  },

  weather: {
    type: 'function',
    function: {
      name: 'weather',
      description: 'Get current weather information for a location. Note: This is a simulated tool for demonstration.',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'City name or location (e.g., "San Francisco, CA")',
          },
          units: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
            description: 'Temperature units',
          },
        },
        required: ['location'],
      },
    },
  },

  datetime: {
    type: 'function',
    function: {
      name: 'datetime',
      description: 'Get current date and time information',
      parameters: {
        type: 'object',
        properties: {
          timezone: {
            type: 'string',
            description: 'Timezone (e.g., "America/New_York", "UTC")',
          },
          format: {
            type: 'string',
            description: 'Output format: "full", "date", "time", or custom strftime format',
          },
        },
        required: [],
      },
    },
  },

  random: {
    type: 'function',
    function: {
      name: 'random',
      description: 'Generate random numbers or make random selections',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['number', 'choice', 'uuid'],
            description: 'Type of random value to generate',
          },
          min: {
            type: 'number',
            description: 'Minimum value (for number type)',
          },
          max: {
            type: 'number',
            description: 'Maximum value (for number type)',
          },
          choices: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of choices to pick from (for choice type)',
          },
        },
        required: ['type'],
      },
    },
  },

  base64: {
    type: 'function',
    function: {
      name: 'base64',
      description: 'Encode or decode base64 strings',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['encode', 'decode'],
            description: 'Whether to encode or decode',
          },
          text: {
            type: 'string',
            description: 'Text to encode or decode',
          },
        },
        required: ['action', 'text'],
      },
    },
  },

  hash: {
    type: 'function',
    function: {
      name: 'hash',
      description: 'Generate hash of text',
      parameters: {
        type: 'object',
        properties: {
          algorithm: {
            type: 'string',
            enum: ['md5', 'sha1', 'sha256', 'sha512'],
            description: 'Hash algorithm to use',
          },
          text: {
            type: 'string',
            description: 'Text to hash',
          },
        },
        required: ['algorithm', 'text'],
      },
    },
  },
};

// Tool execution functions
const toolExecutors: Record<string, (args: any) => Promise<string>> = {
  async calculator(args: { expression: string }): Promise<string> {
    try {
      // Safe math evaluation using Function constructor
      // Only allow math operations and functions
      const sanitized = args.expression
        .replace(/[^0-9+\-*/().%\s]|sqrt|sin|cos|tan|log|exp|abs|pow|floor|ceil|round|PI|E/gi, (match) => {
          const mathFns: Record<string, string> = {
            sqrt: 'Math.sqrt',
            sin: 'Math.sin',
            cos: 'Math.cos',
            tan: 'Math.tan',
            log: 'Math.log',
            exp: 'Math.exp',
            abs: 'Math.abs',
            pow: 'Math.pow',
            floor: 'Math.floor',
            ceil: 'Math.ceil',
            round: 'Math.round',
            PI: 'Math.PI',
            E: 'Math.E',
          };
          return mathFns[match.toLowerCase()] || match;
        });

      const result = new Function(`return ${sanitized}`)();
      return `Result: ${result}`;
    } catch (error) {
      return `Error evaluating expression: ${error}`;
    }
  },

  async weather(args: { location: string; units?: string }): Promise<string> {
    // Simulated weather data
    const units = args.units || 'fahrenheit';
    const temp = units === 'celsius' 
      ? Math.round(15 + Math.random() * 20)
      : Math.round(60 + Math.random() * 30);
    const conditions = ['sunny', 'partly cloudy', 'cloudy', 'light rain', 'clear'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return JSON.stringify({
      location: args.location,
      temperature: `${temp}°${units === 'celsius' ? 'C' : 'F'}`,
      conditions: condition,
      humidity: `${Math.round(40 + Math.random() * 40)}%`,
      note: 'This is simulated data for demonstration purposes',
    }, null, 2);
  },

  async datetime(args: { timezone?: string; format?: string }): Promise<string> {
    const now = new Date();
    
    if (args.timezone) {
      try {
        return now.toLocaleString('en-US', { timeZone: args.timezone });
      } catch {
        return `Invalid timezone: ${args.timezone}. Using local time: ${now.toLocaleString()}`;
      }
    }
    
    switch (args.format) {
      case 'date':
        return now.toLocaleDateString();
      case 'time':
        return now.toLocaleTimeString();
      case 'full':
      default:
        return now.toLocaleString();
    }
  },

  async random(args: { type: string; min?: number; max?: number; choices?: string[] }): Promise<string> {
    switch (args.type) {
      case 'number': {
        const min = args.min ?? 0;
        const max = args.max ?? 100;
        const result = Math.floor(Math.random() * (max - min + 1)) + min;
        return `Random number between ${min} and ${max}: ${result}`;
      }
      case 'choice': {
        if (!args.choices?.length) {
          return 'Error: No choices provided';
        }
        const choice = args.choices[Math.floor(Math.random() * args.choices.length)];
        return `Random choice: ${choice}`;
      }
      case 'uuid': {
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        return `UUID: ${uuid}`;
      }
      default:
        return `Unknown random type: ${args.type}`;
    }
  },

  async base64(args: { action: string; text: string }): Promise<string> {
    if (args.action === 'encode') {
      return Buffer.from(args.text).toString('base64');
    } else {
      try {
        return Buffer.from(args.text, 'base64').toString('utf-8');
      } catch {
        return 'Error: Invalid base64 string';
      }
    }
  },

  async hash(args: { algorithm: string; text: string }): Promise<string> {
    const crypto = await import('crypto');
    try {
      const hash = crypto.createHash(args.algorithm);
      hash.update(args.text);
      return hash.digest('hex');
    } catch {
      return `Error: Invalid hash algorithm "${args.algorithm}"`;
    }
  },
};

export function getToolDefinitions(toolNames: string[]): ToolDefinition[] {
  return toolNames
    .map(name => BUILTIN_TOOLS[name])
    .filter(Boolean);
}

export function listAvailableTools(): string[] {
  return Object.keys(BUILTIN_TOOLS);
}

export async function executeTool(
  name: string,
  args: unknown,
  options: { interactive?: boolean } = {}
): Promise<string> {
  const executor = toolExecutors[name];
  if (!executor) {
    return `Unknown tool: ${name}`;
  }

  // Interactive approval mode
  if (options.interactive) {
    const approved = await promptForApproval(name, args);
    if (!approved) {
      return 'Tool execution cancelled by user';
    }
  }

  try {
    return await executor(args);
  } catch (error) {
    return `Tool error: ${error}`;
  }
}

async function promptForApproval(name: string, args: unknown): Promise<boolean> {
  const c = getChalk();
  
  console.log('\n' + c.yellow('⚡ Tool Call Request'));
  console.log(`${c.cyan('Tool:')} ${name}`);
  console.log(`${c.cyan('Args:')} ${JSON.stringify(args, null, 2)}`);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(c.yellow('\nApprove? [y/N] '), (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

export function formatToolsHelp(): string {
  const c = getChalk();
  const lines: string[] = [
    c.bold('Available Tools:'),
    '',
  ];

  for (const [name, def] of Object.entries(BUILTIN_TOOLS)) {
    lines.push(`  ${c.cyan(name)}`);
    lines.push(`    ${def.function.description}`);
    lines.push('');
  }

  lines.push(c.dim('Usage: venice chat "prompt" --tools calculator,weather'));
  
  return lines.join('\n');
}
