import { type FC, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { InstitutionLogin } from '../components/institution/InstitutionLogin';
import { useAuth } from '../context/AuthContext';
import type { LoginResponse } from '../types/institution';

export const InstitutionLoginPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/institution/pulse';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLoginSuccess = (authData: LoginResponse) => {
    login(authData);
    navigate(from, { replace: true });
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  return (
    <InstitutionLogin
      onLoginSuccess={handleLoginSuccess}
      onBackToLanding={handleBackToLanding}
    />
  );
};
