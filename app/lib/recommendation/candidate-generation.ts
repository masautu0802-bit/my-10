/**
 * Phase 1: 候補生成 (Candidate Generation)
 *
 * 3つの戦略で候補を生成し、統合する:
 * 1. Item-Item 協調フィルタリング（共起ベース）
 * 2. Shop-Based 拡張（フォロー中ショップ）
 * 3. User-Based 拡張（フォローユーザー）
 *
 * 設計書: Docs/recommendation-system-design.md Section 3
 */

import { createClient } from '@/app/lib/supabase/server'
import type {
  CandidateItem,
  CandidateGenerationOptions,
  CandidateSource,
} from './types'

// ========================================
// 統合候補生成
// ========================================

/**
 * 3つの戦略を統合して候補アイテムを生成
 */
export async function generateCandidates(
  userId: string,
  options: CandidateGenerationOptions
): Promise<CandidateItem[]> {
  const { excludeItemIds, candidateLimit } = options

  // ユーザーの既知アイテムを取得
  const knownItemIds = await getUserKnownItemIds(userId)
  const allExcludeIds = new Set([...knownItemIds, ...excludeItemIds])

  // 3つの戦略を並行実行
  const [itemCollabCandidates, shopBasedCandidates, userBasedCandidates] =
    await Promise.all([
      getItemCollabCandidates(userId, allExcludeIds),
      getShopBasedCandidates(userId, allExcludeIds),
      getUserBasedCandidates(userId, allExcludeIds),
    ])

  // 統合と重複排除
  const candidateMap = new Map<
    string,
    {
      totalScore: number
      sources: Set<CandidateSource>
      name: string
      imageUrl: string | null
      shopId: string
      shopName: string
      shopTheme: string
      createdAt: string
    }
  >()

  const mergeCandidates = (
    items: RawCandidate[],
    source: CandidateSource
  ) => {
    for (const item of items) {
      const existing = candidateMap.get(item.itemId)
      if (existing) {
        existing.totalScore += item.score
        existing.sources.add(source)
      } else {
        candidateMap.set(item.itemId, {
          totalScore: item.score,
          sources: new Set([source]),
          name: item.name,
          imageUrl: item.imageUrl,
          shopId: item.shopId,
          shopName: item.shopName,
          shopTheme: item.shopTheme,
          createdAt: item.createdAt,
        })
      }
    }
  }

  mergeCandidates(itemCollabCandidates, 'item_collab')
  mergeCandidates(shopBasedCandidates, 'shop_based')
  mergeCandidates(userBasedCandidates, 'user_based')

  // CandidateItem配列に変換してスコア順でソート
  const candidates: CandidateItem[] = Array.from(candidateMap.entries())
    .map(([itemId, data]) => ({
      itemId,
      totalScore: data.totalScore,
      sourceDiversity: data.sources.size,
      sources: Array.from(data.sources),
      name: data.name,
      imageUrl: data.imageUrl,
      shopId: data.shopId,
      shopName: data.shopName,
      shopTheme: data.shopTheme,
      createdAt: data.createdAt,
    }))
    .sort((a, b) => {
      // まずスコア降順、次にソース多様性降順
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore
      return b.sourceDiversity - a.sourceDiversity
    })
    .slice(0, candidateLimit)

  return candidates
}

// ========================================
// 内部型
// ========================================

interface RawCandidate {
  itemId: string
  score: number
  name: string
  imageUrl: string | null
  shopId: string
  shopName: string
  shopTheme: string
  createdAt: string
}

// ========================================
// ユーザーの既知アイテムID取得
// ========================================

async function getUserKnownItemIds(userId: string): Promise<string[]> {
  const supabase = await createClient()

  // お気に入りとKeep保存を並行取得
  const [{ data: favorites }, { data: keepFolders }] = await Promise.all([
    supabase.from('item_favorites').select('item_id').eq('user_id', userId),
    supabase.from('keep_folders').select('id').eq('user_id', userId),
  ])

  const knownIds = new Set<string>()

  // お気に入りアイテム
  favorites?.forEach((f) => knownIds.add(f.item_id))

  // Keep保存アイテム
  if (keepFolders && keepFolders.length > 0) {
    const folderIds = keepFolders.map((f) => f.id)
    const { data: keepItems } = await supabase
      .from('keep_folder_items')
      .select('item_id')
      .in('folder_id', folderIds)

    keepItems?.forEach((k) => knownIds.add(k.item_id))
  }

  return Array.from(knownIds)
}

// ========================================
// 戦略1: Item-Item 協調フィルタリング
// ========================================

/**
 * 「このアイテムをお気に入りした人は、他にこれもお気に入りしている」
 *
 * Step 1: ユーザーが好むアイテムを取得
 * Step 2: 同じアイテムを好む類似ユーザーを発見
 * Step 3: 類似ユーザーが好む未知のアイテムを候補に
 */
async function getItemCollabCandidates(
  userId: string,
  excludeIds: Set<string>
): Promise<RawCandidate[]> {
  const supabase = await createClient()

  // Step 1: ユーザーのお気に入りアイテムIDを取得
  const { data: userFavorites } = await supabase
    .from('item_favorites')
    .select('item_id')
    .eq('user_id', userId)

  if (!userFavorites || userFavorites.length === 0) return []

  const userItemIds = userFavorites.map((f) => f.item_id)

  // Step 2: 同じアイテムをお気に入りしている他のユーザーを取得
  const { data: coUsers } = await supabase
    .from('item_favorites')
    .select('user_id, item_id')
    .in('item_id', userItemIds)
    .neq('user_id', userId)

  if (!coUsers || coUsers.length === 0) return []

  // 類似ユーザーをカウント（共通アイテム数）
  const userOverlap = new Map<string, number>()
  for (const row of coUsers) {
    userOverlap.set(row.user_id, (userOverlap.get(row.user_id) || 0) + 1)
  }

  // 最低2つの共通アイテムを持つユーザーのみ（閾値）
  // ただしデータが少ない場合は1つでもOK
  const minOverlap = userItemIds.length >= 3 ? 2 : 1
  const similarUserIds = Array.from(userOverlap.entries())
    .filter(([, count]) => count >= minOverlap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 100)
    .map(([uid]) => uid)

  if (similarUserIds.length === 0) return []

  // Step 3: 類似ユーザーのお気に入りアイテムを取得
  const { data: candidateFavorites } = await supabase
    .from('item_favorites')
    .select('item_id, user_id')
    .in('user_id', similarUserIds)

  if (!candidateFavorites || candidateFavorites.length === 0) return []

  // 候補アイテムのスコア計算（共起ベース）
  const itemScores = new Map<string, { coOccurrence: number; weightedScore: number }>()
  for (const fav of candidateFavorites) {
    if (excludeIds.has(fav.item_id)) continue

    const overlap = userOverlap.get(fav.user_id) || 0
    const existing = itemScores.get(fav.item_id)
    if (existing) {
      existing.coOccurrence += 1
      existing.weightedScore += overlap
    } else {
      itemScores.set(fav.item_id, { coOccurrence: 1, weightedScore: overlap })
    }
  }

  // スコア上位500件のアイテムIDを取得
  const topItemEntries = Array.from(itemScores.entries())
    .sort(([, a], [, b]) => b.weightedScore - a.weightedScore)
    .slice(0, 500)

  if (topItemEntries.length === 0) return []

  const topItemIds = topItemEntries.map(([id]) => id)

  // アイテムのメタデータを一括取得（N+1回避）
  const { data: items } = await supabase
    .from('items')
    .select('id, name, image_url, shop_id, created_at, shops!items_shop_id_fkey(name, theme)')
    .in('id', topItemIds)

  if (!items) return []

  // メタデータマップ作成
  const itemMetaMap = new Map(
    items.map((item) => [
      item.id,
      {
        name: item.name,
        imageUrl: item.image_url,
        shopId: item.shop_id,
        shopName: (item.shops as unknown as { name: string; theme: string })?.name || '',
        shopTheme: (item.shops as unknown as { name: string; theme: string })?.theme || '',
        createdAt: item.created_at,
      },
    ])
  )

  return topItemEntries
    .map(([itemId, scores]) => {
      const meta = itemMetaMap.get(itemId)
      if (!meta) return null
      return {
        itemId,
        score: scores.weightedScore,
        ...meta,
      }
    })
    .filter((item): item is RawCandidate => item !== null)
}

// ========================================
// 戦略2: Shop-Based 拡張
// ========================================

/**
 * 「フォローしているショップの他のアイテム」
 */
async function getShopBasedCandidates(
  userId: string,
  excludeIds: Set<string>
): Promise<RawCandidate[]> {
  const supabase = await createClient()

  // フォロー中のショップを取得
  const { data: follows } = await supabase
    .from('shop_follows')
    .select('shop_id')
    .eq('user_id', userId)

  if (!follows || follows.length === 0) return []

  const shopIds = follows.map((f) => f.shop_id)

  // フォロー中ショップのアイテムを取得
  const { data: items } = await supabase
    .from('items')
    .select('id, name, image_url, shop_id, created_at, shops!items_shop_id_fkey(name, theme)')
    .in('shop_id', shopIds)

  if (!items) return []

  // 除外対象を除く
  const filteredItems = items.filter((item) => !excludeIds.has(item.id))

  if (filteredItems.length === 0) return []

  // 人気度を一括取得
  const itemIds = filteredItems.map((i) => i.id)
  const { data: favCounts } = await supabase
    .from('item_favorites')
    .select('item_id')
    .in('item_id', itemIds)

  const popularityMap = new Map<string, number>()
  favCounts?.forEach((f) => {
    popularityMap.set(f.item_id, (popularityMap.get(f.item_id) || 0) + 1)
  })

  return filteredItems
    .map((item) => {
      const popularity = popularityMap.get(item.id) || 0
      return {
        itemId: item.id,
        score: 50.0 + Math.log(1 + popularity) * 5,
        name: item.name,
        imageUrl: item.image_url,
        shopId: item.shop_id,
        shopName: (item.shops as unknown as { name: string; theme: string })?.name || '',
        shopTheme: (item.shops as unknown as { name: string; theme: string })?.theme || '',
        createdAt: item.created_at,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 300)
}

// ========================================
// 戦略3: User-Based 拡張
// ========================================

/**
 * 「フォローしているユーザーが所有するショップのアイテム」
 */
async function getUserBasedCandidates(
  userId: string,
  excludeIds: Set<string>
): Promise<RawCandidate[]> {
  const supabase = await createClient()

  // フォロー中のユーザーを取得
  const { data: follows } = await supabase
    .from('user_follows')
    .select('followee_id')
    .eq('follower_id', userId)

  if (!follows || follows.length === 0) return []

  const followeeIds = follows.map((f) => f.followee_id)

  // フォローユーザーのショップを取得
  const { data: shops } = await supabase
    .from('shops')
    .select('id')
    .in('owner_id', followeeIds)

  if (!shops || shops.length === 0) return []

  const shopIds = shops.map((s) => s.id)

  // ショップのアイテムを取得
  const { data: items } = await supabase
    .from('items')
    .select('id, name, image_url, shop_id, created_at, shops!items_shop_id_fkey(name, theme)')
    .in('shop_id', shopIds)

  if (!items) return []

  // 除外対象を除く
  const filteredItems = items.filter((item) => !excludeIds.has(item.id))

  if (filteredItems.length === 0) return []

  // 人気度を一括取得
  const itemIds = filteredItems.map((i) => i.id)
  const { data: favCounts } = await supabase
    .from('item_favorites')
    .select('item_id')
    .in('item_id', itemIds)

  const popularityMap = new Map<string, number>()
  favCounts?.forEach((f) => {
    popularityMap.set(f.item_id, (popularityMap.get(f.item_id) || 0) + 1)
  })

  return filteredItems
    .map((item) => {
      const popularity = popularityMap.get(item.id) || 0
      return {
        itemId: item.id,
        score: 40.0 + Math.log(1 + popularity) * 3,
        name: item.name,
        imageUrl: item.image_url,
        shopId: item.shop_id,
        shopName: (item.shops as unknown as { name: string; theme: string })?.name || '',
        shopTheme: (item.shops as unknown as { name: string; theme: string })?.theme || '',
        createdAt: item.created_at,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 300)
}

// ========================================
// コールドスタート: 人気アイテム
// ========================================

/**
 * 行動履歴がないユーザー向けのレコメンド
 * 全体で人気のアイテム + 新着アイテムを返す
 */
export async function getColdStartRecommendations(
  limit: number = 50
): Promise<CandidateItem[]> {
  const supabase = await createClient()

  // 90日以内のアイテムを取得
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const { data: items } = await supabase
    .from('items')
    .select('id, name, image_url, shop_id, created_at, shops!items_shop_id_fkey(name, theme)')
    .gte('created_at', ninetyDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  if (!items || items.length === 0) {
    // 90日以内がなければ全アイテムから取得
    const { data: allItems } = await supabase
      .from('items')
      .select('id, name, image_url, shop_id, created_at, shops!items_shop_id_fkey(name, theme)')
      .order('created_at', { ascending: false })
      .limit(limit * 2)

    if (!allItems || allItems.length === 0) return []

    return processItemsForColdStart(supabase, allItems, limit)
  }

  return processItemsForColdStart(supabase, items, limit)
}

async function processItemsForColdStart(
  supabase: Awaited<ReturnType<typeof createClient>>,
  items: Array<{
    id: string
    name: string
    image_url: string | null
    shop_id: string
    created_at: string
    shops: unknown
  }>,
  limit: number
): Promise<CandidateItem[]> {
  const itemIds = items.map((i) => i.id)

  // 人気度を一括取得
  const [{ data: favCounts }, { data: keepCounts }] = await Promise.all([
    supabase.from('item_favorites').select('item_id').in('item_id', itemIds),
    supabase.from('keep_folder_items').select('item_id').in('item_id', itemIds),
  ])

  const favMap = new Map<string, number>()
  favCounts?.forEach((f) => {
    favMap.set(f.item_id, (favMap.get(f.item_id) || 0) + 1)
  })

  const keepMap = new Map<string, number>()
  keepCounts?.forEach((k) => {
    keepMap.set(k.item_id, (keepMap.get(k.item_id) || 0) + 1)
  })

  return items
    .map((item) => {
      const favCount = favMap.get(item.id) || 0
      const keepCount = keepMap.get(item.id) || 0
      const popularityScore = favCount * 2 + keepCount * 3

      return {
        itemId: item.id,
        totalScore: Math.log(1 + popularityScore) + 1, // 最低スコア1を保証
        sourceDiversity: 1,
        sources: ['item_collab' as CandidateSource], // コールドスタートのソース
        name: item.name,
        imageUrl: item.image_url,
        shopId: item.shop_id,
        shopName: (item.shops as unknown as { name: string; theme: string })?.name || '',
        shopTheme: (item.shops as unknown as { name: string; theme: string })?.theme || '',
        createdAt: item.created_at,
      }
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit)
}

