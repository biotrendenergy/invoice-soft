"use client";

import { useEffect, useState } from "react";
import { getAllUsers, createUser, updateUserRole, deleteUser, getCurrentUser } from "@/action/user";
import { useRouter } from "next/navigation";
import Pagination from "../_components/Pagination";

type User = { id: number; username: string; role: string };

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Create user modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [createError, setCreateError] = useState("");

  // Reset password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null);
  const [newPass, setNewPass] = useState("");

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const refresh = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  useEffect(() => {
    // Guard: redirect non-admins away
    getCurrentUser().then((u) => {
      if (!u || u.role !== "admin") {
        router.replace("/dashboard");
        return;
      }
      setCurrentUserId(u.id);
    });
    refresh();
  }, []);

  const handleCreate = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      setCreateError("Username and password are required.");
      return;
    }
    setLoading(true);
    setCreateError("");
    try {
      await createUser(newUsername.trim(), newPassword.trim(), newRole);
      setShowCreateModal(false);
      setNewUsername("");
      setNewPassword("");
      setNewRole("user");
      await refresh();
    } catch (e: any) {
      setCreateError(e.message ?? "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (user: User) => {
    const next = user.role === "admin" ? "user" : "admin";
    setLoading(true);
    await updateUserRole(user.id, next);
    await refresh();
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    await deleteUser(deleteTarget.id);
    setDeleteTarget(null);
    await refresh();
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!passwordTarget || !newPass.trim()) return;
    setLoading(true);
    const { updateUserPassword } = await import("@/action/user");
    await updateUserPassword(passwordTarget.id, newPass.trim());
    setShowPasswordModal(false);
    setPasswordTarget(null);
    setNewPass("");
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-green-900 tracking-tight">Admin Panel</h1>
          <p className="text-xs text-green-600 mt-0.5">Manage users, roles and access · BioTrend Energy</p>
        </div>
        <button
          className="btn btn-green"
          onClick={() => { setShowCreateModal(true); setCreateError(""); }}
        >
          + Add User
        </button>
      </div>

      {/* Info banner */}
      <div
        className="rounded-xl px-5 py-3.5 border border-purple-200/60 flex items-start gap-3"
        style={{ background: "rgba(245,243,255,0.70)", backdropFilter: "blur(12px)" }}
      >
        <svg className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-purple-700">
          Only <strong>admin</strong> users can delete records from the home page and access this panel.
          Regular users have read and write access but cannot delete records.
        </p>
      </div>

      {/* Users Table */}
      <div
        className="overflow-x-auto rounded-xl shadow-lg border border-white/60"
        style={{ background: "rgba(255,255,255,0.60)", backdropFilter: "blur(16px)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-green-100/80" style={{ background: "rgba(240,253,244,0.80)" }}>
              {["#", "Username", "Role", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-green-700 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-green-100/60">
            {users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((user, i) => (
              <tr key={user.id} className="bg-white/30 hover:bg-white/60 transition-colors duration-100">
                <td className="px-4 py-3.5 text-gray-400 font-mono text-xs">{i + 1}</td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0
                      ${user.role === "admin" ? "bg-purple-500" : "bg-green-500"}`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">
                      {user.username}
                      {user.id === currentUserId && (
                        <span className="ml-1.5 text-[10px] text-green-600 font-medium">(you)</span>
                      )}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                    ${user.role === "admin"
                      ? "bg-purple-50 text-purple-600 ring-1 ring-purple-300"
                      : "bg-green-50 text-green-600 ring-1 ring-green-300"
                    }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {user.role}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    {/* Toggle role — can't change own role */}
                    {user.id !== currentUserId && (
                      <button
                        disabled={loading}
                        onClick={() => handleRoleToggle(user)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ring-1 transition-all duration-150 shadow-sm
                          ${user.role === "admin"
                            ? "bg-green-50 text-green-600 ring-green-200 hover:bg-green-100"
                            : "bg-purple-50 text-purple-600 ring-purple-200 hover:bg-purple-100"
                          }`}
                      >
                        {user.role === "admin" ? "Set as User" : "Set as Admin"}
                      </button>
                    )}

                    {/* Reset password */}
                    <button
                      disabled={loading}
                      onClick={() => { setPasswordTarget(user); setNewPass(""); setShowPasswordModal(true); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/70 text-gray-600 ring-1 ring-gray-200 hover:bg-white hover:text-gray-900 transition-all duration-150 shadow-sm"
                    >
                      Reset Password
                    </button>

                    {/* Delete — can't delete yourself */}
                    {user.id !== currentUserId && (
                      <button
                        disabled={loading}
                        onClick={() => setDeleteTarget(user)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 ring-1 ring-red-200 hover:bg-red-100 transition-all duration-150 shadow-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-400 text-sm">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        totalPages={Math.ceil(users.length / PAGE_SIZE)}
        onPageChange={setPage}
        totalItems={users.length}
        pageSize={PAGE_SIZE}
      />

      {/* ── Create User Modal ── */}
      {showCreateModal && (
        <dialog open className="modal modal-open">
          <div
            className="modal-box border border-white/60 flex flex-col gap-5"
            style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)" }}
          >
            <div>
              <h3 className="font-bold text-lg text-green-900">Create New User</h3>
              <p className="text-xs text-green-600 mt-0.5">Set up credentials and assign a role</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Username</label>
                <input
                  className="input input-bordered w-full"
                  placeholder="Enter username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Enter password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <select
                  className="select select-bordered w-full"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="user">User — standard access</option>
                  <option value="admin">Admin — full access</option>
                </select>
              </div>
              {createError && (
                <p className="text-red-500 text-xs">{createError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button className="btn btn-ghost" disabled={loading} onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn btn-green" disabled={loading} onClick={handleCreate}>
                {loading ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowCreateModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* ── Reset Password Modal ── */}
      {showPasswordModal && passwordTarget && (
        <dialog open className="modal modal-open">
          <div
            className="modal-box border border-white/60 flex flex-col gap-5"
            style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)" }}
          >
            <div>
              <h3 className="font-bold text-lg text-green-900">Reset Password</h3>
              <p className="text-xs text-green-600 mt-0.5">Setting new password for <strong>{passwordTarget.username}</strong></p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                className="input input-bordered w-full"
                placeholder="Enter new password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button className="btn btn-ghost" disabled={loading} onClick={() => setShowPasswordModal(false)}>
                Cancel
              </button>
              <button className="btn btn-green" disabled={loading || !newPass.trim()} onClick={handlePasswordReset}>
                {loading ? "Saving..." : "Save Password"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowPasswordModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <dialog open className="modal modal-open">
          <div
            className="modal-box border border-white/60"
            style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)" }}
          >
            <h3 className="font-bold text-lg text-green-900">Confirm Delete</h3>
            <p className="py-2 text-gray-600">
              Are you sure you want to delete user <strong>{deleteTarget.username}</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-action">
              <button className="btn btn-error" onClick={handleDelete} disabled={loading}>
                {loading ? "Deleting..." : "Delete"}
              </button>
              <button className="btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setDeleteTarget(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
