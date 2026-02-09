'use server'

import { createClient } from '@/app/lib/supabase/server'

export type SearchResult = {
  byShopName: Array<{
    id: string
    name: string
    owner_name: string
    tags: string[] | null
    item_count: number
  }>
  byUserName: Array<{
    id: string
    name: string
    owner_name: string
    tags: string[] | null
    item_count: number
  }>
  byTag: Array<{
    id: string
    name: string
    owner_name: string
    tags: string[] | null
    item_count: number
  }>
  byItemName: Array<{
    shop_id: string
    shop_name: string
    owner_name: string
    item_name: string
    item_image: string | null
  }>
}

export async function searchShops(query: string): Promise<SearchResult> {
  const supabase = await createClient()
  const trimmedQuery = query.trim().toLowerCase()

  if (!trimmedQuery) {
    return { byShopName: [], byUserName: [], byTag: [], byItemName: [] }
  }

  // Get all shops with related data
  const { data: shops } = await supabase
    .from('shops')
    .select(`
      id,
      name,
      tags,
      owner_id,
      users!shops_owner_id_fkey ( name )
    `)

  if (!shops) {
    return { byShopName: [], byUserName: [], byTag: [], byItemName: [] }
  }

  const shopIds = shops.map((s) => s.id)

  // Get item counts for all shops
  const { data: items } = await supabase
    .from('items')
    .select('shop_id, name, image_url')
    .in('shop_id', shopIds)

  const itemCountMap: Record<string, number> = {}
  shops.forEach((shop) => {
    itemCountMap[shop.id] = 0
  })
  items?.forEach((item) => {
    itemCountMap[item.shop_id] = (itemCountMap[item.shop_id] || 0) + 1
  })

  // Search by shop name
  const byShopName = shops
    .filter((shop) => shop.name.toLowerCase().includes(trimmedQuery))
    .map((shop) => ({
      id: shop.id,
      name: shop.name,
      owner_name: (shop.users as unknown as { name: string })?.name || '不明',
      tags: shop.tags,
      item_count: itemCountMap[shop.id] || 0,
    }))

  // Search by user name
  const byUserName = shops
    .filter((shop) => {
      const ownerName = (shop.users as unknown as { name: string })?.name || ''
      return ownerName.toLowerCase().includes(trimmedQuery)
    })
    .map((shop) => ({
      id: shop.id,
      name: shop.name,
      owner_name: (shop.users as unknown as { name: string })?.name || '不明',
      tags: shop.tags,
      item_count: itemCountMap[shop.id] || 0,
    }))

  // Search by tag
  const byTag = shops
    .filter((shop) => {
      return shop.tags?.some((tag) => tag.toLowerCase().includes(trimmedQuery))
    })
    .map((shop) => ({
      id: shop.id,
      name: shop.name,
      owner_name: (shop.users as unknown as { name: string })?.name || '不明',
      tags: shop.tags,
      item_count: itemCountMap[shop.id] || 0,
    }))

  // Search by item name
  const byItemName =
    items
      ?.filter((item) => item.name.toLowerCase().includes(trimmedQuery))
      .map((item) => {
        const shop = shops.find((s) => s.id === item.shop_id)
        return {
          shop_id: item.shop_id,
          shop_name: shop?.name || '不明',
          owner_name: (shop?.users as unknown as { name: string })?.name || '不明',
          item_name: item.name,
          item_image: item.image_url,
        }
      }) || []

  return { byShopName, byUserName, byTag, byItemName }
}

export async function getPopularTags() {
  const supabase = await createClient()

  const { data: shops } = await supabase
    .from('shops')
    .select('id, tags')
    .not('tags', 'is', null)

  if (!shops || shops.length === 0) return []

  // Count tag occurrences and build tag->shopIds mapping
  const tagCounts: Record<string, number> = {}
  const tagShopIds: Record<string, string[]> = {}
  shops.forEach((shop) => {
    shop.tags?.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
      if (!tagShopIds[tag]) tagShopIds[tag] = []
      tagShopIds[tag].push(shop.id)
    })
  })

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([tag]) => tag)

  if (topTags.length === 0) return []

  // Collect all relevant shop IDs
  const allShopIds = [...new Set(topTags.flatMap((tag) => tagShopIds[tag] || []))]

  // Batch: get all follows and items in 2 queries
  const [{ data: allFollows }, { data: allItems }] = await Promise.all([
    supabase.from('shop_follows').select('shop_id').in('shop_id', allShopIds),
    supabase.from('items').select('shop_id, image_url, order_index').in('shop_id', allShopIds).order('order_index', { ascending: true }),
  ])

  // Build follower count map
  const followerCountMap: Record<string, number> = {}
  allFollows?.forEach((f) => {
    followerCountMap[f.shop_id] = (followerCountMap[f.shop_id] || 0) + 1
  })

  // Build first item image map
  const firstItemImageMap: Record<string, string | null> = {}
  allItems?.forEach((item) => {
    if (!(item.shop_id in firstItemImageMap)) {
      firstItemImageMap[item.shop_id] = item.image_url
    }
  })

  // Compute in JS
  return topTags.map((tag) => {
    const shopIds = tagShopIds[tag] || []
    if (shopIds.length === 0) {
      return { tag, imageUrl: null }
    }

    const topShopId = shopIds.reduce((a, b) =>
      (followerCountMap[a] || 0) >= (followerCountMap[b] || 0) ? a : b
    )

    return {
      tag,
      imageUrl: firstItemImageMap[topShopId] || null,
    }
  })
}
