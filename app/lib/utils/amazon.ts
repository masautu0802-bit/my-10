/**
 * Amazon商品URLから画像URL、タイトル、価格を取得する
 */
export async function fetchAmazonProductImage(
  amazonUrl: string
): Promise<{ imageUrl: string; title: string; price?: string } | { error: string }> {
  try {
    // URLの検証
    const url = new URL(amazonUrl);
    if (!url.hostname.includes("amazon.co.jp") && !url.hostname.includes("amazon.com")) {
      return { error: "Amazon URLを入力してください" };
    }

    // Amazon商品ページを取得
    const response = await fetch(amazonUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return { error: "商品ページの取得に失敗しました" };
    }

    const html = await response.text();

    // 画像URLを抽出（複数のパターンに対応）
    let imageUrl = "";

    // パターン1: landingImage
    const landingImageMatch = html.match(
      /"landingImage"[^{]*"hiRes":"([^"]+)"/
    );
    if (landingImageMatch) {
      imageUrl = landingImageMatch[1];
    }

    // パターン2: main image
    if (!imageUrl) {
      const mainImageMatch = html.match(/"large":"([^"]+)"/);
      if (mainImageMatch) {
        imageUrl = mainImageMatch[1];
      }
    }

    // パターン3: imgタグから直接取得
    if (!imageUrl) {
      const imgMatch = html.match(
        /<img[^>]+id="landingImage"[^>]+src="([^"]+)"/
      );
      if (imgMatch) {
        imageUrl = imgMatch[1];
      }
    }

    if (!imageUrl) {
      return { error: "商品画像が見つかりませんでした" };
    }

    // 商品タイトルを取得
    let title = "";
    const titleMatch = html.match(
      /<span[^>]+id="productTitle"[^>]*>([^<]+)</
    );
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    // 価格を取得（複数のパターンに対応）
    let price = "";

    // パターン1: priceblock_ourprice または priceblock_dealprice
    const pricePattern1 = html.match(
      /<span[^>]+(?:id="priceblock_(?:ourprice|dealprice)"|class="[^"]*a-price-whole[^"]*")[^>]*>([^<]+)</
    );
    if (pricePattern1) {
      price = pricePattern1[1].replace(/[,\s]/g, "").trim();
    }

    // パターン2: a-price a-text-price a-size-medium apexPriceToPay
    if (!price) {
      const pricePattern2 = html.match(
        /<span class="a-price[^"]*"[^>]*><span[^>]*>([¥$€£]?[\d,]+)/
      );
      if (pricePattern2) {
        price = pricePattern2[1].replace(/[,\s]/g, "").trim();
      }
    }

    // パターン3: JSON-LDからの価格取得
    if (!price) {
      const jsonLdMatch = html.match(
        /"offers"[^{]*{[^}]*"price":\s*"?([¥$€£]?[\d,.]+)"?/
      );
      if (jsonLdMatch) {
        price = jsonLdMatch[1].replace(/[,\s]/g, "").trim();
      }
    }

    // パターン4: data-a-color="price"
    if (!price) {
      const pricePattern4 = html.match(
        /data-a-color="price"[^>]*>([¥$€£]?[\d,]+)/
      );
      if (pricePattern4) {
        price = pricePattern4[1].replace(/[,\s]/g, "").trim();
      }
    }

    // 価格のフォーマット（¥記号がない場合は追加）
    if (price && !price.startsWith("¥") && !price.startsWith("$") && !price.startsWith("€") && !price.startsWith("£")) {
      price = `¥${price}`;
    }

    // 画像URLのクリーニング（_SL..._ や _AC..._ などのサイズ指定を削除してより高画質に）
    imageUrl = imageUrl.replace(/\._[A-Z0-9]+_\./, ".");

    return { imageUrl, title, price: price || undefined };
  } catch (error) {
    console.error("Amazon画像取得エラー:", error);
    return { error: "URLの解析に失敗しました" };
  }
}
