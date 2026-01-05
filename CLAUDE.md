# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that connects Claude Desktop to Google Drive, enabling Claude to access and interact with Drive files and folders. The server uses OAuth 2.0 for authentication and communicates via stdio transport.

## Build and Development Commands

```bash
# Build the TypeScript project
npm run build

# Generate Google OAuth token (required before first run)
npm run tokenGenerator
```

Note: There are no tests configured yet (`npm test` exits with an error).

## Architecture

### MCP Server Pattern

The codebase follows a simple, consolidated architecture:

1. **Utilities layer** (`src/util.ts`): Core business logic that interacts with Google Drive API
   - `listAllFolders()`: Retrieves all folders from Google Drive
   - `listFilesInFolder()`: Lists files within a specific folder
   - `returnFile()`: Gets details for a specific file

2. **Tools layer** (`src/tools.ts`): MCP tool registration and orchestration
   - `registerAllTools()`: Registers all MCP tools with the server
   - Each registration function handles tool schema definition, input validation, and response formatting
   - Transforms utility function responses into MCP response format with `content` array

3. **Entry point** (`src/index.ts`): Initializes the MCP server with stdio transport

### Google Authentication Flow

- OAuth2 client is configured in `src/google.ts`
- Credentials (CLIENT_ID, CLIENT_SECRET, REDIRECT_URI) are loaded from environment variables
- Token is stored in `token.json` at project root (generated via `tokenGenerator` script)
- Token auto-refresh is handled via the `oauth2Client.on('tokens')` event handler

### Key Design Patterns

- **ES Modules**: Project uses ES modules (`"type": "module"` in package.json)
- **Path resolution**: Uses `fileURLToPath` and `path.dirname` for `__dirname` in ES modules
- **Response typing**: All functions return typed response objects with `success` boolean and optional `message`
- **Error handling**: Try-catch blocks in functions return error messages in response objects; tools layer handles errors with `isError: true`

## Environment Setup Requirements

Before running the server, you must:

1. Create a `.env` file with Google OAuth credentials:
   - `CLIENT_ID`
   - `CLIENT_SECRET`
   - `REDIRECT_URI` (default: http://localhost:3000)

2. Generate authentication token by running `npm run tokenGenerator`

3. Build the project with `npm run build`

4. Configure Claude Desktop's `claude_desktop_config.json` to point to `build/index.js` with environment variables

## File Structure

```
src/
├── index.ts                 # MCP server entry point
├── types.ts                 # Shared TypeScript interfaces
├── util.ts                  # Google Drive API interaction utilities
├── tools.ts                 # MCP tool registrations
├── google.ts                # OAuth2 client and Drive API setup
└── tokenGenerator.ts        # OAuth token generation script
```

## Adding New Tools

To add a new Google Drive tool:

1. Add the business logic function to `src/util.ts` and export it
2. Define the response type interface in `src/types.ts`
3. Create a registration function in `src/tools.ts` following the naming pattern `register[ToolName]Tool()`
4. Call the registration function from `registerAllTools()` in `src/tools.ts`

Follow the existing pattern where utility functions return `{ success: boolean, data?: T, message?: string }` and tool registration functions transform this into MCP response format with `content` array.
