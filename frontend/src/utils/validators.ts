// Login validation
export function validateLogin({ email, password }: { email: string; password: string }) {
  const errors: { [key: string]: string } = {};
  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    errors.email = 'Valid email is required';
  }
  if (!password) {
    errors.password = 'Password is required';
  }
  return errors;
}

// Registration validation
export function validateRegister({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  dateOfBirth,
  gender,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: string;
}) {
  const errors: { [key: string]: string } = {};
  if (!firstName || firstName.length < 2) errors.firstName = 'First name is required';
  if (!lastName || lastName.length < 2) errors.lastName = 'Last name is required';
  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) errors.email = 'Valid email is required';
  if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (!dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
  if (!gender) errors.gender = 'Gender is required';
  return errors;
}
