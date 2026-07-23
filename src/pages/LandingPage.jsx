import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-sm font-semibold uppercase tracking-[0.18em] text-white">
              KK
            </div>
            <span className="text-base font-semibold tracking-tight">KodiKazi</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#product" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              Product
            </a>
            <a href="#roles" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              Roles
            </a>
            <a href="#automation" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              Automation
            </a>
            <Link to="/login" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
              Log in
            </Link>
          </div>
          <div className="md:hidden">
            <Link to="/login" className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-700">
              Log in
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 lg:px-8">
        <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16 pt-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              KodiKazi — the rental hustle
            </div>
            <h1 className="mt-8 text-5xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-6xl">
              Rent is a hustle.
              <span className="block text-brand-600">Tracking it shouldn&apos;t be.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              KodiKazi keeps landlords, managers, tenants, and homeowners on the same page — who owes what, who&apos;s paid, and who needs a nudge, updated automatically.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-700">
                Get started
              </Link>
              <a href="#automation" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                See how it works
              </a>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Roles supported</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">4</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Overdue detection</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Daily, automatic</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Reminders</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Sent by SMS</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Receipts</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Stamped on payment</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-100 p-8 shadow-2xl shadow-slate-300/20 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-black/20">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
              <span>Kiwatule Court</span>
              <span>July 2026</span>
            </div>
            <div className="mt-7 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">A. Namutebi</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Unit 3B</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-950 dark:text-white">750,000</p>
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-300">Paid</span>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">D. Okello</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Unit 1A</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-950 dark:text-white">620,000</p>
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-300">Paid</span>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">S. Nakato</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Unit 4C</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-950 dark:text-white">680,000</p>
                    <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-[11px] font-semibold uppercase text-rose-700 dark:bg-rose-900/80 dark:text-rose-300">3 days due</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24 rounded-[2rem] bg-slate-950 px-8 py-16 text-slate-100 shadow-2xl shadow-slate-950/40 md:px-12" id="product">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">The old hustle</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">A notebook only tells you what already happened.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              By the time a missed payment is noticed the old way, it&apos;s a phone call, a visit, and a favor. KodiKazi keeps the record moving in real time — one line per tenant, one glance to know where you stand.
            </p>
            <div className="mt-12 grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Working off memory</p>
                <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-300">
                  <li>Balances live in one physical notebook</li>
                  <li>Overdue rent found by memory, not by system</li>
                  <li>Reminders mean a call or a visit</li>
                  <li>One owner sees one property at a time</li>
                </ul>
              </div>
              <div className="rounded-3xl border border-amber-300/20 bg-amber-100/10 p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">Working with KodiKazi</p>
                <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-100">
                  <li>Every unit, lease, and balance in one dashboard</li>
                  <li>Overdue balances flagged automatically, daily</li>
                  <li>Reminders sent by SMS the moment rent is late</li>
                  <li>Managers see every property they run, at once</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24" id="roles">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Built for four roles</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Everyone gets their own corner of the hustle.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-300">
                One account, one set of data, four different jobs to do. KodiKazi shows each person only what&apos;s theirs to manage.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: 'Landlord', desc: 'Full visibility into every property, lease, and payment across a personal portfolio.' },
                { title: 'Property manager', desc: 'Runs a multi-owner portfolio on behalf of landlords and homeowners from one login.' },
                { title: 'Tenant', desc: 'Checks lease terms, sees payment history, and pays rent through a simple pay-now flow.' },
                { title: 'Homeowner', desc: 'Tracks rental income and unit status for the properties they own, without managing them day to day.' },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">{item.title}</p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-24 rounded-[2rem] bg-slate-950 px-8 py-16 text-slate-100 shadow-2xl shadow-slate-950/40 md:px-12" id="automation">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">How a late payment gets handled</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Three steps, no phone calls.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              The parts of rent collection that used to depend on someone remembering now run on their own, every day, for every unit.
            </p>
            <div className="mt-12 grid gap-8 lg:grid-cols-3">
              {[
                { step: '01', title: 'Overdue, detected', desc: 'A daily job checks every lease against its due date and flags late balances the same day they go overdue.' },
                { step: '02', title: 'Reminder, sent', desc: 'The tenant gets an SMS with no app or login required to receive it.' },
                { step: '03', title: 'Payment, stamped', desc: 'Once rent is paid, a receipt generates instantly and opens ready to print.' },
              ].map(item => (
                <div key={item.step} className="rounded-3xl border border-white/10 bg-white/5 p-8">
                  <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
                    <span>{item.step}</span>
                    <span className="flex-1 h-px bg-amber-300/30" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-24 rounded-[2rem] border border-slate-200 bg-slate-50 px-8 py-16 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Everything on the ledger</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Ten pages. One account.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-700 dark:text-slate-300">
              Every part of running a rental property, already built and live.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {['Dashboard', 'Payments', 'Tenants', 'Leases', 'Utilities', 'Properties', 'Maintenance', 'Reports', 'Settings'].map(feature => (
              <div key={feature} className="rounded-3xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                {feature}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 rounded-[2rem] bg-brand-600 px-8 py-20 text-white shadow-2xl shadow-brand-700/30 sm:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">Get started</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Get in on the hustle.</h2>
            <p className="mt-5 text-lg leading-8 text-brand-100/90">
              Set up your first property in minutes — landlords, managers, tenants, and homeowners can all be added from day one.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/signup" className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-700 transition hover:bg-slate-100">
                Create account
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
