import React, { useState } from 'react';
import RegisterForm from '../../components/forms/RegisterForm';
import { type RegisterFormData } from '../../types/user.d';
import { Link, useNavigate } from 'react-router-dom';
import driveLogo from '../../assets/pngwing.com.png';
import { register as registerApi } from '../../services/authService';

const Register: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const handleRegister = async (formData: RegisterFormData) => {
    setIsLoading(true);
    setError(undefined);
    try {
      await registerApi(formData);
      navigate('/auth/login');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed');
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
      <RegisterForm onSubmit={handleRegister} isLoading={isLoading} error={error} />
      <div className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
      </div>
    </div>
  );
};

export default Register;

