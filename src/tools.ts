import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { listAllFolders, listFilesInFolder, returnFile } from './util.js'
import { ListFoldersResponse, ListFilesResponse, ReturnFileResponse } from './types.js'

export function registerAllTools(server: McpServer) {
  registerListAllFoldersTool(server)
  registerListFilesInFolderTool(server)
  registerReturnFileTool(server)
}

function registerListAllFoldersTool(server: McpServer) {
  server.tool(
    'list-all-folders',
    "Retrieves all folders from the client's Google Drive. This is typically used as the first step to help the language model infer which specific folder to search in for a given document request.",
    {},
    async () => {
      let text: string
      let isError = false

      try {
        const response: ListFoldersResponse = await listAllFolders()

        if (response?.success) {
          text = JSON.stringify(response.folders, null, 2)
        } else {
          text = 'Failed to retrieve folders'
          isError = true
        }
      } catch (error) {
        text = `Error listing folders: ${error}`
        isError = true
      }

      return {
        content: [
          {
            type: 'text',
            text,
          },
        ],
        ...(isError && { isError }),
      }
    }
  )
}

function registerListFilesInFolderTool(server: McpServer) {
  server.tool(
    'list-files-in-folder',
    "Retrieves all files within a specified folder in the client's Google Drive. This is typically used after selecting the correct folder to locate a specific document requested by the user.",
    {
      folderId: z.string().describe('The ID of the folder to list files from'),
    },
    async ({ folderId }) => {
      let text: string
      let isError = false

      try {
        const response: ListFilesResponse = await listFilesInFolder(folderId)

        if (response?.success) {
          text = JSON.stringify(response.files, null, 2)
        } else {
          text = 'Failed to retrieve files in the folder.'
          isError = true
        }
      } catch (error) {
        text = `Error listing files in folder: ${error}`
        isError = true
      }

      return {
        content: [
          {
            type: 'text',
            text,
          },
        ],
        ...(isError && { isError }),
      }
    }
  )
}

function registerReturnFileTool(server: McpServer) {
  server.tool(
    'get-file-download-link',
    "Retrieves a direct download link for a specific file in the client's Google Drive. This is typically used after identifying the desired file to provide access for download or online viewing.",
    {
      fileId: z
        .string()
        .describe('The ID of the file to retrieve the download link for'),
    },
    async ({ fileId }) => {
      let text: string
      let isError = false

      try {
        const response: ReturnFileResponse = await returnFile(fileId)

        if (response?.success) {
          text = `Download **${response.file?.name}**:\n${response.file?.downloadLink}\n\nView Online:\n${response.file?.viewLink}`
        } else {
          text = response.message || 'Failed to retrieve the file download link.'
          isError = true
        }
      } catch (error) {
        text = `Error retrieving file download link: ${error}`
        isError = true
      }

      return {
        content: [
          {
            type: 'text',
            text,
          },
        ],
        ...(isError && { isError }),
      }
    }
  )
}
