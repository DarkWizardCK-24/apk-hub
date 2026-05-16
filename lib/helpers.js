export function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
  return (bytes / 1073741824).toFixed(2) + " GB";
}

export function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString();
}

export function getPlatformFromFile(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["apk", "aab"].includes(ext)) return "Android";
  if (["ipa"].includes(ext)) return "iOS";
  return "Web";
}

export function getFileType(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map = {
    apk: "APK",
    aab: "AAB",
    ipa: "IPA",
    zip: "ZIP",
    "tar.gz": "TAR.GZ",
    tgz: "TGZ",
    js: "JS Bundle",
    html: "Web Build",
  };
  return map[ext] || ext?.toUpperCase() || "File";
}
