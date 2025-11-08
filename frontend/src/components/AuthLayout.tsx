import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-200 via-sky-300/90 to-sky-500 px-4 py-24 text-slate-900">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute right-[-12%] top-[-18%] h-72 w-72 rounded-full bg-white/30 blur-3xl" />
      <div className="absolute bottom-[-18%] left-[-12%] h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
    </div>
    <div className="relative z-10 flex w-full max-w-xl flex-col gap-8">{children}</div>
  </div>
);

export default AuthLayout;

