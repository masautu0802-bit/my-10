import { createClient } from '@/app/lib/supabase/server'
import { cache } from 'react'

/**
 * Get the current authenticated user (cached)
 * Use this in Server Components
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
})

/**
 * Get the current user's profile from public.users table (cached)
 * Use this in Server Components
 */
export const getCurrentUserProfile = cache(async () => {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
})

/**
 * Require authentication - throws error if user is not authenticated
 * Use this in Server Actions or API routes
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('認証が必要です')
  }

  return user
}

/**
 * Check if user owns a shop
 */
export async function checkShopOwnership(shopId: string): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user) {
    return false
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from('shops')
    .select('owner_id')
    .eq('id', shopId)
    .single()

  return data?.owner_id === user.id
}
