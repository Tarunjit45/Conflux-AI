// Conflux Platform — Protected Route Guard for RBAC

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import type { UserRole } from '../../types/business';
import { ShieldAlert, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ['ADMIN']
}) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-rose-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-2xl font-bold font-orbitron text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600">
            Your current role (<span className="font-bold text-slate-800">{role}</span>) does not have authorization to access this administrative console.
          </p>
          <div className="pt-4 border-t border-slate-100">
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-bold transition-all"
            >
              <LogIn size={16} /> Switch Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
