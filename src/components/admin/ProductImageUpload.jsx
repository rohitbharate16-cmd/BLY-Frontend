export default function ProductImageUpload({ file, setFile, currentImage }) {
  return (
    <aside className="fixed bottom-5 left-4 right-4 z-[110] border border-[#E8DED2] bg-paper p-4 shadow-xl sm:bottom-8 sm:left-auto sm:right-8 sm:w-80">
      <p className="text-xs uppercase tracking-[0.14em] text-taupe">Product image</p>
      <label className="mt-3 block cursor-pointer border border-dashed border-champagne bg-cream px-3 py-4 text-center text-sm text-brown transition hover:bg-ivory">
        <span className="block font-medium text-espresso">{file ? file.name : currentImage ? 'Replace current image' : 'Choose product image'}</span>
        <span className="mt-1 block text-xs text-taupe">JPG, PNG, WebP, or AVIF · 8 MB max</span>
        <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setFile(event.target.files?.[0] || null)} />
      </label>
      {file && <button type="button" className="mt-3 text-xs uppercase tracking-[0.12em] text-brown underline" onClick={() => setFile(null)}>Keep current image</button>}
      <p className="mt-3 text-xs leading-relaxed text-taupe">The file uploads to Supabase Storage only when you save the product.</p>
    </aside>
  )
}
