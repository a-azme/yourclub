export const metadata = {
  title: "Privacy Policy | YourClub",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-8 text-sm text-gray-500">Last updated: October 2026</p>

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">What we collect</h2>
        <p>
          YourClub collects your name, email address, student ID, mobile number
          and department when you create an account or register for an event.
          If you sign in with Google, we receive only your name and email
          address from your Google account.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">How we use it</h2>
        <p>
          Your information is used only to manage your account, process event
          registrations, show your digital ticket, and let club organizers
          manage participants and attendance.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Storage and sharing</h2>
        <p>
          Data is stored securely in Supabase. We do not sell or share your
          information with third parties. Event organizers can see the details
          of students registered for their events.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Deleting your data</h2>
        <p>
          You can ask for your account and data to be deleted at any time by
          contacting us at azme3448@gmail.com.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Contact</h2>
        <p>For any privacy question, email azme3448@gmail.com.</p>
      </section>
    </main>
  );
}