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

  if (!shops) return []

  const tagCounts: Record<string, number> = {}
  shops.forEach((shop) => {
    shop.tags?.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([tag]) => tag)

  // For each tag, get the shop with most followers and its first item
  const tagsWithImages = await Promise.all(
    topTags.map(async (tag) => {
      // Get shops with this tag
      const { data: taggedShops } = await supabase
        .from('shops')
        .select('id')
        .contains('tags', [tag])

      if (!taggedShops || taggedShops.length === 0) {
        return { tag, imageUrl: null }
      }

      const shopIds = taggedShops.map((s) => s.id)

      // Get follower counts for these shops
      const { data: followCounts } = await supabase
        .from('shop_follows')
        .select('shop_id')
        .in('shop_id', shopIds)

      const countMap: Record<string, number> = {}
      followCounts?.forEach((f) => {
        countMap[f.shop_id] = (countMap[f.shop_id] || 0) + 1
      })

      // Find shop with most followers
      const topShopId =
        shopIds.length === 1
          ? shopIds[0]
          : shopIds.reduce((a, b) => ((countMap[a] || 0) > (countMap[b] || 0) ? a : b))

      // Get first item from that shop
      const { data: items } = await supabase
        .from('items')
        .select('image_url')
        .eq('shop_id', topShopId)
        .order('order_index', { ascending: true })
        .limit(1)

      return {
        tag,
        imageUrl: items?.[0]?.image_url || null,
      }
    })
  )

  return tagsWithImages
}
