import { type FC, type ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('nexus_access_token');

  if (!token) {
    return null;
  }

  return <>{children}</>;
};
