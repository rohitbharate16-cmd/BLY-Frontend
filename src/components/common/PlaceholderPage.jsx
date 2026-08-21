export default function PlaceholderPage({ title = 'Coming Soon', subtitle = 'This page is coming in the next phase.' }) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-4xl font-medium tracking-tight text-espresso sm:text-5xl">
        {title}
      </h1>
      <p className="mt-6 max-w-md text-brown">{subtitle}</p>
    </section>
  )
}
