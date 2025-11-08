import { Navigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import AuthHeading from "../components/AuthHeading";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AuthLayout>
      <div className="flex w-full flex-col items-center gap-10 px-2 text-center">
        <div className="relative flex w-full flex-col items-center gap-6 rounded-[32px] border border-white/60 bg-white/95 px-10 py-16 text-center shadow-[0_30px_90px_-40px_rgba(15,118,110,0.45)]">
          <AuthHeading
            title="Your Profile"
            eyebrow="Interlink Notebook"
            description="You are logged in. Review your details or sign out anytime."
          />

          <div className="mt-4 w-full space-y-4 rounded-3xl border border-sky-100 bg-slate-50 px-6 py-8 text-left text-sm text-slate-600">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">
                Email
              </span>
              <span className="text-base font-medium text-slate-900">
                {user.email ?? "Unknown"}
              </span>
            </div>
            {user.id && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">
                  User ID
                </span>
                <span className="font-mono text-sm text-slate-500">
                  {user.id}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            Logout
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ProfilePage;
