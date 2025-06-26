export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
}

export interface LoginFormData {
  email: string;
  password: string;
}

