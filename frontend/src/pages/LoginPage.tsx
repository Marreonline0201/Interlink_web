import { useState } from "react";
import type { FormEvent } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      alert("Please fill in both email and password.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      alert(
        `Simulated login:\n• Email: ${email}\n• Password: ${"*".repeat(
          password.length
        )}`
      );
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-200 via-sky-300/90 to-sky-500 px-4 py-24 text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-15%] top-[-15%] h-80 w-80 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
      </div>
      <div className="relative w-full max-w-xl">
        <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/90 px-10 py-12 text-center shadow-[0_30px_90px_-50px_rgba(15,118,110,0.45)]">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/90 via-white/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white/80 to-sky-100/40" />
          <form
            className="relative z-10 flex w-full flex-col items-center gap-6"
            onSubmit={handleSubmit}
          >
            <div className="inline-flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.5em] text-sky-400">
                Interlink
              </span>
              <span className="h-[1px] w-12 bg-sky-200" />
              <span className="text-xs font-semibold uppercase tracking-[0.4em] text-sky-300">
                Notebook
              </span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-800">
              Sign-in Sheet
            </h1>
            <p className="max-w-lg text-sm text-slate-500">
              This notebook-themed page is a placeholder for your login form.
              Drop in the real fields and logic when you are ready.
            </p>
            <div className="mt-4 grid w-full gap-6 text-left text-sm font-medium text-slate-600">
              <label className="flex items-center gap-6" htmlFor="email">
                <span className="w-28 shrink-0 text-xs uppercase tracking-wide text-slate-400">
                  Email
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="flex-1 rounded-full border border-dashed border-slate-300 bg-white/90 px-6 py-3 text-slate-700 shadow-inner shadow-white/40 outline-none transition hover:border-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-300/60"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="flex items-center gap-6" htmlFor="password">
                <span className="w-28 shrink-0 text-xs uppercase tracking-wide text-slate-400">
                  Password
                </span>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="flex-1 rounded-full border border-dashed border-slate-300 bg-white/90 px-6 py-3 text-slate-700 shadow-inner shadow-white/40 outline-none transition hover:border-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-300/60"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
            </div>
            <button
              type="submit"
              className="mt-6 inline-flex items-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:bg-sky-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting…" : "Log In"}
            </button>
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-sky-200/80">
              Page 01
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
