// Supabase Image Transformations serve smaller, correctly sized variants from
// the same public object. External image URLs remain untouched as a safe
// fallback.
export function optimizedImage(url, width, quality = 70) {
  if (!url || !width) return url
  const publicObjectPath = '/storage/v1/object/public/'
  const index = url.indexOf(publicObjectPath)
  if (index === -1) return url
  const base = url.slice(0, index)
  const objectPath = url.slice(index + publicObjectPath.length).split('?')[0]
  return `${base}/storage/v1/render/image/public/${objectPath}?width=${width}&quality=${quality}`
}
