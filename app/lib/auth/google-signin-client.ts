'use client'

import { createClient } from '@/app/lib/supabase/client'

/**
 * クライアント側で Google OAuth を開始します。
 * PKCE の code_verifier が createBrowserClient によりクッキーに保存されるため、
 * コールバック時（サーバー）で exchangeCodeForSession が成功します。
 * Server Action で開始すると code_verifier がクッキーに渡らず "PKCE code verifier not found" になります。
 */
export async function signInWithGoogleClient(): Promise<{ url?: string; error?: string }> {
  const supabase = createClient()
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : ''

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })

  if (error) {
    return { error: error.message }
  }
  if (data.url) {
    return { url: data.url }
  }
  return { error: '認証URLの取得に失敗しました' }
}
