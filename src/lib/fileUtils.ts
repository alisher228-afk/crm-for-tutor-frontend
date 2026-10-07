import { getStoredAccessToken } from '@/api/client'

/**
 * Creates a direct downloadable URL with bearer token in query parameter
 */
export function getDirectFileUrl(apiPath: string): string {
  const token = getStoredAccessToken()
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
  const separator = apiPath.includes('?') ? '&' : '?'
  const tokenParam = token ? `${separator}token=${encodeURIComponent(token)}` : ''
  return `${base}${apiPath}${tokenParam}`
}

/**
 * Checks whether the app is currently running inside Telegram WebApp
 */
export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData
}

/**
 * Handles downloading a file across web, mobile, and Telegram Mini App environments.
 */
export async function triggerFileDownload({
  blob,
  fileName,
  apiPath,
}: {
  blob?: Blob
  fileName: string
  apiPath?: string
}): Promise<void> {
  const isTg = isTelegramWebApp()

  // 1. In Telegram WebApp, prefer Telegram.WebApp.openLink with direct URL
  // This hands off download to the device's native browser (Safari/Chrome),
  // which saves the file directly to device Downloads without breaking Webview.
  if (isTg && apiPath && window.Telegram?.WebApp?.openLink) {
    const directUrl = getDirectFileUrl(apiPath)
    try {
      window.Telegram.WebApp.openLink(directUrl)
      return
    } catch (e) {
      console.warn('Failed to open link via Telegram WebApp, falling back to blob', e)
    }
  }

  // 2. If blob is provided, use standard browser download link
  if (blob) {
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl)
    }, 60000)
    return
  }

  // 3. Fallback: navigate to direct URL
  if (apiPath) {
    const directUrl = getDirectFileUrl(apiPath)
    window.open(directUrl, '_blank')
  }
}
