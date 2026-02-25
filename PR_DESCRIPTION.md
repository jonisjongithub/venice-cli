# Pull Request: Venice CLI 2.0.0

## Summary

This PR introduces Venice CLI 2.0.0 - a comprehensive, production-ready command-line interface for Venice AI. The CLI enables developers to access all Venice AI capabilities from their terminal with a focus on privacy, usability, and extensibility.

## Motivation

1. **Developer Demand**: Strong community interest in CLI access for scripting and automation
2. **Privacy Positioning**: "No browser, no tracking" - CLI reinforces Venice's privacy-first values
3. **Competitive Parity**: Official CLI offerings from competitors (OpenAI, Anthropic)
4. **Ecosystem Foundation**: Enables tooling, integrations, and community contributions

## Features

### Core Capabilities
- ✅ **Chat** with streaming, models, system prompts
- ✅ **Web Search** with AI synthesis
- ✅ **Image Generation** with save-to-file
- ✅ **Image Upscaling**
- ✅ **Text-to-Speech** with multiple voices
- ✅ **Speech-to-Text** transcription
- ✅ **Embeddings** generation

### Advanced Features
- ✅ **Configuration Management** (`~/.venice/config.json`)
- ✅ **Function Calling** with built-in tools (calculator, weather, datetime, etc.)
- ✅ **Character Personas** (pirate, wizard, scientist, coder, etc.)
- ✅ **Conversation History** with `--continue` flag
- ✅ **Usage Tracking** with statistics
- ✅ **Shell Completions** (bash, zsh, fish)

### User Experience
- ✅ **Colored output** with `--no-color` option
- ✅ **Spinners** during processing
- ✅ **Multiple output formats** (pretty, json, markdown, raw)
- ✅ **Pipe-friendly** auto-detection
- ✅ **Helpful error messages** with suggestions
- ✅ **Retry logic** for transient failures

## Technical Details

### Stack
- **Language**: TypeScript with strict mode
- **Runtime**: Node.js 18+
- **Framework**: Commander.js
- **Styling**: Chalk, Ora
- **Module System**: ESM

### Structure
```
src/
├── index.ts           # Entry point
├── commands/          # 11 command modules
├── lib/               # Shared utilities (api, config, output, tools)
└── types/             # TypeScript definitions
```

### Dependencies
- `commander` - CLI framework
- `chalk` - Terminal colors
- `ora` - Spinners
- Zero unnecessary dependencies

## Testing Checklist

- [x] All commands parse and show help
- [x] TypeScript compiles with strict mode
- [x] Build produces working distribution
- [x] --no-color flag works
- [x] --help on all commands
- [x] Output formats work (pretty, json, markdown, raw)
- [x] Pipe detection works
- [x] Config file creation with proper permissions
- [ ] End-to-end API tests (requires API key)

## Documentation

- [x] Comprehensive README.md
- [x] CONTRIBUTING.md with guidelines
- [x] CHANGELOG.md
- [x] LICENSE (MIT)
- [x] PROPOSAL.md (RFC-style design doc)
- [x] Help text for all commands

## Breaking Changes

This is a major version bump from the prototype. Changes from 1.0:
- Complete rewrite with new architecture
- New command options and flags
- Config file location standardized

## Deployment

### npm Publishing
```bash
npm publish
```

### Installation
```bash
npm install -g venice-cli
```

## Future Enhancements

Not included in this PR but planned:
- Interactive REPL mode
- Plugin system for custom tools
- Local model support
- Batch processing
- More characters/voices

## Screenshots

### Help Output
```
$ venice --help
Usage: venice [options] [command]

Venice CLI — Privacy-first AI from the command line

Chat with AI models, generate images, convert text to speech, and more.
All with Venice's privacy-preserving infrastructure.

Commands:
  chat [options] [prompt...]            Chat with an AI model
  search [options] <query...>           Web search with AI-powered synthesis
  image [options] <prompt...>           Generate an image
  ...
```

### Characters
```
$ venice characters
🎭 Available Characters

pirate — Pirate Captain
  A swashbuckling sea captain who speaks in nautical terms
  "Arrr, matey! What brings ye to these digital waters?"

wizard — Wise Wizard
  A mystical sage with ancient knowledge
  "Greetings, seeker of wisdom. The stars foretold your coming..."
...
```

## Reviewers

Please review:
- [ ] API client implementation (`src/lib/api.ts`)
- [ ] Error handling patterns
- [ ] Security (no credential leaks)
- [ ] Help text quality
- [ ] TypeScript types

---

**Ready for review and merge.**
