type AuthHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

const AuthHeading = ({ eyebrow, title, description }: AuthHeadingProps) => (
  <header className="flex flex-col items-center gap-3 text-center">
    {eyebrow ? (
      <span className="text-xs font-semibold uppercase tracking-[0.5em] text-sky-400">
        {eyebrow}
      </span>
    ) : null}
    <h1 className="text-4xl font-semibold tracking-tight text-slate-800">
      {title}
    </h1>
    {description ? (
      <p className="max-w-lg text-sm text-slate-500">{description}</p>
    ) : null}
  </header>
);

export default AuthHeading;

