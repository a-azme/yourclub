import { Logo } from "@/components/layout/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-light to-white px-4 py-10">
      <Logo className="mb-6" />
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </main>
  );
}