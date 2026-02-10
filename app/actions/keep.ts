'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/lib/supabase/server'
import { requireAuth } from '@/app/lib/auth/session'

export async function createKeepFolder(name: string, itemId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: folder, error } = await supabase
    .from('keep_folders')
    .insert({ user_id: user.id, name })
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  const { error: itemError } = await supabase
    .from('keep_folder_items')
    .insert({ folder_id: folder.id, item_id: itemId })

  if (itemError) {
    return { error: itemError.message }
  }

  revalidatePath('/my')
  return { folderId: folder.id }
}

export async function addItemToKeepFolder(folderId: string, itemId: string) {
  await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('keep_folder_items')
    .insert({ folder_id: folderId, item_id: itemId })

  if (error) {
    if (error.code === '23505') {
      return { error: 'この商品は既にフォルダに追加されています' }
    }
    return { error: error.message }
  }

  revalidatePath('/my')
  revalidatePath(`/my/keep/${folderId}`)
  return {}
}

export async function removeItemFromKeepFolder(folderId: string, itemId: string) {
  await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('keep_folder_items')
    .delete()
    .eq('folder_id', folderId)
    .eq('item_id', itemId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/my')
  revalidatePath(`/my/keep/${folderId}`)
  return {}
}

export async function deleteKeepFolder(folderId: string) {
  await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('keep_folders')
    .delete()
    .eq('id', folderId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/my')
  return {}
}

export async function renameKeepFolder(folderId: string, name: string) {
  await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('keep_folders')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', folderId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/my')
  revalidatePath(`/my/keep/${folderId}`)
  return {}
}
