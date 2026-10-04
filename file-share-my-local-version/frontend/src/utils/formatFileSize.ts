export function formatFileSize(bytes: number = 0) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const sizeIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** sizeIndex;

  return `${size.toFixed(size >= 10 || sizeIndex === 0 ? 0 : 1)} ${units[sizeIndex]}`;
}
