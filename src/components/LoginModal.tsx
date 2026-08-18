import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Key, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';
import { useUsers } from '../lib/storage';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginSuccessMsg, setLoginSuccessMsg] = useState('');

  const users = useUsers();

  if (!isOpen) return null;


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoginSuccessMsg('');

    const targetEmail = email.trim().toLowerCase();
    const foundUser = users.find(u => u.email.toLowerCase() === targetEmail);

    if (!foundUser) {
      setErrorMessage('Account with this email address was not found.');
      return;
    }

    if (!foundUser.active) {
      setErrorMessage('This user account has been deactivated by Super Admin.');
      return;
    }

    // Verify password (fallback to default role passwords if undefined)
    const expectedPassword = foundUser.password || 'Bika2026!';
    if (password !== expectedPassword) {
      setErrorMessage('Incorrect password. Please verify your credentials or check the directory below.');
      return;
    }

    setLoginSuccessMsg(`Authenticated successfully as ${foundUser.name} (${foundUser.role}).`);
    setTimeout(() => {
      onLoginSuccess(foundUser);
      onClose();
    }, 600);
  };

  const autofillCredentials = (u: User) => {
    setEmail(u.email);
    setPassword(u.password || 'Bika2026!');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl space-y-6 relative text-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Official Portal Login</h2>
              <p className="text-xs text-slate-400">Kingdom of Eswatini BIKA Platform Authentication</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Error / Success Messages */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-3 text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {loginSuccessMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-3 text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{loginSuccessMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. superadmin@bika.gov.sz"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Account Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-yellow-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:brightness-110 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            <Lock className="w-4 h-4" />
            <span>Sign In to Portal</span>
          </button>
        </form>

        {/* System Credentials Directory (For User Reference) */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wide text-yellow-400">
              Current Registered User Passwords Directory
            </span>
            <span className="text-[10px] text-slate-400">Click row to auto-fill</span>
          </div>

          <div className="overflow-x-auto bg-slate-950 border border-slate-800 rounded-2xl max-h-48 overflow-y-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold sticky top-0">
                <tr>
                  <th className="p-2">Role</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Password</th>
                  <th className="p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {users.map((u) => (
                  <tr 
                    key={u.id}
                    onClick={() => autofillCredentials(u)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="p-2 font-bold text-white whitespace-nowrap">{u.role}</td>
                    <td className="p-2 font-mono text-slate-300 whitespace-nowrap">{u.email}</td>
                    <td className="p-2 font-mono text-yellow-400 font-bold whitespace-nowrap">
                      {u.password || 'Bika2026!'}
                    </td>
                    <td className="p-2 text-right whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-lg bg-yellow-500/20 text-yellow-300 text-[10px] font-bold border border-yellow-500/30">
                        Fill
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
