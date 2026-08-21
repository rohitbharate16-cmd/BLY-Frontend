import { useEffect, useMemo, useState } from 'react'
import {
  archiveAdminProduct,
  createAdminCategory,
  createAdminProduct,
  deleteAdminCategory,
  getAdminCategories,
  getAdminProducts,
  updateAdminCategory,
  updateAdminProduct,
  uploadAdminProductImage,
} from '../api/admin'
import ProductImageUpload from '../components/admin/ProductImageUpload'
import { invalidateProductCache } from '../api/products'
import { invalidateCategoryCache } from '../api/categories'

const emptyProduct = {
  name: '', slug: '', categoryId: '', productType: '', shortDescription: '', description: '', howToUse: '', concern: '', tags: [], price: '', rating: 0, reviewCount: 0, featured: false, bestseller: false, newArrival: false, image: '', isActive: true,
}
const emptyCategory = { name: '', slug: '', description: '', image: '' }

function messageFrom(error) {
  return error?.message || 'Something went wrong. Please try again.'
}

function Field({ label, children }) {
  // Product imagery is managed through the file upload control, not pasted
  // URLs. Category image URL controls remain available until categories get
  // their own media library.
  if (label === 'Product image URL') return null
  return <label className="block text-xs uppercase tracking-[0.13em] text-taupe"><span className="mb-2 block">{label}</span>{children}</label>
}

const inputClass = 'w-full border border-[#E8DED2] bg-paper px-4 py-3 text-base text-espresso outline-none transition focus:border-champagne focus:ring-1 focus:ring-champagne'

export default function Admin() {
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [productDraft, setProductDraft] = useState(null)
  const [categoryDraft, setCategoryDraft] = useState(null)
  const [productImageFile, setProductImageFile] = useState(null)
  const [saving, setSaving] = useState(false)

  async function loadDashboard() {
    setLoading(true)
    setError('')
    try {
      const [productRows, categoryRows] = await Promise.all([getAdminProducts(), getAdminCategories()])
      setProducts(productRows)
      setCategories(categoryRows)
    } catch (requestError) {
      setError(messageFrom(requestError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDashboard() }, [])

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory = !categoryFilter || product.categoryId === categoryFilter
      const matchesSearch = !term || [product.name, product.slug, product.categoryName].some((value) => value?.toLowerCase().includes(term))
      return matchesCategory && matchesSearch
    })
  }, [categoryFilter, products, search])

  function updateDraft(field, value) {
    setProductDraft((current) => ({ ...current, [field]: value }))
  }

  function beginNewProduct() {
    setNotice('')
    setProductImageFile(null)
    setProductDraft({ ...emptyProduct, categoryId: categories[0]?.id || '' })
  }

  async function saveProduct(event) {
    event.preventDefault()
    if (!productDraft) return
    setSaving(true)
    setError('')
    try {
      const uploadedImage = productImageFile ? await uploadAdminProductImage(productImageFile) : null
      const payload = {
        ...productDraft,
        ...(uploadedImage ? { image: uploadedImage.url } : {}),
        tags: Array.isArray(productDraft.tags) ? productDraft.tags : productDraft.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      }
      const savedProduct = productDraft.id
        ? await updateAdminProduct(productDraft.id, payload)
        : await createAdminProduct(payload)
      setProducts((current) => {
        const exists = current.some((product) => product.id === savedProduct.id)
        return exists ? current.map((product) => product.id === savedProduct.id ? savedProduct : product) : [savedProduct, ...current]
      })
      setProductDraft(null)
      setProductImageFile(null)
      invalidateProductCache()
      setNotice(uploadedImage ? 'Product and image saved. Storefront reads will reflect the change immediately.' : 'Product saved. Storefront reads will reflect the change immediately.')
    } catch (requestError) {
      setError(messageFrom(requestError))
    } finally {
      setSaving(false)
    }
  }

  async function archiveProduct(product) {
    if (!window.confirm(`Archive “${product.name}”? It will be removed from the storefront but can be restored by editing it here.`)) return
    setSaving(true)
    setError('')
    try {
      const archived = await archiveAdminProduct(product.id)
      setProducts((current) => current.map((item) => item.id === product.id ? archived.product : item))
      invalidateProductCache()
      setNotice('Product archived safely. It is no longer public.')
    } catch (requestError) {
      setError(messageFrom(requestError))
    } finally {
      setSaving(false)
    }
  }

  async function saveCategory(event) {
    event.preventDefault()
    if (!categoryDraft) return
    setSaving(true)
    setError('')
    try {
      const savedCategory = categoryDraft.id
        ? await updateAdminCategory(categoryDraft.id, categoryDraft)
        : await createAdminCategory(categoryDraft)
      setCategories((current) => {
        const exists = current.some((category) => category.id === savedCategory.id)
        return exists ? current.map((category) => category.id === savedCategory.id ? savedCategory : category) : [...current, savedCategory].sort((a, b) => a.name.localeCompare(b.name))
      })
      setCategoryDraft(null)
      invalidateCategoryCache()
      invalidateProductCache()
      setNotice('Category saved.')
    } catch (requestError) {
      setError(messageFrom(requestError))
    } finally {
      setSaving(false)
    }
  }

  async function removeCategory(category) {
    if (!window.confirm(`Delete “${category.name}”? This only succeeds when no products use it.`)) return
    setSaving(true)
    setError('')
    try {
      await deleteAdminCategory(category.id)
      setCategories((current) => current.filter((item) => item.id !== category.id))
      invalidateCategoryCache()
      setNotice('Category deleted.')
    } catch (requestError) {
      setError(messageFrom(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="min-h-[70vh] bg-cream py-10 md:py-14">
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-[#E8DED2] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs uppercase tracking-[0.2em] text-taupe">BLY / private workspace</p><h1 className="mt-2 font-display text-4xl leading-none text-espresso sm:text-5xl">Admin studio</h1></div>
          <button type="button" className="btn-secondary" onClick={loadDashboard} disabled={loading || saving}>REFRESH DATA</button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-[#E8DED2] pb-3">
          {[['products', 'Products'], ['categories', 'Categories']].map(([id, label]) => <button key={id} type="button" onClick={() => setTab(id)} className={`px-4 py-2.5 text-sm uppercase tracking-[0.14em] ${tab === id ? 'bg-espresso text-paper' : 'text-taupe hover:text-espresso'}`}>{label}</button>)}
        </div>

        {error && <p role="alert" className="mt-6 border border-[#C99B8D] bg-[#FBF2EF] px-4 py-3 text-sm text-brown">{error}</p>}
        {notice && <p role="status" className="mt-6 border border-[#D7C6B3] bg-paper px-4 py-3 text-sm text-brown">{notice}</p>}

        {loading ? <p className="py-14 text-sm text-taupe" aria-busy="true">Loading the admin workspace…</p> : (
          <>
            {tab === 'products' && <ProductsPanel products={visibleProducts} categories={categories} search={search} categoryFilter={categoryFilter} setSearch={setSearch} setCategoryFilter={setCategoryFilter} beginNewProduct={beginNewProduct} editProduct={setProductDraft} archiveProduct={archiveProduct} saving={saving} />}
            {tab === 'categories' && <CategoriesPanel categories={categories} beginNew={() => setCategoryDraft(emptyCategory)} edit={setCategoryDraft} remove={removeCategory} saving={saving} />}
          </>
        )}
      </div>

      {productDraft && <><ProductEditor draft={productDraft} categories={categories} update={updateDraft} close={() => { setProductImageFile(null); setProductDraft(null) }} save={saveProduct} saving={saving} /><ProductImageUpload file={productImageFile} setFile={setProductImageFile} currentImage={productDraft.image} /></>}
      {categoryDraft && <CategoryEditor draft={categoryDraft} update={(field, value) => setCategoryDraft((current) => ({ ...current, [field]: value }))} close={() => setCategoryDraft(null)} save={saveCategory} saving={saving} />}
    </section>
  )
}

function ProductsPanel({ products, categories, search, categoryFilter, setSearch, setCategoryFilter, beginNewProduct, editProduct, archiveProduct, saving }) {
  return <div className="mt-7">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-1 flex-col gap-3 sm:flex-row"><input className={inputClass} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" aria-label="Search products" /><select className={inputClass} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter products by category"><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div><button type="button" className="btn-primary whitespace-nowrap" onClick={beginNewProduct} disabled={!categories.length}>ADD PRODUCT</button></div>
    {!categories.length && <p className="mt-3 text-sm text-brown">Create a category before adding products.</p>}
    <div className="mt-7 overflow-x-auto border border-[#E8DED2] bg-paper"><table className="min-w-full text-left text-sm"><thead className="border-b border-[#E8DED2] text-[10px] uppercase tracking-[0.13em] text-taupe"><tr><th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Price</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Actions</th></tr></thead><tbody>{products.map((product) => <tr key={product.id} className="border-b border-[#E8DED2] last:border-0"><td className="px-4 py-4"><div className="flex min-w-[15rem] items-center gap-3">{product.image && <img className="h-11 w-9 border border-[#E8DED2] object-cover" src={product.image} alt="" />}<div><p className="font-medium text-espresso">{product.name}</p><p className="text-xs text-taupe">/{product.slug}</p></div></div></td><td className="px-4 py-4 text-brown">{product.categoryName || 'Unassigned'}</td><td className="px-4 py-4 text-espresso">₹{product.price}</td><td className="px-4 py-4"><span className={product.isActive ? 'text-brown' : 'text-taupe'}>{product.isActive ? 'Active' : 'Archived'}</span></td><td className="px-4 py-4"><div className="flex gap-3 text-xs uppercase tracking-[0.11em]"><button type="button" className="text-espresso underline" onClick={() => editProduct({ ...product, productType: product.type })}>Edit</button>{product.isActive && <button type="button" className="text-brown underline disabled:opacity-50" disabled={saving} onClick={() => archiveProduct(product)}>Archive</button>}</div></td></tr>)}</tbody></table>{products.length === 0 && <p className="px-4 py-10 text-center text-sm text-taupe">No products match this view.</p>}</div>
  </div>
}

function CategoriesPanel({ categories, beginNew, edit, remove, saving }) {
  return <div className="mt-7"><div className="flex justify-end"><button type="button" className="btn-primary" onClick={beginNew}>ADD CATEGORY</button></div><div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <article key={category.id} className="border border-[#E8DED2] bg-paper p-5"><p className="text-xs uppercase tracking-[0.15em] text-taupe">/{category.slug}</p><h2 className="mt-2 font-display text-2xl text-espresso">{category.name}</h2><p className="mt-3 min-h-10 text-sm text-brown">{category.description || 'No description added.'}</p><div className="mt-5 flex gap-4 text-xs uppercase tracking-[0.11em]"><button type="button" className="underline" onClick={() => edit({ ...category })}>Edit</button><button type="button" className="text-brown underline disabled:opacity-50" disabled={saving} onClick={() => remove(category)}>Delete</button></div></article>)}</div>{categories.length === 0 && <p className="py-10 text-center text-sm text-taupe">No categories exist yet.</p>}</div>
}

function ProductEditor({ draft, categories, update, close, save, saving }) {
  const checkbox = (label, field) => <label className="flex items-center gap-2 text-sm text-brown"><input type="checkbox" checked={Boolean(draft[field])} onChange={(event) => update(field, event.target.checked)} />{label}</label>
  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-espresso/35 p-4 md:p-8"><form onSubmit={save} className="mx-auto max-w-4xl bg-cream p-5 shadow-2xl md:p-8"><div className="flex items-start justify-between gap-4 border-b border-[#E8DED2] pb-5"><div><p className="text-xs uppercase tracking-[0.16em] text-taupe">Product management</p><h2 className="mt-1 font-display text-3xl text-espresso">{draft.id ? 'Edit product' : 'Add product'}</h2></div><button type="button" className="text-xs uppercase tracking-[0.13em] text-taupe underline" onClick={close}>Close</button></div><div className="mt-6 grid gap-5 md:grid-cols-2"><Field label="Name"><input className={inputClass} required maxLength="160" value={draft.name || ''} onChange={(event) => update('name', event.target.value)} /></Field><Field label="Slug"><input className={inputClass} required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={draft.slug || ''} onChange={(event) => update('slug', event.target.value)} /></Field><Field label="Category"><select className={inputClass} required value={draft.categoryId || ''} onChange={(event) => update('categoryId', event.target.value)}><option value="" disabled>Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field><Field label="Product type"><input className={inputClass} value={draft.productType || draft.type || ''} onChange={(event) => update('productType', event.target.value)} /></Field><Field label="Price (₹)"><input className={inputClass} required min="0" step="0.01" type="number" value={draft.price ?? ''} onChange={(event) => update('price', event.target.value)} /></Field><Field label="Concern"><input className={inputClass} value={draft.concern || ''} onChange={(event) => update('concern', event.target.value)} /></Field><Field label="Short description"><textarea className={inputClass} rows="3" value={draft.shortDescription || ''} onChange={(event) => update('shortDescription', event.target.value)} /></Field><Field label="Tags (comma separated)"><input className={inputClass} value={Array.isArray(draft.tags) ? draft.tags.join(', ') : draft.tags || ''} onChange={(event) => update('tags', event.target.value)} /></Field><Field label="Description"><textarea className={inputClass} rows="6" value={draft.description || ''} onChange={(event) => update('description', event.target.value)} /></Field><Field label="Ingredients / ritual details"><textarea className={inputClass} rows="6" value={draft.howToUse || ''} onChange={(event) => update('howToUse', event.target.value)} /></Field><Field label="Product image URL"><input className={inputClass} type="url" value={draft.image || ''} onChange={(event) => update('image', event.target.value)} /></Field>{draft.image && <div className="border border-[#E8DED2] bg-paper p-3"><p className="mb-2 text-xs uppercase tracking-[0.13em] text-taupe">Image preview</p><img className="h-36 w-full object-contain" src={draft.image} alt="Product preview" /></div>}<Field label="Rating"><input className={inputClass} min="0" step="0.1" type="number" value={draft.rating ?? 0} onChange={(event) => update('rating', event.target.value)} /></Field><Field label="Review count"><input className={inputClass} min="0" step="1" type="number" value={draft.reviewCount ?? 0} onChange={(event) => update('reviewCount', event.target.value)} /></Field></div><div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#E8DED2] pt-5">{checkbox('Featured', 'featured')}{checkbox('Bestseller', 'bestseller')}{checkbox('New arrival', 'newArrival')}{checkbox('Active on storefront', 'isActive')}</div><div className="mt-7 flex justify-end gap-3"><button type="button" className="btn-secondary" onClick={close}>CANCEL</button><button className="btn-primary" disabled={saving}>{saving ? 'SAVING…' : 'SAVE PRODUCT'}</button></div></form></div>
}

function CategoryEditor({ draft, update, close, save, saving }) {
  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-espresso/35 p-4 md:p-8"><form className="mx-auto max-w-xl bg-cream p-5 shadow-2xl md:p-8" onSubmit={save}><div className="flex items-start justify-between gap-4 border-b border-[#E8DED2] pb-5"><h2 className="font-display text-3xl text-espresso">{draft.id ? 'Edit category' : 'Add category'}</h2><button type="button" className="text-xs uppercase tracking-[0.13em] text-taupe underline" onClick={close}>Close</button></div><div className="mt-6 space-y-5"><Field label="Name"><input className={inputClass} required value={draft.name || ''} onChange={(event) => update('name', event.target.value)} /></Field><Field label="Slug"><input className={inputClass} required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={draft.slug || ''} onChange={(event) => update('slug', event.target.value)} /></Field><Field label="Description"><textarea className={inputClass} rows="4" value={draft.description || ''} onChange={(event) => update('description', event.target.value)} /></Field><Field label="Image URL"><input className={inputClass} type="url" value={draft.image || ''} onChange={(event) => update('image', event.target.value)} /></Field></div><div className="mt-7 flex justify-end gap-3"><button type="button" className="btn-secondary" onClick={close}>CANCEL</button><button className="btn-primary" disabled={saving}>{saving ? 'SAVING…' : 'SAVE CATEGORY'}</button></div></form></div>
}
