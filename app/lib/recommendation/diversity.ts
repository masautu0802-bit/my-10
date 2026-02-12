/**
 * 多様性制御 (Diversity Control)
 *
 * 同一ショップのアイテムが連続しないようにし、
 * 多様なショップからのレコメンドを保証する。
 *
 * 設計書: Docs/recommendation-system-design.md Section 4.1 因子4
 */

import type { RecommendedItem, DiversityOptions } from './types'

/**
 * 多様性制約を適用してレコメンドリストを再配置
 *
 * 1. 同一ショップからの最大アイテム数を制限
 * 2. 同一ショップの連続配置を禁止
 * 3. スキップされたアイテムは後方に再配置を試みる
 */
export function applyDiversityConstraints(
  items: RecommendedItem[],
  options: DiversityOptions
): RecommendedItem[] {
  const { maxItemsPerShop, noConsecutiveShops } = options

  const result: RecommendedItem[] = []
  const deferred: RecommendedItem[] = [] // 一旦スキップしたアイテム
  const shopItemCount = new Map<string, number>()
  let lastShopId: string | null = null

  // 第1パス: メインの配置
  for (const item of items) {
    const currentCount = shopItemCount.get(item.shopId) || 0

    // 同一ショップの最大数チェック
    if (currentCount >= maxItemsPerShop) {
      continue // 完全にスキップ（再配置もしない）
    }

    // 連続配置チェック
    if (noConsecutiveShops && lastShopId === item.shopId) {
      deferred.push(item)
      continue
    }

    result.push(item)
    shopItemCount.set(item.shopId, currentCount + 1)
    lastShopId = item.shopId
  }

  // 第2パス: スキップしたアイテムを隙間に挿入
  if (deferred.length > 0) {
    for (const item of deferred) {
      const currentCount = shopItemCount.get(item.shopId) || 0
      if (currentCount >= maxItemsPerShop) continue

      // 挿入可能な位置を探す
      let inserted = false
      for (let i = 0; i < result.length; i++) {
        const prevShopId = i > 0 ? result[i - 1].shopId : null
        const nextShopId = result[i].shopId

        // 前後のショップと異なる位置に挿入
        if (prevShopId !== item.shopId && nextShopId !== item.shopId) {
          result.splice(i, 0, item)
          shopItemCount.set(item.shopId, currentCount + 1)
          inserted = true
          break
        }
      }

      // 挿入位置が見つからなければ末尾に追加
      if (!inserted) {
        const lastItem = result[result.length - 1]
        if (!lastItem || lastItem.shopId !== item.shopId) {
          result.push(item)
          shopItemCount.set(item.shopId, currentCount + 1)
        }
      }
    }
  }

  return result
}

