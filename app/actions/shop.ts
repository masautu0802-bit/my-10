'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/lib/supabase/server'
import { requireAuth } from '@/app/lib/auth/session'

export async function toggleShopFollow(shopId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('shop_follows')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('shop_id', shopId)
    .single()

  if (existing) {
    await supabase
      .from('shop_follows')
      .delete()
      .eq('user_id', user.id)
      .eq('shop_id', shopId)
  } else {
    await supabase
      .from('shop_follows')
      .insert({ user_id: user.id, shop_id: shopId })
  }

  revalidatePath(`/shops/${shopId}`)
  revalidatePath('/my')
  revalidatePath('/')
}

export async function toggleItemFavorite(itemId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('item_favorites')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('item_id', itemId)
    .single()

  if (existing) {
    await supabase
      .from('item_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('item_id', itemId)
  } else {
    await supabase
      .from('item_favorites')
      .insert({ user_id: user.id, item_id: itemId })
  }

  revalidatePath(`/items/${itemId}`)
  revalidatePath('/my')
}

export async function updateProfile(formData: {
  name: string
  bio?: string
}) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({ name: formData.name })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/my')
  revalidatePath('/my/profile')
  return {}
}

export async function createShop(formData: {
  name: string
  theme: string
  description?: string
  tags?: string[]
}) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Validate tags (max 3)
  if (formData.tags && formData.tags.length > 3) {
    return { error: 'タグは最大3つまでです' }
  }

  const { data: shop, error } = await supabase
    .from('shops')
    .insert({
      name: formData.name,
      theme: formData.theme,
      description: formData.description,
      tags: formData.tags,
      owner_id: user.id,
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/shop')
  revalidatePath('/my')
  revalidatePath('/')
  return { shopId: shop.id }
}
