import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { KeyRound, LogIn, UserRoundPlus } from "lucide-react";
import { authClient } from "~/auth-client";
import { auth } from "server/lib/auth";
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

const authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({
    headers,
  });

  return next({
    context: {
      user: session?.user ?? null,
      session: session?.session ?? null,
    },
  });
});

const getSession = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return {
      user: context.user,
      session: context.session,
    };
  });

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  loader: async () => {
    const session = await getSession();

    return { session };
  },
});

function AuthPage() {
  const { session } = Route.useLoaderData();
  const router = useRouter();

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [activeAction, setActiveAction] = useState<"register" | "login" | "logout" | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const isPending = activeAction !== null;
  const user = session?.user ?? null;

  const registerDisabled =
    activeAction !== null ||
    registerForm.name.trim().length === 0 ||
    registerForm.email.trim().length === 0 ||
    registerForm.password.length < 8;

  const loginDisabled =
    activeAction !== null || loginForm.email.trim().length === 0 || loginForm.password.length === 0;

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (registerDisabled) {
      return;
    }

    setActiveAction("register");
    setFeedback(null);

    try {
      await authClient.signUp.email({
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
      });

      await router.invalidate();
      setRegisterForm({
        name: "",
        email: "",
        password: "",
      });
      setLoginForm({
        email: "",
        password: "",
      });
      setFeedback({
        type: "success",
        message: "Account created and session started.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setActiveAction(null);
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loginDisabled) {
      return;
    }

    setActiveAction("login");
    setFeedback(null);

    try {
      await authClient.signIn.email({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      await router.invalidate();
      setLoginForm({
        email: "",
        password: "",
      });
      setFeedback({
        type: "success",
        message: "Signed in successfully.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setActiveAction(null);
    }
  };

  const handleLogout = async () => {
    if (activeAction !== null) {
      return;
    }

    setActiveAction("logout");
    setFeedback(null);

    try {
      await authClient.signOut();
      await router.invalidate();
      setFeedback({
        type: "success",
        message: "Signed out.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(251,146,60,0.14),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] px-6 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-slate-950/70 shadow-[0_30px_120px_-60px_rgba(14,165,233,0.4)] backdrop-blur">
          <div className="grid gap-8 px-8 py-10 md:grid-cols-[1.25fr_0.9fr] md:px-12">
            <div className="space-y-4">
              <p className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                Better Auth
              </p>
              <h1 className="max-w-3xl font-['Georgia','Times_New_Roman',serif] text-5xl leading-none tracking-[-0.04em] text-white md:text-6xl">
                {user
                  ? "Your account is active in this browser."
                  : "Register or sign in from the UI."}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                {user ? (
                  <>
                    This page confirms the current Better Auth session and shows the active account
                    details for this browser.
                  </>
                ) : (
                  <>
                    This page uses <code>authClient</code> for session lookup, email/password
                    registration, login, and logout.
                  </>
                )}
              </p>
            </div>

            <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">Session</p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {isPending ? "Checking..." : session ? "Authorized" : "Guest"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 font-mono text-sm text-slate-300">
                <p>email: {user?.email ?? "not signed in"}</p>
                <p className="mt-2">user id: {user?.id ?? "n/a"}</p>
              </div>
              <p className="text-sm leading-6 text-slate-400">
                {user
                  ? "A valid Better Auth session cookie is active for this browser."
                  : "Register or log in below to start a Better Auth session in this browser."}
              </p>
            </div>
          </div>
        </section>

        {feedback ? (
          <section
            className={`rounded-[1.5rem] border px-5 py-4 text-sm shadow-[0_20px_60px_-40px_rgba(15,23,42,0.6)] ${
              feedback.type === "success"
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                : "border-rose-400/30 bg-rose-400/10 text-rose-100"
            }`}
          >
            {feedback.message}
          </section>
        ) : null}

        {user ? (
          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.92)_0%,_rgba(17,24,39,0.98)_100%)] px-8 py-8 shadow-[0_24px_70px_-55px_rgba(15,23,42,0.8)]">
            <div className="flex items-center gap-3 text-emerald-200">
              <KeyRound className="size-5" />
              <p className="text-sm font-semibold uppercase tracking-[0.3em]">Account</p>
            </div>
            <h2 className="mt-4 font-['Georgia','Times_New_Roman',serif] text-4xl leading-tight text-white">
              Signed in as {user.name || user.email}.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              The account is already authenticated, so the register and login forms are hidden until
              you sign out.
            </p>

            <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-sm text-slate-200 md:grid-cols-2">
              <AccountDetail label="Name" value={user.name || "n/a"} />
              <AccountDetail label="Email" value={user.email} />
              <AccountDetail label="User ID" value={user.id} />
              <AccountDetail label="Avatar" value={user.image || "not set"} />
            </div>

            <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <button
                type="button"
                onClick={handleLogout}
                disabled={activeAction !== null}
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
              >
                {activeAction === "logout" ? "Signing Out..." : "Logout"}
              </button>

              <div className="w-full max-w-xl rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Current user payload
                </p>
                <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/30 p-4 text-xs leading-6 text-slate-300">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          </section>
        ) : (
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-6">
              <form
                className="rounded-[2rem] border border-white/10 bg-white/5 px-8 py-8 shadow-[0_24px_70px_-55px_rgba(15,23,42,0.75)]"
                onSubmit={handleRegister}
              >
                <div className="flex items-center gap-3 text-cyan-200">
                  <UserRoundPlus className="size-5" />
                  <p className="text-sm font-semibold uppercase tracking-[0.3em]">Register</p>
                </div>
                <h2 className="mt-4 font-['Georgia','Times_New_Roman',serif] text-4xl leading-tight text-white">
                  Create an account in the auth tables.
                </h2>
                <p className="mt-3 max-w-xl text-base leading-7 text-slate-300">
                  Use email/password sign-up, then Better Auth should create the user and start a
                  session immediately.
                </p>

                <div className="mt-8 grid gap-5">
                  <Field
                    label="Name"
                    value={registerForm.name}
                    placeholder="Ada Lovelace"
                    onChange={(value) =>
                      setRegisterForm((current) => ({
                        ...current,
                        name: value,
                      }))
                    }
                  />
                  <Field
                    label="Email"
                    type="email"
                    value={registerForm.email}
                    placeholder="ada@example.com"
                    onChange={(value) =>
                      setRegisterForm((current) => ({
                        ...current,
                        email: value,
                      }))
                    }
                  />
                  <Field
                    label="Password"
                    type="password"
                    value={registerForm.password}
                    placeholder="Minimum 8 characters"
                    onChange={(value) =>
                      setRegisterForm((current) => ({
                        ...current,
                        password: value,
                      }))
                    }
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <button
                    type="submit"
                    disabled={registerDisabled}
                    className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-200"
                  >
                    {activeAction === "register" ? "Creating..." : "Register"}
                  </button>
                  <p className="text-sm text-slate-400">Password must be at least 8 characters.</p>
                </div>
              </form>

              <form
                className="rounded-[2rem] border border-white/10 bg-white/5 px-8 py-8 shadow-[0_24px_70px_-55px_rgba(15,23,42,0.75)]"
                onSubmit={handleLogin}
              >
                <div className="flex items-center gap-3 text-amber-200">
                  <LogIn className="size-5" />
                  <p className="text-sm font-semibold uppercase tracking-[0.3em]">Login</p>
                </div>
                <h2 className="mt-4 font-['Georgia','Times_New_Roman',serif] text-4xl leading-tight text-white">
                  Reuse an existing Better Auth account.
                </h2>
                <p className="mt-3 max-w-xl text-base leading-7 text-slate-300">
                  Sign in from this browser to receive the session cookie.
                </p>

                <div className="mt-8 grid gap-5">
                  <Field
                    label="Email"
                    type="email"
                    value={loginForm.email}
                    placeholder="ada@example.com"
                    onChange={(value) => setLoginForm((current) => ({ ...current, email: value }))}
                  />
                  <Field
                    label="Password"
                    type="password"
                    value={loginForm.password}
                    placeholder="Your password"
                    onChange={(value) =>
                      setLoginForm((current) => ({
                        ...current,
                        password: value,
                      }))
                    }
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <button
                    type="submit"
                    disabled={loginDisabled}
                    className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-200"
                  >
                    {activeAction === "login" ? "Signing In..." : "Login"}
                  </button>
                  <p className="text-sm text-slate-400">
                    Session status updates in the panel above.
                  </p>
                </div>
              </form>
            </div>

            <aside className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.92)_0%,_rgba(17,24,39,0.98)_100%)] px-8 py-8 shadow-[0_24px_70px_-55px_rgba(15,23,42,0.8)]">
              <div className="flex items-center gap-3 text-emerald-200">
                <KeyRound className="size-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.3em]">Session Preview</p>
              </div>
              <h2 className="mt-4 font-['Georgia','Times_New_Roman',serif] text-4xl leading-tight text-white">
                No account is active yet.
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-300">
                Once you register or log in, this page will swap to account details and a logout
                action only.
              </p>

              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Current user payload
                </p>
                <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950/80 p-4 text-xs leading-6 text-slate-300">
                  {JSON.stringify(null, null, 2)}
                </pre>
              </div>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}

function AccountDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-3 break-all font-mono text-sm text-slate-100">{value}</p>
    </div>
  );
}

function Field({
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:bg-slate-950"
      />
    </label>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Request failed.";
}
