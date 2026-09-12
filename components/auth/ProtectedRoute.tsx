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
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Enforce role-based access control (RBAC)
  if (allowedRoles && allowedRoles.length > 0 && (!user.role || !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-xl p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
            <p className="text-sm text-slate-600">
              You are signed in as <span className="font-semibold text-slate-800">{user.email}</span> with role{' '}
              <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-xs font-bold">
                {user.role}
              </span>
              , which is not authorized to access this administration portal.
            </p>
            <p className="text-xs text-slate-500">
              Required privilege: <span className="font-mono font-semibold text-slate-700">{allowedRoles.join(' or ')}</span>
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
            >
              Return to Public Site
            </a>
            <a
              href="/auth"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Switch Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
