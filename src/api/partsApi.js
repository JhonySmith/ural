const API_BASE =
  import.meta.env.VITE_API_BASE || 'http://api.favorit-parts.ru/hs/hsprice/';
const API_KEY =
  import.meta.env.VITE_API_KEY || '00000000-0000-0000-0000-000000000001';

export async function fetchParts({ number, brand, analogues = false }) {
  const params = new URLSearchParams({ key: API_KEY, number });

  if (brand) params.set('brand', brand);
  if (analogues && brand) params.set('analogues', 'on');

  const res = await fetch(`${API_BASE}?${params}`);

  if (!res.ok) {
    throw new Error(`Ошибка сети: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(
      typeof data.error === 'string' ? data.error : JSON.stringify(data.error)
    );
  }

  const goods = Array.isArray(data.goods) ? data.goods : [];
  const empty =
    goods.length === 0 ||
    (goods.length === 1 && !goods[0]?.brand && !goods[0]?.number && !goods[0]?.goodsID);

  return { goods, isEmpty: empty };
}

export function getMinPrice(item) {
  const list = item?.warehouses;
  if (!Array.isArray(list) || !list.length) return null;

  const prices = list
    .map((w) => Number(w.price))
    .filter((p) => !Number.isNaN(p) && p > 0);

  return prices.length ? Math.min(...prices) : null;
}

export function getStock(item) {
  if (typeof item?.count === 'number') return item.count;

  if (!Array.isArray(item?.warehouses)) return 0;

  return item.warehouses.reduce((sum, w) => sum + (Number(w.stock) || 0), 0);
}

export function extractBrands(goods) {
  const result = [];
  const seen = new Set();

  for (const item of goods) {
    const brand = item?.brand?.trim();
    if (!brand || seen.has(brand)) continue;
    seen.add(brand);
    result.push(brand);
  }

  return result;
}

export function flattenOffers(goods) {
  const result = [];

  for (const item of goods) {
    if (item?.brand || item?.number || item?.name) {
      result.push(item);
    }

    if (!Array.isArray(item?.analogues)) continue;

    for (const a of item.analogues) {
      if (a?.brand || a?.number || a?.name) result.push(a);
    }
  }

  return result;
}
