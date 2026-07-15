import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';

export function AdminUsers({ users, onAddUser, onEditUser, onSaveUser, onRemoveUser, onCycleRole, dark }) {
  const [editingUser, setEditingUser] = useState(null);
  const [draftName, setDraftName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');

  const handleStartEdit = (user) => {
    setEditingUser(user.id);
    setDraftName(user.name);
    setDraftEmail(user.email);
    onEditUser?.(user);
  };

  const handleSaveEdit = (id) => {
    onSaveUser?.(id, draftName, draftEmail);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">User management</p>
          <h1 className={clsx('mt-1 text-3xl font-black', dark ? 'text-white' : 'text-slate-900')}>All users</h1>
        </div>
        <button
          onClick={onAddUser}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:brightness-110 active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          Add user
        </button>
      </div>

      <div className={clsx('overflow-x-auto rounded-2xl border', dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white')}>
        <table className="min-w-[780px] w-full">
          <thead className={clsx('border-b', dark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-slate-50')}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500">Email</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500">Role</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500">Status</th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: dark ? '#1e293b' : '#f1f5f9' }}>
            {users.map((user) => (
              <tr key={user.id} className={dark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                <td className="px-6 py-4">
                  {editingUser === user.id ? (
                    <input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className={clsx(
                        'rounded px-2 py-1 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/40',
                        dark ? 'border-slate-700 bg-slate-950 text-white' : 'border-slate-200 bg-white'
                      )}
                    />
                  ) : (
                    <p className={clsx('text-sm font-bold', dark ? 'text-white' : 'text-slate-900')}>{user.name}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingUser === user.id ? (
                    <input
                      value={draftEmail}
                      onChange={(e) => setDraftEmail(e.target.value)}
                      className={clsx(
                        'rounded px-2 py-1 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/40',
                        dark ? 'border-slate-700 bg-slate-950 text-white' : 'border-slate-200 bg-white'
                      )}
                    />
                  ) : (
                    <p className={clsx('text-sm', dark ? 'text-slate-300' : 'text-slate-600')}>{user.email}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    'inline-block rounded-full px-3 py-1 text-xs font-bold',
                    user.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200'
                      : user.role === 'instructor' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                        : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-200'
                  )}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    'inline-block rounded-full px-3 py-1 text-xs font-bold',
                    user.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-200'
                  )}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editingUser === user.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(user.id)}
                          className="rounded px-3 py-1 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="rounded px-3 py-1 text-xs font-bold bg-slate-600 text-white hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(user)}
                          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-indigo-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                          title="Edit user"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onCycleRole?.(user.id)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          title="Cycle role"
                        >
                          Cycle
                        </button>
                        <button
                          onClick={() => onRemoveUser?.(user.id)}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                          title="Remove user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
