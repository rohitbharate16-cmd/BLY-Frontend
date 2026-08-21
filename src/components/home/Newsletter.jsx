import Reveal from '../common/Reveal'

export default function Newsletter() {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-6 lg:px-8">
        <Reveal className="border-t border-[#E8DED2] pt-14 text-center">
          <h2 className="font-display text-3xl text-espresso sm:text-4xl">
            STAY IN THE KNOW
          </h2>
          <p className="mt-2 text-base text-taupe">
            New collections, beauty notes and more.
          </p>
          <form
            className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 border border-[#E8DED2] bg-paper px-4 py-2.5 text-sm text-espresso transition-colors placeholder:text-taupe/50 focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne"
              aria-label="Email address"
            />
            <button type="submit" className="btn-primary shrink-0 text-xs">
              SUBSCRIBE
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
