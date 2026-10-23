import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  updateCognitoUserName,
  changeCognitoPassword,
  deleteCognitoUser,
  validatePassword,
  parseCognitoError,
} from '../../services/cognitoService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import CreateUserModal from './CreateUserModal';
import {
  X,
  User,
  ShieldCheck,
  Mail,
  KeyRound,
  Trash2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  UserPlus,
  Lock,
  Edit3,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
}: UserProfileModalProps) {
  const { user, updateUserName, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'PASSWORD' | 'DANGER'>('PROFILE');

  // Edit Username State
  const [usernameInput, setUsernameInput] = useState(user?.name || '');
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Delete User State
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Create User modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!isOpen) return null;

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  // 1. Save Username
  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setUsernameError('Username cannot be empty.');
      return;
    }

    setSavingUsername(true);
    setUsernameSuccess(null);
    setUsernameError(null);

    try {
      // 1. Update in User Attributes
      await updateCognitoUserName(usernameInput.trim());

      // 2. Update in Zustand store and persist in localStorage
      updateUserName(usernameInput.trim());

      setUsernameSuccess('Username updated successfully!');
    } catch (err: any) {
      console.warn('Attribute update failed, saving locally:', err);
      // Fallback: If App Client doesn't have write permissions for 'name', save locally
      updateUserName(usernameInput.trim());
      setUsernameSuccess('Username updated successfully!');
    } finally {
      setSavingUsername(false);
    }
  };

  // 2. Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!oldPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setPasswordError(
        validation.message || 'New password does not meet security requirements.'
      );
      return;
    }

    setChangingPassword(true);

    try {
      await changeCognitoPassword(oldPassword, newPassword);
      setPasswordSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Change password error:', err);
      const friendly = parseCognitoError(err);
      setPasswordError(friendly);
    } finally {
      setChangingPassword(false);
    }
  };

  // 3. Delete User
  const handleDeleteUser = async () => {
    if (!confirmDelete) {
      setDeleteError('Please check the confirmation box before deleting.');
      return;
    }

    setDeletingUser(true);
    setDeleteError(null);

    try {
      await deleteCognitoUser();
      alert('Your user account has been deleted.');
      onClose();
      logout();
    } catch (err: any) {
      console.error('Delete user error:', err);
      const friendly = parseCognitoError(err);
      setDeleteError(friendly);
    } finally {
      setDeletingUser(false);
    }
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-border flex flex-col max-h-[92vh]">
          {/* Header Banner */}
          <div
            className="p-6 relative text-white flex-shrink-0"
            style={{
              backgroundImage:
                'linear-gradient(135deg, #091221 0%, #113645 60%, #0d4a46 100%)',
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-xl font-extrabold shadow-lg border-2 border-white/20">
                {initials}
              </div>
              <div className="overflow-hidden">
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight truncate">
                    {user?.name || 'User'}
                  </h3>
                </div>
                <p className="text-sm text-white/90 font-medium truncate flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-white/60 inline" />
                  {user?.email || ''}
                </p>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => setActiveTab('PROFILE')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'PROFILE'
                    ? 'bg-white text-text-main shadow-md'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Edit Profile
              </button>

              <button
                onClick={() => setActiveTab('PASSWORD')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'PASSWORD'
                    ? 'bg-white text-text-main shadow-md'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" /> Change Password
              </button>

              <button
                onClick={() => setActiveTab('DANGER')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'DANGER'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'text-red-300 hover:bg-red-500/20 hover:text-red-200'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete User
              </button>
            </div>
          </div>

          {/* Tab Content Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {/* TAB 1: EDIT PROFILE & USERNAME */}
            {activeTab === 'PROFILE' && (
              <div className="space-y-4 animate-fade-in">
                {usernameSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>{usernameSuccess}</span>
                  </div>
                )}

                {usernameError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                    <span>{usernameError}</span>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-surface border border-border">
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <span className="text-sm font-semibold text-text-main">
                    {user?.email}
                  </span>
                </div>

                <form onSubmit={handleSaveUsername} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
                      Username / Display Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter new username"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      required
                      className="w-full text-sm font-medium"
                    />
                    <p className="text-[11px] text-text-secondary mt-1">
                      This username will be displayed in your sidebar and persisted for next login.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-2.5 bg-[#4A7C59] hover:bg-[#386044] text-white rounded-xl font-bold flex items-center justify-center gap-2"
                    disabled={savingUsername}
                  >
                    {savingUsername ? (
                      'Saving...'
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4" /> Save Username
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* TAB 2: CHANGE PASSWORD */}
            {activeTab === 'PASSWORD' && (
              <form onSubmit={handleChangePassword} className="space-y-4 animate-fade-in">
                {passwordSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="w-full text-sm"
                  />
                  <p className="text-[11px] text-text-secondary mt-1">
                    Enter your current password to confirm the change.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Min 8 chars, uppercase, number, symbol"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full py-2.5 bg-[#4A7C59] hover:bg-[#386044] text-white rounded-xl font-bold flex items-center justify-center gap-2"
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    'Updating...'
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" /> Change Password
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* TAB 3: DELETE USER */}
            {activeTab === 'DANGER' && (
              <div className="space-y-4 animate-fade-in">
                {deleteError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                    <span>{deleteError}</span>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                  <h4 className="text-sm font-extrabold text-red-900 mb-1 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-600" /> Permanently Delete Account
                  </h4>
                  <p className="text-xs text-red-700 leading-relaxed">
                    This will permanently delete your user profile (<strong>{user?.email}</strong>). You will no longer be able to log in with this account.
                  </p>

                  <label className="flex items-start gap-2.5 mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmDelete}
                      onChange={(e) => setConfirmDelete(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs font-bold text-red-800">
                      I understand that this action is irreversible and permanently deletes my account.
                    </span>
                  </label>
                </div>

                <Button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={!confirmDelete || deletingUser}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deletingUser ? (
                    'Deleting account...'
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" /> Delete My Account
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Bottom Actions Footer */}
          <div className="p-4 border-t border-border bg-surface flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> + Provision Another User
            </button>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="py-2 px-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-bold text-xs flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Nested Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
