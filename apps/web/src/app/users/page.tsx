'use client';

import { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, X, Loader2 } from 'lucide-react';

interface User {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
  budgetLevel: string;
  householdSize: number;
  cookingSkill: string;
  createdAt: string;
}

export default function UsersPage(): React.JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ clerkId: '', email: '', fullName: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/users');
      const json = await res.json();
      setUsers(json.data ?? []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:4000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ clerkId: '', email: '', fullName: '' });
        setShowForm(false);
        fetchUsers();
      }
    } catch {
      // error
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Users
          </h1>
          <p className="mt-1 text-surface-200/60">{users.length} registered users</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 active:scale-95"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-dark rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
            New User
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-surface-200/60 mb-1">Clerk ID</label>
              <input
                type="text"
                required
                value={form.clerkId}
                onChange={(e) => setForm({ ...form, clerkId: e.target.value })}
                className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                placeholder="user_abc123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-200/60 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                placeholder="jean@example.rw"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-200/60 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                placeholder="Jean Mugabo"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      )}

      {users.length > 0 ? (
        <div className="glass-dark rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-surface-800/50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Budget</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Household</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-surface-200/40 uppercase tracking-wider">Skill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/30">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-800/20">
                  <td className="px-6 py-4 text-sm font-medium">{user.fullName}</td>
                  <td className="px-6 py-4 text-sm text-surface-200/50">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="rounded-full bg-primary-500/15 px-2.5 py-1 text-xs font-medium text-primary-400">
                      {user.budgetLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-200/50">{user.householdSize}</td>
                  <td className="px-6 py-4 text-sm text-surface-200/50">{user.cookingSkill}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-dark flex h-96 items-center justify-center rounded-2xl">
          <div className="text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-surface-200/20" />
            <p className="mt-4 text-lg font-medium text-surface-200/40">No users yet</p>
            <p className="mt-1 text-sm text-surface-200/25">Users will appear here after registration</p>
          </div>
        </div>
      )}
    </div>
  );
}
