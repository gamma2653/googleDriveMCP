import { Folder, ListFoldersResponse, ListFilesResponse, ReturnFileResponse } from './types.js'
import { drive } from './google/googleClient.js'

export const listAllFolders = async (): Promise<ListFoldersResponse> => {
  try {
    const folderQuery = `mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    const folderRes = await drive.files.list({
      q: folderQuery,
      fields: 'files(id, name)',
      spaces: 'drive',
      pageSize: 1000,
    })

    const folders: Folder[] =
      folderRes.data.files?.map((folder) => ({
        id: folder.id,
        name: folder.name,
      })) || []

    return {
      success: true,
      folders,
    }
  } catch (error) {
    console.error('Error listing client folders:', error)
    return {
      success: false,
      message: `Error listing client folders: ${error}`,
    }
  }
}

export const listFilesInFolder = async (
  folderId: string
): Promise<ListFilesResponse> => {
  try {
    const fileQuery = `'${folderId}' in parents and trashed = false`
    const fileRes = await drive.files.list({
      q: fileQuery,
      fields: 'files(id, name)',
      spaces: 'drive',
      pageSize: 1000,
    })

    const files =
      fileRes.data.files?.map((file) => ({
        id: file.id,
        name: file.name,
      })) || []

    return {
      success: true,
      files,
    }
  } catch (error) {
    console.error('Error listing files in folder:', error)
    return {
      success: false,
      message: `Error listing files in folder: ${error}`,
    }
  }
}

export const returnFile = async (
  fileId: string
): Promise<ReturnFileResponse> => {
  try {
    const res = await drive.files.get({
      fileId,
      fields: 'id, name, webViewLink, webContentLink',
      alt: 'json',
    })

    const file = res.data

    return {
      success: true,
      file: {
        id: file.id,
        name: file.name,
        viewLink: file.webViewLink,
        downloadLink: file.webContentLink,
      },
    }
  } catch (error) {
    console.error('Error getting file download link:', error)
    return {
      success: false,
      message: `Error getting file download link: ${error}`,
    }
  }
}
