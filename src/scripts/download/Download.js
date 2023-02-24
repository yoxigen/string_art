export function downloadFile(dataUrl, fileName) {
  const downloadLink = document.createElement('a');
  downloadLink.href = dataUrl;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
