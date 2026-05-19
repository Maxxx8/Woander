import { ReactNode } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Shield } from 'lucide-react';

interface PermissionGateProps {
  children: ReactNode;
  permission?: string;
  anyPermissions?: string[];
  allPermissions?: string[];
  requireSuperAdmin?: boolean;
  fallback?: ReactNode;
  showMessage?: boolean;
}

export default function PermissionGate({
  children,
  permission,
  anyPermissions,
  allPermissions,
  requireSuperAdmin,
  fallback,
  showMessage = false
}: PermissionGateProps) {
  const { isSuperAdmin, hasPermission, hasAnyPermission, hasAllPermissions } = useAdminAuth();

  if (requireSuperAdmin && !isSuperAdmin) {
    return fallback || (showMessage ? <PermissionDenied /> : null);
  }

  if (permission && !hasPermission(permission)) {
    return fallback || (showMessage ? <PermissionDenied /> : null);
  }

  if (anyPermissions && !hasAnyPermission(anyPermissions)) {
    return fallback || (showMessage ? <PermissionDenied /> : null);
  }

  if (allPermissions && !hasAllPermissions(allPermissions)) {
    return fallback || (showMessage ? <PermissionDenied /> : null);
  }

  return <>{children}</>;
}

function PermissionDenied() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <Shield className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
      <p className="text-gray-600 max-w-md">
        You don't have the necessary permissions to access this feature. Contact a super admin if you need access.
      </p>
    </div>
  );
}
