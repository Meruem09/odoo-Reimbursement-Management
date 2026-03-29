"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { Button } from "@/app/components/ui/button";
import { Loader2, UserPlus, X, Shield, Users, User } from "lucide-react";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  isActive: boolean;
  isPasswordSet: boolean;
  createdAt: string;
  manager: { id: string; name: string; email: string } | null;
};

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800",
  MANAGER: "bg-blue-100 text-blue-800",
  EMPLOYEE: "bg-gray-100 text-gray-800",
};

const ROLE_ICON: Record<string, React.ReactNode> = {
  ADMIN: <Shield className="size-3" />,
  MANAGER: <Users className="size-3" />,
  EMPLOYEE: <User className="size-3" />,
};

type NewUserForm = {
  name: string;
  email: string;
  role: "MANAGER" | "EMPLOYEE";
  managerId: string;
};

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [newUser, setNewUser] = useState<NewUserForm>({
    name: "",
    email: "",
    role: "EMPLOYEE",
    managerId: "",
  });

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !user) router.replace("/signIn?redirect=/dashboard/admin/users");
    if (!loading && user && user.role !== "ADMIN") router.replace("/dashboard");
  }, [loading, user, router]);

  async function fetchUsers() {
    setFetching(true);
    setFetchError("");
    try {
      const res = await fetch("/api/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load users");
      const data = (await res.json()) as { users: UserItem[] };
      setUsers(data.users);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Error loading users");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (user?.role === "ADMIN") fetchUsers();
  }, [user]);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    setSuccessMsg("");
    if (!newUser.name || !newUser.email || !newUser.role) {
      setSubmitError("Name, email and role are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          managerId: newUser.managerId || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        errors?: { field: string; message: string }[];
        message?: string;
      };
      if (!res.ok) {
        throw new Error(
          data.errors?.[0]?.message || data.error || "Failed to create user"
        );
      }
      setSuccessMsg(data.message || "User invited successfully!");
      setNewUser({ name: "", email: "", role: "EMPLOYEE", managerId: "" });
      await fetchUsers();
      setTimeout(() => {
        setShowModal(false);
        setSuccessMsg("");
      }, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(userId: string, currentActive: boolean) {
    try {
      await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !currentActive }),
      });
      await fetchUsers();
    } catch {
      // silent fail — refetch will show current state
    }
  }

  const managers = users.filter((u) => u.role === "MANAGER" || u.role === "ADMIN");

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your organisation&apos;s users and roles
          </p>
        </div>
        <Button
          onClick={() => { setShowModal(true); setSubmitError(""); setSuccessMsg(""); }}
          id="invite-user-btn"
        >
          <UserPlus className="size-4" />
          Invite User
        </Button>
      </div>

      {fetchError && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {fetchError}
        </div>
      )}

      {fetching ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Manager</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                    {!u.isPasswordSet && (
                      <span className="text-xs text-amber-600">Invite pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role] || ""}`}
                    >
                      {ROLE_ICON[u.role]}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {u.manager?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== user.id && (
                      <button
                        onClick={() => toggleActive(u.id, u.isActive)}
                        className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No team members yet. Invite someone to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Invite Team Member</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {submitError && (
              <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="new-name" className="text-sm font-medium">Full Name</label>
                <input
                  id="new-name"
                  type="text"
                  placeholder="Jane Doe"
                  value={newUser.name}
                  onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                  disabled={submitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="new-email" className="text-sm font-medium">Email</label>
                <input
                  id="new-email"
                  type="email"
                  placeholder="jane@company.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                  disabled={submitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="new-role" className="text-sm font-medium">Role</label>
                <select
                  id="new-role"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser((p) => ({
                      ...p,
                      role: e.target.value as "MANAGER" | "EMPLOYEE",
                    }))
                  }
                  disabled={submitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
              {managers.length > 0 && (
                <div className="space-y-2">
                  <label htmlFor="new-manager" className="text-sm font-medium">
                    Assign Manager{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <select
                    id="new-manager"
                    value={newUser.managerId}
                    onChange={(e) => setNewUser((p) => ({ ...p, managerId: e.target.value }))}
                    disabled={submitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    <option value="">No manager</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting} id="create-user-submit">
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send Invitation"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
