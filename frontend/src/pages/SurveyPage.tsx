import { FormEvent, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import AuthHeading from "../components/AuthHeading";
import AuthInput from "../components/AuthInput";

type SurveyLocationState = {
  name?: string;
  email?: string;
} | null;

const SurveyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? null) as SurveyLocationState;

  const initialName = useMemo(() => locationState?.name ?? "", [locationState]);
  const initialEmail = useMemo(
    () => locationState?.email ?? "",
    [locationState]
  );

  const [displayName, setDisplayName] = useState(initialName);
  const [headline, setHeadline] = useState("");
  const [company, setCompany] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [bio, setBio] = useState("");
  const [preferredEmail, setPreferredEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!displayName || !preferredEmail || !focusArea) {
      setErrorMessage(
        "Please share at least your name, contact email, and focus area."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    setTimeout(() => {
      setSuccessMessage(
        "Thanks! Your profile survey is saved. We’ll take you to your profile."
      );
      setIsSubmitting(false);
      setTimeout(() => navigate("/profile"), 1200);
    }, 600);
  };

  return (
    <AuthLayout>
      <div className="flex w-full flex-col items-center gap-10 px-2">
        <form
          className="relative flex w-full flex-col gap-8 rounded-[32px] border border-white/60 bg-white/95 px-10 py-16 shadow-[0_30px_90px_-40px_rgba(15,118,110,0.45)]"
          onSubmit={handleSubmit}
        >
          <AuthHeading
            title="Tell Us About You"
            eyebrow="Profile Survey"
            description="You’re almost done! Share a few details so we can personalize your workspace."
          />

          <div className="grid w-full gap-6 text-left text-sm font-medium text-slate-600">
            <AuthInput
              id="displayName"
              label="Full Name"
              placeholder="Avery Interlink"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="name"
              required
            />

            <AuthInput
              id="preferredEmail"
              label="Contact Email"
              type="email"
              placeholder="you@example.com"
              value={preferredEmail}
              onChange={(event) => setPreferredEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <AuthInput
              id="headline"
              label="Headline"
              placeholder="Product Manager at Interlink"
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
            />

            <AuthInput
              id="company"
              label="Company"
              placeholder="Interlink Labs"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
            />

            <label
              className="flex items-center gap-6"
              htmlFor="experienceLevel"
            >
              <span className="w-32 shrink-0 text-xs uppercase tracking-wide text-slate-400">
                Experience
              </span>
              <select
                id="experienceLevel"
                className="flex-1 rounded-full border border-dashed border-slate-300 bg-white/90 px-6 py-3 text-slate-700 shadow-inner shadow-white/40 outline-none transition hover:border-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-300/60"
                value={experienceLevel}
                onChange={(event) => setExperienceLevel(event.target.value)}
              >
                <option value="">Select your experience level</option>
                <option value="student">Student / Learner</option>
                <option value="entry">0-2 years</option>
                <option value="mid">3-6 years</option>
                <option value="senior">7-12 years</option>
                <option value="lead">13+ years</option>
              </select>
            </label>

            <AuthInput
              id="focusArea"
              label="Focus Area"
              placeholder="Product strategy, automation, integrations…"
              value={focusArea}
              onChange={(event) => setFocusArea(event.target.value)}
              required
            />

            <label className="flex items-start gap-6" htmlFor="bio">
              <span className="w-32 shrink-0 pt-3 text-xs uppercase tracking-wide text-slate-400">
                Bio
              </span>
              <textarea
                id="bio"
                placeholder="Share a quick snapshot of what you’re working on."
                className="h-32 flex-1 rounded-3xl border border-dashed border-slate-300 bg-white/90 px-6 py-4 text-sm text-slate-700 shadow-inner shadow-white/40 outline-none transition hover:border-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-300/60"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 text-center">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:bg-sky-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save and Continue"}
            </button>

            {errorMessage && (
              <p className="text-sm font-medium text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <p className="text-sm font-medium text-emerald-600" role="status">
                {successMessage}
              </p>
            )}
            {!successMessage && (
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-sky-200/80">
                Page 03
              </p>
            )}
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SurveyPage;
