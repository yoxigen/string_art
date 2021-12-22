export async function share(input) {
  try {
    navigator.share(await getShareData(input));
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

export async function isShareSupported(input) {
  if (!navigator.share) {
    return false;
  }

  const shareData = await getShareData(input);
  return navigator.canShare(shareData);
}

async function getShareData({ canvas, pattern }) {
  const dataUrl = canvas.toDataURL();
  const blob = await (await fetch(dataUrl)).blob();
  const files = [
    new File([blob], pattern.name + '.jpg', {
      type: blob.type,
      lastModified: new Date().getTime(),
    }),
  ];
  return {
    url: window.location.href,
    files,
    title: document.title,
  };
}
