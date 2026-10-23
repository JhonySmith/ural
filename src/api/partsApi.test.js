import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  extractBrands,
  fetchParts,
  flattenOffers,
  getMinPrice,
  getStock,
} from './partsApi';

describe('getMinPrice', () => {
  it('min по складам', () => {
    expect(
      getMinPrice({
        warehouses: [{ price: 300 }, { price: 150 }, { price: 200 }],
      })
    ).toBe(150);
  });

  it('скипает 0 и мусор', () => {
    expect(
      getMinPrice({
        warehouses: [{ price: 0 }, { price: 'abc' }, { price: 99 }],
      })
    ).toBe(99);
  });

  it('null если складов нет', () => {
    expect(getMinPrice({})).toBeNull();
    expect(getMinPrice({ warehouses: [] })).toBeNull();
    expect(getMinPrice(null)).toBeNull();
  });
});

describe('getStock', () => {
  it('берёт count', () => {
    expect(getStock({ count: 42, warehouses: [{ stock: 1 }] })).toBe(42);
  });

  it('сумма stock без count', () => {
    expect(
      getStock({
        warehouses: [{ stock: 3 }, { stock: 7 }, { stock: '2' }],
      })
    ).toBe(12);
  });

  it('0 без данных', () => {
    expect(getStock({})).toBe(0);
    expect(getStock(null)).toBe(0);
  });
});

describe('extractBrands', () => {
  it('уникальные бренды', () => {
    expect(
      extractBrands([
        { brand: 'FEBI' },
        { brand: 'MEYLE' },
        { brand: 'FEBI' },
        { brand: '  NGK  ' },
      ])
    ).toEqual(['FEBI', 'MEYLE', 'NGK']);
  });

  it('пустые пропускает', () => {
    expect(extractBrands([{ brand: '' }, {}, { brand: 'AP' }])).toEqual(['AP']);
  });
});

describe('flattenOffers', () => {
  it('товар + аналоги', () => {
    const result = flattenOffers([
      {
        brand: 'MEYLE',
        number: '1',
        name: 'Основной',
        analogues: [
          { brand: 'FEBI', number: '2', name: 'Аналог' },
          {},
        ],
      },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].brand).toBe('MEYLE');
    expect(result[1].brand).toBe('FEBI');
  });
});

describe('fetchParts', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('запрос только по number', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        goods: [{ brand: 'MEYLE', number: '7160500039S', goodsID: '1' }],
      }),
    });

    const result = await fetchParts({ number: '7160500039S' });

    expect(result.isEmpty).toBe(false);
    expect(result.goods).toHaveLength(1);

    const url = fetch.mock.calls[0][0];
    expect(url).toContain('number=7160500039S');
    expect(url).not.toContain('brand=');
    expect(url).not.toContain('analogues=on');
  });

  it('brand + analogues', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        goods: [{ brand: 'MEYLE', number: '1', goodsID: '1' }],
      }),
    });

    await fetchParts({ number: '1', brand: 'MEYLE', analogues: true });

    const url = fetch.mock.calls[0][0];
    expect(url).toContain('brand=MEYLE');
    expect(url).toContain('analogues=on');
  });

  it('пустая структура → isEmpty', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ goods: [{}] }),
    });

    const result = await fetchParts({ number: 'missing' });
    expect(result.isEmpty).toBe(true);
  });

  it('error в ответе', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ error: 'Empty number goods!' }),
    });

    await expect(fetchParts({ number: '' })).rejects.toThrow('Empty number goods!');
  });

  it('http ошибка', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(fetchParts({ number: '1' })).rejects.toThrow('Ошибка сети: 500');
  });
});
