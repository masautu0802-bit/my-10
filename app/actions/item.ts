'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/lib/supabase/server'
import { requireAuth } from '@/app/lib/auth/session'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadItemImage(formData: FormData) {
  const user = await requireAuth()
  const supabase = await createClient()

  const file = formData.get('file') as File | null
  if (!file) {
    return { error: 'ファイルが選択されていません' }
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { error: '対応していないファイル形式です（JPEG, PNG, WebP, SVG のみ）' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'ファイルサイズが5MBを超えています' }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('item-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    return { error: uploadError.message }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('item-images').getPublicUrl(fileName)

  return { url: publicUrl }
}

export async function createItem(formData: {
  shopId: string
  name: string
  ecUrl?: string
  imageUrl?: string
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
      name: formData.name,
      ec_url: formData.ecUrl || null,
      image_url: formData.imageUrl || null,
      price_range: formData.priceRange || null,
      comment: formData.comment || null,
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

export async function updateItem(
  itemId: string,
  formData: {
    name: string
    ecUrl?: string
    imageUrl?: string
    priceRange?: string
    comment?: string
  }
) {
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

  // アイテムを更新
  const { error } = await supabase
    .from('items')
    .update({
      name: formData.name,
      ec_url: formData.ecUrl || null,
      image_url: formData.imageUrl || null,
      price_range: formData.priceRange || null,
      comment: formData.comment || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)

  if (error) {
    console.error('アイテム更新エラー:', error)
    return { error: 'アイテムの更新に失敗しました' }
  }

  revalidatePath(`/cms/shops/${item.shop_id}`)
  revalidatePath(`/shops/${item.shop_id}`)
  revalidatePath('/')
  return { success: true }
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

  await Promise.all(
    updates.map((update) =>
      supabase
        .from('items')
        .update({ order_index: update.order_index })
        .eq('id', update.id)
        .eq('shop_id', shopId)
    )
  )

  revalidatePath(`/cms/shops/${shopId}`)
  revalidatePath(`/shops/${shopId}`)
  revalidatePath('/')
  return {}
}
