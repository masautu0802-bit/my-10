'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/lib/supabase/server'
import { requireAuth } from '@/app/lib/auth/session'
import { fetchAmazonProductImage as fetchImageUtil } from '@/app/lib/utils/amazon'

export async function fetchAmazonProductImage(amazonUrl: string) {
  await requireAuth() // 認証チェック
  return fetchImageUtil(amazonUrl)
}

export async function createItem(formData: {
  shopId: string
  amazonUrl: string
  name?: string
  priceRange?: string
  comment?: string
}) {
  const user = await requireAuth()
  const supabase = await createClient()

  // ショップのオーナーシップを確認
  const { data: shop } = await supabase
    .from('shops')
    .select('owner_id')
    .eq('id', formData.shopId)
    .single()

  if (!shop || shop.owner_id !== user.id) {
    return { error: '権限がありません' }
  }

  // 既存のアイテム数を確認（最大10個）
  const { count } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', formData.shopId)

  if (count && count >= 10) {
    return { error: 'アイテムは最大10個までです' }
  }

  // Amazon URLから画像とタイトルを取得
  const amazonData = await fetchImageUtil(formData.amazonUrl)

  if ('error' in amazonData) {
    return { error: amazonData.error }
  }

  // 次のorder_indexを取得
  const { data: maxOrderItem } = await supabase
    .from('items')
    .select('order_index')
    .eq('shop_id', formData.shopId)
    .order('order_index', { ascending: false })
    .limit(1)
    .single()

  const nextOrderIndex = maxOrderItem ? maxOrderItem.order_index + 1 : 0

  // アイテムを作成
  const { data: item, error } = await supabase
    .from('items')
    .insert({
      shop_id: formData.shopId,
      name: formData.name || amazonData.title || '商品名未設定',
      ec_url: formData.amazonUrl,
      image_url: amazonData.imageUrl,
      price_range: formData.priceRange || amazonData.price || null,
      comment: formData.comment,
      order_index: nextOrderIndex,
    })
    .select('id')
    .single()

  if (error) {
    console.error('アイテム作成エラー:', error)
    return { error: 'アイテムの作成に失敗しました' }
  }

  revalidatePath(`/cms/shops/${formData.shopId}`)
  revalidatePath(`/shops/${formData.shopId}`)
  revalidatePath('/')
  return { itemId: item.id }
}

export async function deleteItem(itemId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  // アイテムの所属ショップのオーナーシップを確認
  const { data: item } = await supabase
    .from('items')
    .select('shop_id, shops!inner(owner_id)')
    .eq('id', itemId)
    .single()

  if (!item) {
    return { error: 'アイテムが見つかりません' }
  }

  const shop = item.shops as unknown as { owner_id: string }
  if (shop.owner_id !== user.id) {
    return { error: '権限がありません' }
  }

  const { error } = await supabase.from('items').delete().eq('id', itemId)

  if (error) {
    return { error: 'アイテムの削除に失敗しました' }
  }

  revalidatePath(`/cms/shops/${item.shop_id}`)
  revalidatePath(`/shops/${item.shop_id}`)
  revalidatePath('/')
  return {}
}

export async function reorderItems(shopId: string, itemIds: string[]) {
  const user = await requireAuth()
  const supabase = await createClient()

  // ショップのオーナーシップを確認
  const { data: shop } = await supabase
    .from('shops')
    .select('owner_id')
    .eq('id', shopId)
    .single()

  if (!shop || shop.owner_id !== user.id) {
    return { error: '権限がありません' }
  }

  // 各アイテムのorder_indexを更新
  const updates = itemIds.map((itemId, index) => ({
    id: itemId,
    order_index: index,
  }))

  for (const update of updates) {
    await supabase
      .from('items')
      .update({ order_index: update.order_index })
      .eq('id', update.id)
      .eq('shop_id', shopId)
  }

  revalidatePath(`/cms/shops/${shopId}`)
  revalidatePath(`/shops/${shopId}`)
  revalidatePath('/')
  return {}
}

export async function updateItemPrice(itemId: string) {
  const supabase = await createClient()

  // アイテム情報を取得
  const { data: item } = await supabase
    .from('items')
    .select('ec_url, shop_id')
    .eq('id', itemId)
    .single()

  if (!item || !item.ec_url) {
    return { error: 'アイテムまたはURLが見つかりません' }
  }

  // Amazon URLから価格を取得
  const amazonData = await fetchImageUtil(item.ec_url)

  if ('error' in amazonData) {
    return { error: `価格取得失敗: ${amazonData.error}` }
  }

  if (!amazonData.price) {
    return { error: '価格情報が見つかりませんでした（在庫切れまたは価格非表示の可能性があります）' }
  }

  // 価格を更新
  const { error } = await supabase
    .from('items')
    .update({ price_range: amazonData.price })
    .eq('id', itemId)

  if (error) {
    return { error: `DB更新エラー: ${error.message}` }
  }

  revalidatePath(`/items/${itemId}`)
  revalidatePath(`/shops/${item.shop_id}`)
  revalidatePath('/')
  return { price: amazonData.price }
}
