/**
 * Amazon商品URLから画像URL、タイトル、価格を取得する
 */
export async function fetchAmazonProductImage(
  amazonUrl: string
): Promise<{ imageUrl: string; title: string; price?: string } | { error: string }> {
  try {
    // URLの検証
    let url: URL;
    try {
      url = new URL(amazonUrl);
    } catch {
      return { error: "無効なURLです。正しいURLを入力してください" };
    }

    if (!url.hostname.includes("amazon.co.jp") && !url.hostname.includes("amazon.com")) {
      return { error: "Amazon URLを入力してください（amazon.co.jp または amazon.com）" };
    }

    // タイムアウト付きfetch（10秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(amazonUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
        },
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return { error: "タイムアウト: Amazonへの接続に時間がかかりすぎました（10秒）" };
      }
      return { error: `ネットワークエラー: ${err instanceof Error ? err.message : "接続に失敗しました"}` };
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      return { error: `HTTPエラー ${response.status}: ${response.status === 403 ? "アクセスが拒否されました（Bot検出の可能性）" : response.status === 404 ? "商品ページが見つかりません" : response.status === 503 ? "Amazonのサービスが一時的に利用不可" : "商品ページの取得に失敗しました"}` };
    }

    const html = await response.text();

    // Bot検出ページのチェック
    if (html.includes("To discuss automated access to Amazon data") || html.includes("api-services-support@amazon.com")) {
      return { error: "Amazonのボット検出に引っかかりました。しばらく待ってから再試行してください" };
    }

    // 画像URLを抽出（複数のパターンに対応）
    let imageUrl = "";

    // パターン1: landingImage hiRes
    const landingImageMatch = html.match(
      /"landingImage"[^{]*"hiRes":"([^"]+)"/
    );
    if (landingImageMatch) {
      imageUrl = landingImageMatch[1];
    }

    // パターン2: colorImages initial large
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

    // パターン4: data-old-hires属性
    if (!imageUrl) {
      const hiresMatch = html.match(/data-old-hires="([^"]+)"/);
      if (hiresMatch) {
        imageUrl = hiresMatch[1];
      }
    }

    // パターン5: mainImageWidget
    if (!imageUrl) {
      const widgetMatch = html.match(/"mainUrl":"([^"]+)"/);
      if (widgetMatch) {
        imageUrl = widgetMatch[1];
      }
    }

    if (!imageUrl) {
      return { error: "商品画像が見つかりませんでした。URLが正しいか確認してください" };
    }

    // 商品タイトルを取得
    let title = "";
    const titleMatch = html.match(
      /<span[^>]+id="productTitle"[^>]*>([^<]+)</
    );
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    // タイトル代替: title タグ
    if (!title) {
      const pageTitleMatch = html.match(/<title>([^<]+)<\/title>/);
      if (pageTitleMatch) {
        title = pageTitleMatch[1].replace(/\s*Amazon.*$/, "").replace(/\s*\|.*$/, "").trim();
      }
    }

    // 価格を取得（複数のパターンに対応）
    let price = "";

    // パターン1: a-price-whole（現在のAmazonで最もよく使われるパターン）
    const priceWholeMatch = html.match(
      /<span class="a-price-whole">([^<]+)<\/span>/
    );
    if (priceWholeMatch) {
      price = priceWholeMatch[1].replace(/[,.\s]/g, "").trim();
    }

    // パターン2: apexPriceToPay
    if (!price) {
      const apexMatch = html.match(
        /apexPriceToPay[^>]*>.*?<span[^>]*>([¥$€£]?[\d,]+)/s
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
        /corePriceDisplay[^>]*>.*?<span class="a-offscreen">([¥$€£]?[\d,]+)/s
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
        /data-a-color="price"[^>]*>.*?([¥$€£]?[\d,]+)/s
      );
      if (priceColorMatch) {
        price = priceColorMatch[1].replace(/[,\s]/g, "").trim();
      }
    }

    // 価格のフォーマット（¥記号がない場合は追加）
    if (price && !price.startsWith("¥") && !price.startsWith("$") && !price.startsWith("€") && !price.startsWith("£")) {
      price = `¥${price}`;
    }

    // 画像URLのクリーニング（サイズ指定を削除してより高画質に）
    imageUrl = imageUrl.replace(/\._[A-Z0-9]+_\./, ".");

    return { imageUrl, title, price: price || undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "不明なエラー";
    console.error("Amazon画像取得エラー:", message);
    return { error: `URLの解析に失敗しました: ${message}` };
  }
}
