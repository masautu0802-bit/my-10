'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'

type AuthResult = {
  error?: string
}

type SignUpFormData = {
  email: string
  password: string
  name: string
}

type SignInFormData = {
  email: string
  password: string
}

export async function signUp(formData: SignUpFormData): Promise<AuthResult> {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        name: formData.name,
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'ユーザー登録に失敗しました' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signIn(formData: SignInFormData): Promise<AuthResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    if (error.message === 'Invalid login credentials') {
      return { error: 'メールアドレスまたはパスワードが正しくありません' }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut(): Promise<AuthResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signInWithGoogle(origin: string): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    return { url: data.url }
  }

  return { error: '認証URLの取得に失敗しました' }
}
