import { z } from 'zod';

export interface PasswordRuleResult {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 5
  strength: 'weak' | 'fair' | 'good' | 'strong';
  strengthColor: string;
  strengthLabel: string;
  rules: PasswordRuleResult;
  errors: string[];
}

export const PASSWORD_REQUIREMENTS = [
  { id: 'minLength', label: 'At least 8 characters' },
  { id: 'hasUppercase', label: 'At least one uppercase letter (A-Z)' },
  { id: 'hasLowercase', label: 'At least one lowercase letter (a-z)' },
  { id: 'hasNumber', label: 'At least one number (0-9)' },
  { id: 'hasSpecial', label: 'At least one special character (e.g. !@#$%^&*)' },
] as const;

/**
 * Validates a password against all security requirements.
 * Used across Registration and Reset Password pages.
 */
export function validatePassword(password: string = ''): PasswordValidationResult {
  const pwd = password || '';
  
  const rules: PasswordRuleResult = {
    minLength: pwd.length >= 8 && pwd.length <= 50,
    hasUppercase: /[A-Z]/.test(pwd),
    hasLowercase: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[\W_]/.test(pwd),
  };

  const errors: string[] = [];
  if (pwd.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else if (pwd.length > 50) {
    errors.push('Password must be at most 50 characters');
  }
  if (!rules.hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!rules.hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!rules.hasNumber) {
    errors.push('Password must contain at least one number');
  }
  if (!rules.hasSpecial) {
    errors.push('Password must contain at least one special character');
  }

  const score = Object.values(rules).filter(Boolean).length;
  const isValid = score === 5;

  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  let strengthColor = 'bg-red-500';
  let strengthLabel = 'Weak';

  if (score <= 2) {
    strength = 'weak';
    strengthColor = 'bg-red-500';
    strengthLabel = 'Weak';
  } else if (score === 3) {
    strength = 'fair';
    strengthColor = 'bg-amber-500';
    strengthLabel = 'Fair';
  } else if (score === 4) {
    strength = 'good';
    strengthColor = 'bg-blue-500';
    strengthLabel = 'Good';
  } else if (score === 5) {
    strength = 'strong';
    strengthColor = 'bg-emerald-500';
    strengthLabel = 'Strong';
  }

  return {
    isValid,
    score,
    strength,
    strengthColor,
    strengthLabel,
    rules,
    errors,
  };
}

/**
 * Reusable Zod schema for password validation matching backend criteria.
 */
export const passwordZodSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(50, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[\W_]/, 'Password must contain at least one special character');
