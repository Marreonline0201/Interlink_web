import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import ringsArt from "../assets/rings.png";
import AuthHeading from "../components/AuthHeading";
import AuthInput from "../components/AuthInput";
import AuthLayout from "../components/AuthLayout";

const SignupPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) {
      alert("Please complete all fields before signing up.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords must match.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      alert(
        `Simulated signup:\n• Name: ${fullName}\n• Email: ${email}\n• Password: ${"*".repeat(
          password.length
        )}`
      );
      setIsSubmitting(false);
      navigate("/login");
    }, 750);
  };

  return (
    <AuthLayout>
      <div className="flex w-full flex-col items-center gap-10 px-2 text-center">
        <form
          className="relative flex w-full flex-col items-center gap-6 rounded-[32px] border border-white/60 bg-white/95 px-10 py-16 text-center shadow-[0_30px_90px_-40px_rgba(15,118,110,0.45)]"
          onSubmit={handleSubmit}
        >
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[45%] select-none">
            <img
              src={ringsArt}
              alt="Notebook binding rings"
              className="scale-200"
              draggable={false}
            />
          </div>

          <AuthHeading
            title="Signup"
            eyebrow="Interlink Notebook"
            description="Join us by filling out the fields below. We’ll take it from here."
          />

          <div className="mt-4 grid w-full gap-6 text-left text-sm font-medium text-slate-600">
            <AuthInput
              id="fullName"
              label="Full Name"
              autoComplete="name"
              placeholder="Avery Interlink"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
            <AuthInput
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <AuthInput
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <AuthInput
              id="confirmPassword"
              label="Confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex items-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:bg-sky-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account…" : "Create Account"}
          </button>

          <p className="text-xs font-medium uppercase tracking-[0.4em] text-sky-200/80">
            Page 02
          </p>
          <p className="text-xs text-slate-500">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-semibold text-sky-500 underline decoration-dotted underline-offset-4 hover:text-sky-400"
            >
              Return to login
            </Link>
            .
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
