const downloadURL = function (data: string, fileName: string): void {
  const a = document.createElement("a");
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.style.display = "none";
  a.click();
  a.remove();
};

export function saveFile(name: string, contents: BlobPart): void {
  if (!name) {
    throw new Error("Name can't be blank");
  }

  const blob = new Blob([contents], {
    type: "application/octet-stream",
  });

  const url = window.URL.createObjectURL(blob);
  downloadURL(url, name);
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}
