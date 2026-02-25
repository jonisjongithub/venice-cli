# Changelog

All notable changes to Venice CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-25

### Added

- **Configuration Management**
  - Persistent config file at `~/.venice/config.json`
  - `venice config` command with init, show, set, get, unset subcommands
  - Support for default model, voice, and output format preferences
  
- **Improved Streaming**
  - Proper TTY detection
  - Spinner animation while waiting for response
  - Automatic format detection for piped output
  
- **Function Calling / Tools**
  - `--tools` flag for enabling built-in tools
  - Built-in tools: calculator, weather, datetime, random, base64, hash
  - `--interactive-tools` flag for manual tool approval
  - `--list-tools` to see available tools
  
- **Character Personas**
  - `--character` flag for chat command
  - Built-in characters: pirate, wizard, scientist, poet, coder, teacher, comedian, philosopher
  - `venice characters` command to list available personas
  
- **Conversation History**
  - `--continue` flag to continue previous conversation
  - `venice history` command with list, show, clear, export subcommands
  - Local history storage with automatic cleanup
  
- **Output Formats**
  - `--format` flag supporting pretty, json, markdown, raw
  - Automatic pipe detection for raw output
  - `--no-color` global flag
  
- **Usage Tracking**
  - Token usage displayed after each request
  - `venice usage` command for statistics
  - Daily, weekly, monthly views
  
- **New Commands**
  - `venice embeddings` - Generate text embeddings
  - `venice upscale` - Upscale images
  - `venice voices` - List available TTS voices
  - `venice characters` - List available personas
  - `venice usage` - Show usage statistics
  
- **Shell Completions**
  - `venice completions bash|zsh|fish`
  - Full command and option completion
  
- **Better Error Handling**
  - Helpful error messages with suggestions
  - Retry logic for transient failures
  - Offline detection
  - Graceful handling of missing API key

### Changed

- Complete rewrite in TypeScript with strict mode
- Modular architecture with separate command files
- Uses chalk for colored output
- Uses ora for spinners
- ESM module system

### Fixed

- Streaming output now properly handles line breaks
- API key validation before requests
- Proper exit codes on errors

## [1.0.0] - 2026-02-08

### Added

- Initial release
- Basic commands: chat, search, image, tts, transcribe, models
- Environment variable configuration
- Streaming chat output
- JSON output option

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 2.0.0 | 2026-02-25 | Complete rewrite, tools, personas, history |
| 1.0.0 | 2026-02-08 | Initial release |
