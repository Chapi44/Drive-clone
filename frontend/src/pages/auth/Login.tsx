import React, { useState } from 'react';
import LoginForm from '../../components/forms/LoginForm';
import { type LoginFormData } from '../../types/user.d';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../../services/authService';
import driveLogo from '../../assets/pngwing.com.png';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(undefined);
    try {
      const response = await loginApi(data);
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="mb-6 flex items-center gap-2">
      <img src={driveLogo} alt="Drive Logo" className="h-8" />
        <span className="text-2xl font-bold text-gray-800">Drive</span>
      </div>
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
      <div className="mt-4 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link to="/auth/register" className="text-blue-600 hover:underline font-medium">Create account</Link>
      </div>
    </div>
  );
};

export default Login;
