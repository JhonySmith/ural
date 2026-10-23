import { describe, it, expect, vi, beforeEach } from 'vitest';
import partsReducer, {
  clearError,
  resetSearch,
  searchAnalogues,
  searchBrands,
} from './partsSlice';
import * as partsApi from '../api/partsApi';

vi.mock('../api/partsApi', async () => {
  const actual = await vi.importActual('../api/partsApi');
  return {
    ...actual,
    fetchParts: vi.fn(),
  };
});

describe('partsSlice', () => {
  it('reset', () => {
    const dirty = {
      number: '01089',
      brands: ['FEBI'],
      selectedBrand: 'FEBI',
      offers: [{ brand: 'FEBI' }],
      status: 'idle',
      error: 'ошибка',
    };

    expect(partsReducer(dirty, resetSearch())).toEqual({
      number: '',
      brands: [],
      selectedBrand: null,
      offers: [],
      status: 'idle',
      error: null,
    });
  });

  it('clearError', () => {
    const state = {
      number: '',
      brands: [],
      selectedBrand: null,
      offers: [],
      status: 'idle',
      error: 'сеть',
    };

    expect(partsReducer(state, clearError()).error).toBeNull();
  });
});

describe('searchBrands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ok', async () => {
    partsApi.fetchParts.mockResolvedValue({
      goods: [
        { brand: 'FEBI', number: '01089', goodsID: '1' },
        { brand: 'MEYLE', number: '01089', goodsID: '2' },
      ],
      isEmpty: false,
    });

    const result = await searchBrands('01089')(vi.fn(), () => ({}), undefined);

    expect(result.type).toBe('parts/searchBrands/fulfilled');
    expect(result.payload.brands).toEqual(['FEBI', 'MEYLE']);
  });

  it('пусто', async () => {
    partsApi.fetchParts.mockResolvedValue({ goods: [{}], isEmpty: true });

    const result = await searchBrands('xxx')(vi.fn(), () => ({}), undefined);

    expect(result.type).toBe('parts/searchBrands/rejected');
    expect(result.payload).toBe('Деталь с таким артикулом не найдена');
  });

  it('pending', () => {
    const state = partsReducer(undefined, { type: searchBrands.pending.type });
    expect(state.status).toBe('loadingBrands');
    expect(state.brands).toEqual([]);
  });
});

describe('searchAnalogues', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ok', async () => {
    partsApi.fetchParts.mockResolvedValue({
      goods: [
        {
          brand: 'MEYLE',
          number: '1',
          name: 'Деталь',
          analogues: [{ brand: 'FEBI', number: '2', name: 'Аналог' }],
        },
      ],
      isEmpty: false,
    });

    const result = await searchAnalogues({ number: '1', brand: 'MEYLE' })(
      vi.fn(),
      () => ({}),
      undefined
    );

    expect(result.type).toBe('parts/searchAnalogues/fulfilled');
    expect(result.payload.offers).toHaveLength(2);
  });

  it('сеть упала', async () => {
    partsApi.fetchParts.mockRejectedValue(new Error('Ошибка сети: 500'));

    const result = await searchAnalogues({ number: '1', brand: 'MEYLE' })(
      vi.fn(),
      () => ({}),
      undefined
    );

    expect(result.type).toBe('parts/searchAnalogues/rejected');
    expect(result.payload).toBe('Ошибка сети: 500');
  });

  it('pending', () => {
    const prev = {
      number: '1',
      brands: ['MEYLE'],
      selectedBrand: null,
      offers: [{ brand: 'x' }],
      status: 'idle',
      error: 'old',
    };

    const state = partsReducer(prev, { type: searchAnalogues.pending.type });
    expect(state.status).toBe('loadingOffers');
    expect(state.offers).toEqual([]);
  });
});
