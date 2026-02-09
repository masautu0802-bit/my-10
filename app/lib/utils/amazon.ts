/**
 * Amazon商品URLから画像URL、タイトル、価格を取得する
 * 部分的な取得成功にも対応（画像・タイトル・価格それぞれ独立）
 */

export type AmazonProductResult = {
  imageUrl?: string;
  title?: string;
  price?: string;
  error?: string;
};

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 2
): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // 500系エラーならリトライ
      if (res.status >= 500 && i < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
    }
  }
  throw lastError;
}

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
];

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function fetchAmazonProductImage(
  amazonUrl: string
): Promise<AmazonProductResult | { error: string }> {
  try {
    // URLの検証
    let url: URL;
    try {
      url = new URL(amazonUrl);
    } catch {
      return { error: "無効なURLです。正しいURLを入力してください" };
    }

    const isAmazonDomain = url.hostname.includes("amazon.co.jp") || url.hostname.includes("amazon.com");
    const isShortLink = url.hostname === "amzn.to" || url.hostname === "amzn.asia";

    if (!isAmazonDomain && !isShortLink) {
      return { error: "Amazon URLを入力してください（amazon.co.jp、amazon.com、amzn.to、amzn.asia）" };
    }

    const ua = getRandomUA();

    // 短縮URLの場合はリダイレクト先を取得
    if (isShortLink) {
      try {
        const redirectRes = await fetchWithRetry(amazonUrl, {
          redirect: "manual",
          headers: { "User-Agent": ua },
        }, 1);

        const location = redirectRes.headers.get("location");
        if (!location) {
          return { error: "短縮URLのリダイレクト先を取得できませんでした" };
        }

        amazonUrl = location;
        url = new URL(amazonUrl);

        if (!url.hostname.includes("amazon.co.jp") && !url.hostname.includes("amazon.com")) {
          return { error: "このリンクはAmazonの商品ページではありません" };
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return { error: "タイムアウト: 短縮URLの解決に時間がかかりすぎました" };
        }
        return { error: `短縮URLの解決に失敗しました: ${err instanceof Error ? err.message : "不明なエラー"}` };
      }
    }

    // URLをクリーンアップ（不要なパラメータを除去してシンプルにする）
    const cleanUrl = cleanAmazonUrl(amazonUrl);

    let response: Response;
    try {
      response = await fetchWithRetry(cleanUrl, {
        headers: {
          "User-Agent": ua,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
        },
      }, 2);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return { error: "タイムアウト: Amazonへの接続に時間がかかりすぎました" };
      }
      return { error: `ネットワークエラー: ${err instanceof Error ? err.message : "接続に失敗しました"}` };
    }

    if (!response.ok) {
      const statusMessages: Record<number, string> = {
        403: "アクセスが拒否されました（Bot検出の可能性）",
        404: "商品ページが見つかりません",
        503: "Amazonのサービスが一時的に利用不可",
      };
      return { error: `HTTPエラー ${response.status}: ${statusMessages[response.status] || "商品ページの取得に失敗しました"}` };
    }

    const html = await response.text();

    // Bot検出ページのチェック
    if (html.includes("To discuss automated access to Amazon data") || html.includes("api-services-support@amazon.com")) {
      return { error: "Amazonのボット検出に引っかかりました。しばらく待ってから再試行してください" };
    }

    // 各情報を独立して取得
    const imageUrl = extractImageUrl(html);
    const title = extractTitle(html);
    const price = extractPrice(html);

    // 全て取得できなかった場合のみエラー
    if (!imageUrl && !title && !price) {
      return { error: "商品情報を取得できませんでした。URLが正しいか確認してください" };
    }

    // 部分的にでも取得できたら成功として返す
    return {
      imageUrl: imageUrl || undefined,
      title: title || undefined,
      price: price || undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "不明なエラー";
    console.error("Amazon商品情報取得エラー:", message);
    return { error: `URLの解析に失敗しました: ${message}` };
  }
}

/** URLをクリーンアップしてシンプルなAmazon商品URLにする */
function cleanAmazonUrl(amazonUrl: string): string {
  try {
    const url = new URL(amazonUrl);
    // /dp/ASIN パターンを抽出
    const dpMatch = amazonUrl.match(/\/dp\/([A-Z0-9]{10})/);
    if (dpMatch) {
      return `${url.origin}/dp/${dpMatch[1]}`;
    }
    // /gp/product/ASIN パターン
    const gpMatch = amazonUrl.match(/\/gp\/product\/([A-Z0-9]{10})/);
    if (gpMatch) {
      return `${url.origin}/dp/${gpMatch[1]}`;
    }
    return amazonUrl;
  } catch {
    return amazonUrl;
  }
}

/** 画像URLを抽出 */
function extractImageUrl(html: string): string {
  // パターン1: landingImage hiRes
  const landingImageMatch = html.match(
    /"landingImage"[^{]*"hiRes":"([^"]+)"/
  );
  if (landingImageMatch) return cleanImageUrl(landingImageMatch[1]);

  // パターン2: colorImages initial large
  const mainImageMatch = html.match(/"large":"([^"]+)"/);
  if (mainImageMatch) return cleanImageUrl(mainImageMatch[1]);

  // パターン3: imgタグから直接取得
  const imgMatch = html.match(
    /<img[^>]+id="landingImage"[^>]+src="([^"]+)"/
  );
  if (imgMatch) return cleanImageUrl(imgMatch[1]);

  // パターン4: data-old-hires属性
  const hiresMatch = html.match(/data-old-hires="([^"]+)"/);
  if (hiresMatch) return cleanImageUrl(hiresMatch[1]);

  // パターン5: mainImageWidget
  const widgetMatch = html.match(/"mainUrl":"([^"]+)"/);
  if (widgetMatch) return cleanImageUrl(widgetMatch[1]);

  // パターン6: imageGalleryData
  const galleryMatch = html.match(/"imageGalleryData"[\s\S]*?"mainUrl"\s*:\s*"([^"]+)"/);
  if (galleryMatch) return cleanImageUrl(galleryMatch[1]);

  // パターン7: og:image メタタグ
  const ogImageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/);
  if (ogImageMatch) return cleanImageUrl(ogImageMatch[1]);

  return "";
}

/** 画像URLのクリーニング */
function cleanImageUrl(url: string): string {
  return url.replace(/\._[A-Z0-9,_]+_\./, ".");
}

/** 商品タイトルを抽出 */
function extractTitle(html: string): string {
  // パターン1: productTitle span
  const titleMatch = html.match(
    /<span[^>]+id="productTitle"[^>]*>([^<]+)</
  );
  if (titleMatch) return titleMatch[1].trim();

  // パターン2: og:title メタタグ
  const ogTitleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/);
  if (ogTitleMatch) return ogTitleMatch[1].trim();

  // パターン3: title タグ
  const pageTitleMatch = html.match(/<title>([^<]+)<\/title>/);
  if (pageTitleMatch) {
    const cleaned = pageTitleMatch[1].replace(/\s*Amazon.*$/, "").replace(/\s*\|.*$/, "").trim();
    if (cleaned) return cleaned;
  }

  return "";
}

/** 価格を抽出 */
function extractPrice(html: string): string {
  let price = "";

  // パターン1: a-price-whole
  const priceWholeMatch = html.match(
    /<span class="a-price-whole">([^<]+)<\/span>/
  );
  if (priceWholeMatch) {
    price = priceWholeMatch[1].replace(/[,.\s]/g, "").trim();
  }

  // パターン2: apexPriceToPay
  if (!price) {
    const apexMatch = html.match(
      /apexPriceToPay[^>]*>[\s\S]*?<span[^>]*>([¥$€£]?[\d,]+)/
    );
    if (apexMatch) {
      price = apexMatch[1].replace(/[,\s]/g, "").trim();
    }
  }

  // パターン3: a-price span 構造
  if (!price) {
    const priceSpanMatch = html.match(
      /<span class="a-price[^"]*"[^>]*>\s*<span[^>]*class="a-offscreen"[^>]*>([¥$€£]?[\d,]+)/
    );
    if (priceSpanMatch) {
      price = priceSpanMatch[1].replace(/[,\s]/g, "").trim();
    }
  }

  // パターン4: priceblock_ourprice / priceblock_dealprice
  if (!price) {
    const priceBlockMatch = html.match(
      /<span[^>]+id="priceblock_(?:ourprice|dealprice)"[^>]*>([^<]+)</
    );
    if (priceBlockMatch) {
      price = priceBlockMatch[1].replace(/[,\s]/g, "").trim();
    }
  }

  // パターン5: corePriceDisplay
  if (!price) {
    const corePriceMatch = html.match(
      /corePriceDisplay[^>]*>[\s\S]*?<span class="a-offscreen">([¥$€£]?[\d,]+)/
    );
    if (corePriceMatch) {
      price = corePriceMatch[1].replace(/[,\s]/g, "").trim();
    }
  }

  // パターン6: JSON-LDからの価格取得
  if (!price) {
    const jsonLdMatch = html.match(
      /"price"\s*:\s*"?(\d[\d,.]*)"?/
    );
    if (jsonLdMatch) {
      price = jsonLdMatch[1].replace(/[,\s]/g, "").trim();
    }
  }

  // パターン7: data-a-color="price"
  if (!price) {
    const priceColorMatch = html.match(
      /data-a-color="price"[^>]*>[\s\S]*?([¥$€£]?[\d,]+)/
    );
    if (priceColorMatch) {
      price = priceColorMatch[1].replace(/[,\s]/g, "").trim();
    }
  }

  // パターン8: a-offscreen内の¥表記
  if (!price) {
    const offscreenMatch = html.match(
      /<span class="a-offscreen">\s*[¥￥]([,\d]+)/
    );
    if (offscreenMatch) {
      price = offscreenMatch[1].replace(/[,\s]/g, "").trim();
    }
  }

  // 価格のフォーマット（¥記号がない場合は追加）
  if (price && !price.startsWith("¥") && !price.startsWith("$") && !price.startsWith("€") && !price.startsWith("£")) {
    price = `¥${price}`;
  }

  return price;
}
