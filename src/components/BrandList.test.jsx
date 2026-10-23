import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BrandList from './BrandList';
import { renderWithStore } from '../test/testUtils';
import * as partsSlice from '../store/partsSlice';

vi.mock('../store/partsSlice', async () => {
  const actual = await vi.importActual('../store/partsSlice');
  return {
    ...actual,
    searchAnalogues: Object.assign(
      vi.fn((payload) => ({ type: 'parts/searchAnalogues', payload })),
      {
        pending: { type: 'parts/searchAnalogues/pending' },
        fulfilled: { type: 'parts/searchAnalogues/fulfilled' },
        rejected: { type: 'parts/searchAnalogues/rejected' },
      }
    ),
  };
});

const base = {
  number: '01089',
  brands: ['FEBI', 'MEYLE'],
  selectedBrand: null,
  offers: [],
  status: 'idle',
  error: null,
};

describe('BrandList', () => {
  it('пусто → ничего', () => {
    const { container } = renderWithStore(<BrandList />, {
      preloadedState: { parts: { ...base, brands: [] } },
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('рендер брендов', () => {
    renderWithStore(<BrandList />, {
      preloadedState: { parts: base },
    });

    expect(screen.getByText('FEBI')).toBeInTheDocument();
    expect(screen.getByText('MEYLE')).toBeInTheDocument();
  });

  it('клик → аналоги', async () => {
    const user = userEvent.setup();
    renderWithStore(<BrandList />, {
      preloadedState: { parts: base },
    });

    await user.click(screen.getByText('MEYLE'));

    expect(partsSlice.searchAnalogues).toHaveBeenCalledWith({
      number: '01089',
      brand: 'MEYLE',
    });
  });

  it('повторный клик по выбранному — noop', async () => {
    const user = userEvent.setup();
    renderWithStore(<BrandList />, {
      preloadedState: {
        parts: { ...base, selectedBrand: 'FEBI' },
      },
    });

    await user.click(screen.getByText('FEBI'));
    expect(partsSlice.searchAnalogues).not.toHaveBeenCalled();
  });
});
