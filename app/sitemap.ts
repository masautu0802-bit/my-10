import type { MetadataRoute } from 'next'
import { createClient } from '@/app/lib/supabase/server'

const BASE_URL = 'https://my-10.com'

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL
  if (url) return url.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return BASE_URL
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  try {
    const supabase = await createClient()

    const [shopsRes, itemsRes, usersRes] = await Promise.all([
      supabase.from('shops').select('id, updated_at').order('updated_at', { ascending: false }),
      supabase.from('items').select('id, updated_at').order('updated_at', { ascending: false }),
      supabase.from('users').select('id, updated_at').order('updated_at', { ascending: false }),
    ])

    const shopEntries: MetadataRoute.Sitemap = (shopsRes.data ?? []).map((row) => ({
      url: `${baseUrl}/shops/${row.id}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const itemEntries: MetadataRoute.Sitemap = (itemsRes.data ?? []).map((row) => ({
      url: `${baseUrl}/items/${row.id}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    const userEntries: MetadataRoute.Sitemap = (usersRes.data ?? []).map((row) => ({
      url: `${baseUrl}/users/${row.id}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...shopEntries, ...itemEntries, ...userEntries]
  } catch {
    return staticPages
  }
}
