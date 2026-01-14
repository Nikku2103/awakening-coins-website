function isDirectImageUrl(url) {
  return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(url);
}

function normalizeDropboxUrl(url) {
  if (!url.includes('dropbox.com')) return null;

  // Convert dl=0 → raw=1
  if (url.includes('?dl=0')) {
    return url.replace('?dl=0', '?raw=1');
  }

  if (!url.includes('?raw=1')) {
    return url + '?raw=1';
  }

  return url;
}

function isGoogleBlocked(url) {
  return (
    url.includes('drive.google.com') ||
    url.includes('photos.google.com')
  );
}

module.exports = {
  isDirectImageUrl,
  normalizeDropboxUrl,
  isGoogleBlocked
};
