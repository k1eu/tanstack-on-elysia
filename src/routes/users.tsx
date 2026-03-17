import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { getApiClient } from "~/api-client";

export const Route = createFileRoute("/users")({
  component: UsersPage,
  loader: async () => {
    const response = await getApiClient().users.get();

    return {
      users: response.data ?? [],
    };
  },
});

function UsersPage() {
  const router = useRouter();
  const { users } = Route.useLoaderData();
  const [form, setForm] = useState({
    name: "",
    age: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isValid =
    form.name.trim().length > 0 &&
    form.email.trim().length > 0 &&
    Number(form.age) > 0;

  const submitUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await getApiClient().users.post({
        data: {
          name: form.name.trim(),
          age: Number(form.age),
          email: form.email.trim(),
        },
      });

      setForm({
        name: "",
        age: "",
        email: "",
      });
      setFeedback({
        type: "success",
        message: "User created.",
      });
      await router.invalidate();
    } catch {
      setFeedback({
        type: "error",
        message: "Could not create the user. Check the values and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_42%,_#e2e8f0_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-amber-200/70 bg-white/80 shadow-[0_30px_120px_-60px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="grid gap-8 px-8 py-10 md:grid-cols-[1.5fr_0.9fr] md:px-12">
            <div className="space-y-5">
              <p className="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-900">
                Directory
              </p>
              <div className="space-y-3">
                <h1 className="max-w-2xl font-['Georgia','Times_New_Roman',serif] text-5xl leading-none tracking-[-0.04em] text-slate-950 md:text-6xl">
                  Users from the API, rendered into the app.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                  This page loads through <code>getApiClient()</code> and renders the
                  current contents of the backend <code>/api/users</code> endpoint.
                </p>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-950 p-6 text-slate-100 shadow-inner">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-amber-300">
                  Snapshot
                </p>
                <p className="mt-3 text-5xl font-semibold">{users.length}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {users.length === 1 ? "registered user" : "registered users"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Data source
                </p>
                <p className="mt-2 font-mono text-sm text-amber-200">GET /api/users</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white px-8 py-8 shadow-[0_24px_70px_-55px_rgba(15,23,42,0.5)]">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Quick Add
            </p>
            <h2 className="mt-4 font-['Georgia','Times_New_Roman',serif] text-4xl leading-tight text-slate-950">
              Create a user without leaving the page.
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
              The form posts to <code>/api/users</code> through the shared API client and
              then refreshes the list.
            </p>

            <form className="mt-8 grid gap-5" onSubmit={submitUser}>
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Name
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Ada Lovelace"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Age
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={form.age}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        age: event.target.value,
                      }))
                    }
                    placeholder="36"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Email
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="ada@example.com"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmitting ? "Saving..." : "Add User"}
                </button>

                {feedback ? (
                  <p
                    className={`text-sm ${
                      feedback.type === "success" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {feedback.message}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Name, age, and email are required.
                  </p>
                )}
              </div>
            </form>
          </div>

          <aside className="rounded-[2rem] border border-amber-200/70 bg-[linear-gradient(180deg,_rgba(255,251,235,0.95)_0%,_rgba(255,255,255,0.98)_100%)] px-8 py-8 shadow-[0_24px_70px_-55px_rgba(15,23,42,0.5)]">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-800">
              Notes
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
              <p>
                Duplicate emails will be rejected by the database because the
                <code> email </code>
                column is unique.
              </p>
              <p>
                After a successful POST, the route invalidates and reloads the user list from
                the backend instead of mutating local copies.
              </p>
              <p>
                This keeps the page aligned with the same API data source used during the
                initial loader render.
              </p>
            </div>
          </aside>
        </section>

        {users.length === 0 ? (
          <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 px-8 py-16 text-center shadow-[0_20px_80px_-55px_rgba(15,23,42,0.4)]">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              No records
            </p>
            <h2 className="mt-4 font-['Georgia','Times_New_Roman',serif] text-3xl text-slate-900">
              No users found in the database.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600">
              Create a few users through the API and reload this page to see them listed
              here.
            </p>
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {users.map((user, index) => (
              <article
                key={user.id}
                className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white px-6 py-6 shadow-[0_24px_70px_-55px_rgba(15,23,42,0.6)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      User {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-3 font-['Georgia','Times_New_Roman',serif] text-3xl leading-tight text-slate-950">
                      {user.name}
                    </h2>
                  </div>
                  <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900">
                    {user.age} yrs
                  </div>
                </div>

                <dl className="mt-8 grid gap-4">
                  <div className="rounded-2xl bg-slate-100 px-4 py-3">
                    <dt className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Email
                    </dt>
                    <dd className="mt-2 break-all text-sm text-slate-800">
                      {user.email}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
                    <dt className="font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Record ID
                    </dt>
                    <dd className="font-mono text-slate-900">{user.id}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
