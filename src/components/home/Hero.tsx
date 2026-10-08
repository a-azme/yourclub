import SearchBar from './SearchBar';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-blue-50">
      <div aria-hidden className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-emerald-800/30 via-sky-200/40 to-transparent lg:block" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand/80">Welcome to YourClub</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">Events. Fests. Community.</h1>
        <p className="mt-4 max-w-xl text-slate-600">
          Discover exciting fests, explore events, and be a part of something bigger. Register, participate and make the most of your club experience.
        </p>
        <div className="mt-8 max-w-4xl"><SearchBar /></div>
      </div>
    </section>
  );
}