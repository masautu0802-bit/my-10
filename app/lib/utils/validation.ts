/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Password validation
 * - At least 8 characters
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8
}

/**
 * Name validation
 * - At least 1 character
 * - Max 50 characters
 */
export function isValidName(name: string): boolean {
  return name.length >= 1 && name.length <= 50
}

/**
 * Validate sign up form data
 */
export function validateSignUpForm(data: {
  email: string
  password: string
  name: string
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  if (!isValidEmail(data.email)) {
    errors.email = '有効なメールアドレスを入力してください'
  }

  if (!isValidPassword(data.password)) {
    errors.password = 'パスワードは8文字以上で入力してください'
  }

  if (!isValidName(data.name)) {
    errors.name = '名前は1〜50文字で入力してください'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validate sign in form data
 */
export function validateSignInForm(data: {
  email: string
  password: string
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  if (!isValidEmail(data.email)) {
    errors.email = '有効なメールアドレスを入力してください'
  }

  if (!data.password) {
    errors.password = 'パスワードを入力してください'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
