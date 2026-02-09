/**
 * Amazon商品URLから画像URL、タイトル、価格を取得する
 * 部分的な取得成功にも対応（画像・タイトル・価格それぞれ独立）
 *
 * 戦略:
 *  1. 通常のページスクレイピング
 *  2. 失敗時 → ASINから画像URLを直接構築 + OEmbed/OGPフォールバック
 */

export type AmazonProductResult = {
  imageUrl?: string;
  title?: string;
  price?: string;
  error?: string;
};

/** URLからASINを抽出する */
function extractAsin(amazonUrl: string): string | null {
  // /dp/ASIN
  const dpMatch = amazonUrl.match(/\/dp\/([A-Z0-9]{10})/i);
  if (dpMatch) return dpMatch[1];
  // /gp/product/ASIN
  const gpMatch = amazonUrl.match(/\/gp\/product\/([A-Z0-9]{10})/i);
  if (gpMatch) return gpMatch[1];
  // /gp/aw/d/ASIN (モバイル)
  const awMatch = amazonUrl.match(/\/gp\/aw\/d\/([A-Z0-9]{10})/i);
  if (awMatch) return awMatch[1];
  // /ASIN/ パターン (URLパス内)
  const pathMatch = amazonUrl.match(/\/([A-Z0-9]{10})(?:[/?#]|$)/i);
  if (pathMatch) return pathMatch[1];
  return null;
}

/** ASINから直接画像URLを構築する（Amazonの既知パターン） */
function buildImageUrlFromAsin(asin: string): string {
  return `https://images-na.ssl-images-amazon.com/images/P/${asin}.09.LZZZZZZZ.jpg`;
}

/** URLをクリーンアップしてシンプルなAmazon商品URLにする */
function cleanAmazonUrl(amazonUrl: string): string {
  try {
    const url = new URL(amazonUrl);
    const asin = extractAsin(amazonUrl);
    if (asin) {
      return `${url.origin}/dp/${asin}`;
    }
    return amazonUrl;
  } catch {
    return amazonUrl;
  }
}

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
];

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/** タイムアウト付きfetch */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 15000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
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
        const redirectRes = await fetchWithTimeout(amazonUrl, {
          redirect: "manual",
          headers: { "User-Agent": ua },
        }, 10000);

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

    // ASINを抽出（フォールバック用）
    const asin = extractAsin(amazonUrl);

    // ---- 戦略1: 通常のページスクレイピング ----
    const scrapeResult = await tryScrape(amazonUrl, ua);
    if (scrapeResult) return scrapeResult;

    // ---- 戦略2: モバイル版ページ ----
    if (asin) {
      const origin = url.origin.replace("www.", "");
      const mobileUrl = `${origin}/dp/${asin}`;
      const mobileResult = await tryScrape(mobileUrl, USER_AGENTS[3]); // iPhone UA
      if (mobileResult) return mobileResult;
    }

    // ---- 戦略3: ASINベースのフォールバック ----
    if (asin) {
      return await asinFallback(asin, url.origin);
    }

    return { error: "商品情報を取得できませんでした。URLが正しいか確認してください" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "不明なエラー";
    console.error("Amazon商品情報取得エラー:", message);

    // 最終フォールバック: ASINがあれば画像だけでも返す
    const asin = extractAsin(amazonUrl);
    if (asin) {
      return {
        imageUrl: buildImageUrlFromAsin(asin),
        error: `一部の情報のみ取得できました: ${message}`,
      };
    }
    return { error: `URLの解析に失敗しました: ${message}` };
  }
}

/** ページをスクレイピングして商品情報を取得。失敗時はnullを返す */
async function tryScrape(pageUrl: string, ua: string): Promise<AmazonProductResult | null> {
  const cleanUrl = cleanAmazonUrl(pageUrl);

  let response: Response;
  try {
    response = await fetchWithTimeout(cleanUrl, {
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
    }, 15000);
  } catch {
    return null; // タイムアウトやネットワークエラー → 次の戦略へ
  }

  if (!response.ok) return null; // 500等 → 次の戦略へ

  const html = await response.text();

  // Bot検出ページのチェック
  if (html.includes("To discuss automated access to Amazon data") || html.includes("api-services-support@amazon.com")) {
    return null; // Bot検出 → 次の戦略へ
  }

  // ページが極端に短い場合はBot検出の可能性
  if (html.length < 5000) {
    return null;
  }

  const imageUrl = extractImageUrl(html);
  const title = extractTitle(html);
  const price = extractPrice(html);

  // 何も取れなかったら失敗
  if (!imageUrl && !title && !price) return null;

  return {
    imageUrl: imageUrl || undefined,
    title: title || undefined,
    price: price || undefined,
  };
}

/** ASINから画像URL構築 + oembed/OGPでタイトル取得を試みる */
async function asinFallback(asin: string, origin: string): Promise<AmazonProductResult> {
  const imageUrl = buildImageUrlFromAsin(asin);

  // 画像URLが実際にアクセス可能か確認
  let validImage = false;
  try {
    const imgRes = await fetchWithTimeout(imageUrl, { method: "HEAD" }, 5000);
    validImage = imgRes.ok && (imgRes.headers.get("content-type")?.startsWith("image/") ?? false);
  } catch {
    // 確認失敗でもURLは返す（クライアント側で表示を試みる）
    validImage = true;
  }

  // OGPでタイトルだけでも取得を試みる
  let title: string | undefined;
  try {
    const ogUrl = `${origin}/dp/${asin}`;
    const ogRes = await fetchWithTimeout(ogUrl, {
      headers: {
        "User-Agent": "facebookexternalhit/1.1",
        "Accept": "text/html",
      },
    }, 8000);

    if (ogRes.ok) {
      const ogHtml = await ogRes.text();
      title = extractTitle(ogHtml) || undefined;
    }
  } catch {
    // タイトル取得失敗は無視
  }

  if (!validImage && !title) {
    return { error: "商品情報を取得できませんでした" };
  }

  return {
    imageUrl: validImage ? imageUrl : undefined,
    title,
  };
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

  // パターン8: og:image の content が先に来るパターン
  const ogImageMatch2 = html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/);
  if (ogImageMatch2) return cleanImageUrl(ogImageMatch2[1]);

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

  // パターン2b: og:title content先パターン
  const ogTitleMatch2 = html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/);
  if (ogTitleMatch2) return ogTitleMatch2[1].trim();

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
