'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/lib/supabase/server'
import { requireAuth } from '@/app/lib/auth/session'
import { invalidateRecommendationCache } from '@/app/lib/recommendation'

export async function toggleUserFollow(userId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  // 自分自身はフォローできない
  if (user.id === userId) {
    return { error: '自分自身をフォローすることはできません' }
  }

  const { data: existing } = await supabase
    .from('user_follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('followee_id', userId)
    .single()

  if (existing) {
    // アンフォロー
    await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('followee_id', userId)
  } else {
    // フォロー
    await supabase
      .from('user_follows')
      .insert({ follower_id: user.id, followee_id: userId })
  }

  // レコメンドキャッシュを無効化（行動変化のため）
  await invalidateRecommendationCache(user.id)

  revalidatePath(`/users/${userId}`)
  revalidatePath('/my')
  revalidatePath('/my/following/users')
  revalidatePath('/shops')
  revalidatePath('/')
}
