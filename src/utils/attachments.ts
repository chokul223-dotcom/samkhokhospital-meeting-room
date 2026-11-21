import { BookingAttachmentUpload } from "../types"

export const MAX_ATTACHMENTS = 5
export const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024 // 8 MB
export const ACCEPTED_ATTACHMENT_ATTR =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.webp"

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".csv",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
])

export function getFileExtension(name: string): string {
  const idx = name.lastIndexOf(".")
  return idx >= 0 ? name.slice(idx).toLowerCase() : ""
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function getFileCategory(
  mimeType: string,
  fileName: string,
): "pdf" | "word" | "excel" | "ppt" | "image" | "text" | "other" {
  const ext = getFileExtension(fileName)
  const mime = (mimeType || "").toLowerCase()
  if (ext === ".pdf" || mime === "application/pdf") return "pdf"
  if (ext === ".doc" || ext === ".docx" || mime.includes("word")) return "word"
  if (ext === ".xls" || ext === ".xlsx" || ext === ".csv" || mime.includes("excel") || mime.includes("spreadsheet")) return "excel"
  if (ext === ".ppt" || ext === ".pptx" || mime.includes("powerpoint") || mime.includes("presentation")) return "ppt"
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext) || mime.startsWith("image/")) return "image"
  if (ext === ".txt" || mime === "text/plain") return "text"
  return "other"
}

export function isInlinePreviewable(mimeType: string, fileName: string): boolean {
  const cat = getFileCategory(mimeType, fileName)
  return cat === "pdf" || cat === "image" || cat === "text"
}

export function normalizeLinkUrl(raw: string): string | null {
  let url = raw.trim()
  if (!url) return null
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null
    return parsed.toString()
  } catch {
    return null
  }
}

export function isApprovedMember(
  user: { role?: string; department?: string | null } | null | undefined,
): boolean {
  if (!user) return false
  if (user.role === "admin") return true
  const dept = user.department
  return Boolean(
    dept && dept.trim() !== "" && dept !== "-" && dept !== "รอการตรวจสอบ",
  )
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : ""
      const commaIdx = result.indexOf(",")
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result)
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

export async function readFilesAsUploads(
  fileList: FileList | File[],
  currentCount: number,
  language: "th" | "en",
): Promise<{ uploads: BookingAttachmentUpload[]; errors: string[] }> {
  const files = Array.from(fileList)
  const uploads: BookingAttachmentUpload[] = []
  const errors: string[] = []
  let total = currentCount

  for (const file of files) {
    if (total >= MAX_ATTACHMENTS) {
      errors.push(
        language === "th"
          ? `แนบได้สูงสุด ${MAX_ATTACHMENTS} ไฟล์ต่อการจอง`
          : `Maximum ${MAX_ATTACHMENTS} files per booking`,
      )
      break
    }

    const ext = getFileExtension(file.name)
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      errors.push(
        language === "th"
          ? `ไม่รองรับไฟล์ "${file.name}" (รองรับ PDF, Word, Excel, PowerPoint, TXT, CSV, รูปภาพ)`
          : `Unsupported file type "${file.name}"`,
      )
      continue
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      errors.push(
        language === "th"
          ? `ไฟล์ "${file.name}" มีขนาดเกิน 8 MB`
          : `File "${file.name}" exceeds 8 MB limit`,
      )
      continue
    }

    const base64 = await readFileAsBase64(file)
    uploads.push({
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      data: base64,
    })
    total++
  }

  return { uploads, errors }
}
