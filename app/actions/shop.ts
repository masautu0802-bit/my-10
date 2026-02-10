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

export async function uploadAvatar(file: File) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    return { error: uploadError.message }
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(filePath)

  return { url: publicUrl }
}

export async function updateProfile(formData: {
  name: string
  bio?: string
  avatar_url?: string | null
}) {
  const user = await requireAuth()
  const supabase = await createClient()

  const updateData: {
    name: string
    bio?: string | null
    avatar_url?: string | null
  } = {
    name: formData.name,
  }

  if (formData.bio !== undefined) {
    updateData.bio = formData.bio || null
  }

  if (formData.avatar_url !== undefined) {
    updateData.avatar_url = formData.avatar_url
  }

  const { error } = await supabase.from('users').update(updateData).eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/my')
  revalidatePath('/my/profile')
  revalidatePath(`/users/${user.id}`)
  return {}
}

export async function createShop(formData: {
  name: string
  theme: string
  description?: string
  tags?: string[]
  font_family?: string
  color_theme?: {
    primary: string
    secondary: string
    tertiary: string
    quaternary: string
    isDark?: boolean
  }
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
      font_family: formData.font_family,
      color_theme: formData.color_theme,
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

export async function updateShop(
  shopId: string,
  formData: {
    name: string
    description?: string
    tags?: string[]
  }
) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Check ownership
  const { data: shop } = await supabase
    .from('shops')
    .select('owner_id')
    .eq('id', shopId)
    .single()

  if (!shop || shop.owner_id !== user.id) {
    return { error: 'このショップを編集する権限がありません' }
  }

  // Validate tags (max 3)
  if (formData.tags && formData.tags.length > 3) {
    return { error: 'タグは最大3つまでです' }
  }

  // Update shop
  const { error } = await supabase
    .from('shops')
    .update({
      name: formData.name,
      description: formData.description || null,
      tags: formData.tags || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', shopId)

  if (error) {
    return { error: error.message }
  }

  // Revalidate all related paths
  revalidatePath(`/cms/shops/${shopId}`)
  revalidatePath(`/shops/${shopId}`)
  revalidatePath('/shop')
  revalidatePath('/my')
  revalidatePath('/')

  return { success: true }
}

export async function deleteShop(shopId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Check ownership
  const { data: shop } = await supabase
    .from('shops')
    .select('owner_id')
    .eq('id', shopId)
    .single()

  if (!shop || shop.owner_id !== user.id) {
    return { error: 'このショップを削除する権限がありません' }
  }

  // Get all items for this shop
  const { data: items } = await supabase
    .from('items')
    .select('id')
    .eq('shop_id', shopId)

  const itemIds = items?.map((item) => item.id) || []

  // Delete in order (foreign key constraints)
  // 1. Delete item_favorites (references items)
  if (itemIds.length > 0) {
    await supabase.from('item_favorites').delete().in('item_id', itemIds)
  }

  // 2. Delete items (references shops)
  await supabase.from('items').delete().eq('shop_id', shopId)

  // 3. Delete shop_follows (references shops)
  await supabase.from('shop_follows').delete().eq('shop_id', shopId)

  // 4. Delete shop
  const { error } = await supabase.from('shops').delete().eq('id', shopId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/shop')
  revalidatePath('/my')
  revalidatePath('/')
  return { success: true }
}
