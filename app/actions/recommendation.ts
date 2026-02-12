'use server'

import { generateRecommendations, invalidateRecommendationCache } from '@/app/lib/recommendation'
import { getCurrentUser } from '@/app/lib/auth/session'
import type { RecommendedItem } from '@/app/lib/recommendation'

/**
 * レコメンドアイテムを取得するServer Action
 */
export async function getRecommendations(options?: {
  limit?: number
  excludeItemIds?: string[]
}): Promise<RecommendedItem[]> {
  try {
    const user = await getCurrentUser()

    const recommendations = await generateRecommendations(
      user?.id || null,
      {
        limit: options?.limit || 50,
        excludeItemIds: options?.excludeItemIds || [],
        useCache: true,
      }
    )

    return recommendations
  } catch (error) {
    console.error('Failed to get recommendations:', error)
    return []
  }
}

/**
 * レコメンドキャッシュを無効化するServer Action
 * ユーザーがお気に入り・フォローなどのアクションを行った際に呼ぶ
 */
export async function refreshRecommendations(): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (user) {
      await invalidateRecommendationCache(user.id)
    }
  } catch (error) {
    console.error('Failed to refresh recommendations:', error)
  }
}

