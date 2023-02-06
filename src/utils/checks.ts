export function checkAvatar(file: ArrayBuffer) {
  return file.byteLength <= 2_000_000 // 2 MB
}
