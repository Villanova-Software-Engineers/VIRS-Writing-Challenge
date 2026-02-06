import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from './HorizonInputField';
import { useFormValidation } from '../hooks/useFormValidation';
import { AuthService } from '../services/auth.service';
import { DEPARTMENTS } from "../../constants/departments";
import type { FormErrors } from '../types/auth.types';

interface SignUpFormProps {
  onSuccess?: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { validateEmail, validatePassword, validateConfirmPassword } = useFormValidation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    customDepartment: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Validate name (at least 2 characters, letters only)
  const validateName = (name: string, fieldName: string): string => {
    if (!name.trim()) return `${fieldName} is required`;
    if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
    if (!/^[a-zA-Z\s-']+$/.test(name)) return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    return '';
  };

  // Validate department selection
  const validateDepartment = (): string => {
    if (!formData.department) return 'Please select a department';
    if (formData.department === 'Other' && !formData.customDepartment.trim()) {
      return 'Please enter your department';
    }
    return '';
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[id as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  // Handle blur events for real-time validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    let error = '';

    switch (id) {
      case 'firstName':
        error = validateName(value, 'First name');
        break;
      case 'lastName':
        error = validateName(value, 'Last name');
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.password, value);
        break;
      case 'department':
        error = validateDepartment();
        break;
      case 'customDepartment':
        if (formData.department === 'Other') {
          error = value.trim() ? '' : 'Please enter your department';
        }
        break;
    }

    if (error) {
      setErrors(prev => ({ ...prev, [id]: error }));
    }
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.firstName = validateName(formData.firstName, 'First name');
    newErrors.lastName = validateName(formData.lastName, 'Last name');
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    newErrors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
    newErrors.department = validateDepartment();

    // Remove empty error messages
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key as keyof FormErrors]) {
        delete newErrors[key as keyof FormErrors];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Determine final department value
      const finalDepartment = formData.department === 'Other' 
        ? formData.customDepartment.trim() 
        : formData.department;

      const response = await AuthService.signUp({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        department: finalDepartment,
      });

      setSuccessMessage(response.message || 'Account created successfully!');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        department: '',
        customDepartment: '',
      });

      // Call success callback or navigate
      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate to email verification page after 2 seconds
        setTimeout(() => {
          navigate('/auth/verify-email');
        }, 2000);
      }
    } catch (error: any) {
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
        setErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
        setErrors(prev => ({ ...prev, password: errorMessage }));
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
        setErrors(prev => ({ ...prev, email: errorMessage }));
      } else {
        setErrors(prev => ({ ...prev, email: error.message || errorMessage }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {successMessage && (
        <div className="alert success">{successMessage}</div>
      )}

      <div className="field-row two">
        <div>
          <InputField
            variant="auth"
            label="First name"
            id="firstName"
            type="text"
            placeholder="Owen"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            state={errors.firstName ? 'error' : undefined}
            disabled={isLoading}
          />
          {errors.firstName && <p className="field-error">{errors.firstName}</p>}
        </div>

        <div>
          <InputField
            variant="auth"
            label="Last name"
            id="lastName"
            type="text"
            placeholder="Fox"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            state={errors.lastName ? 'error' : undefined}
            disabled={isLoading}
          />
          {errors.lastName && <p className="field-error">{errors.lastName}</p>}
        </div>
      </div>

      <div className="field-row">
        <InputField
          variant="auth"
          label="Work email"
          id="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          state={errors.email ? 'error' : undefined}
          disabled={isLoading}
        />
        {errors.email && <p className="field-error">{errors.email}</p>}
      </div>

      <div className="field-row">
        <InputField
          variant="auth"
          label="Password"
          id="password"
          type="password"
          placeholder="Min. 8 characters"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          state={errors.password ? 'error' : undefined}
          disabled={isLoading}
        />
        {errors.password && <p className="field-error">{errors.password}</p>}
        <p className="field-note">Use at least 1 upper, 1 number, and 1 special character.</p>
      </div>

      <div className="field-row">
        <InputField
          variant="auth"
          label="Confirm password"
          id="confirmPassword"
          type="password"
          placeholder="Re-enter password"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          state={errors.confirmPassword ? 'error' : undefined}
          disabled={isLoading}
        />
        {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
      </div>

      <div className="field-row">
        <label htmlFor="department" className="auth-label">Department</label>
        <select
          id="department"
          value={formData.department}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isLoading}
          className={`auth-select ${errors.department ? 'is-error' : ''} ${isLoading ? 'is-disabled' : ''}`}
        >
          <option value="">Select a department</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        {errors.department && <p className="field-error">{errors.department}</p>}
      </div>

      {formData.department === 'Other' && (
        <div className="field-row">
          <InputField
            variant="auth"
            label="Enter your department"
            id="customDepartment"
            type="text"
            placeholder="e.g., Research & Development"
            value={formData.customDepartment}
            onChange={handleChange}
            onBlur={handleBlur}
            state={errors.customDepartment ? 'error' : undefined}
            disabled={isLoading}
          />
          {errors.customDepartment && <p className="field-error">{errors.customDepartment}</p>}
        </div>
      )}

      <button type="submit" disabled={isLoading} className="primary-btn">
        {isLoading ? 'Creating your account…' : 'Create account'}
      </button>

      <p className="muted-text">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/auth/sign-in')}
          className="link-btn"
        >
          Sign in
        </button>
      </p>
    </form>
  );
};

export default SignUpForm;
