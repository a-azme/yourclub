export const metadata = {
  title: "Terms of Service | YourClub",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">Terms of Service</h1>
      <p className="mb-8 text-sm text-gray-500">Last updated: October 2026</p>

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Using YourClub</h2>
        <p>
          YourClub is a platform for DRMC clubs to publish fests and events and
          for students to register for them. By creating an account you agree
          to use the platform honestly and to provide correct information.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Registrations</h2>
        <p>
          Seats are limited. If an event is full you may be placed on a
          waitlist. Organizers may change or cancel a registration, and you
          will be notified in the app.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Your account</h2>
        <p>
          You are responsible for keeping your login details safe. Misuse of
          the platform may lead to your account being removed.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Fees</h2>
        <p>
          Event fees, if any, are shown for information only. YourClub does not
          process online payments.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Contact</h2>
        <p>Questions about these terms: azme3448@gmail.com.</p>
      </section>
    </main>
  );
}