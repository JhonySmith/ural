import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchForm from './SearchForm';
import { renderWithStore } from '../test/testUtils';
import * as partsSlice from '../store/partsSlice';

vi.mock('../store/partsSlice', async () => {
  const actual = await vi.importActual('../store/partsSlice');
  return {
    ...actual,
    searchBrands: Object.assign(
      vi.fn((number) => ({ type: 'parts/searchBrands', payload: number })),
      {
        pending: { type: 'parts/searchBrands/pending' },
        fulfilled: { type: 'parts/searchBrands/fulfilled' },
        rejected: { type: 'parts/searchBrands/rejected' },
      }
    ),
  };
});

describe('SearchForm', () => {
  it('кнопка disabled без артикула', () => {
    renderWithStore(<SearchForm />);
    expect(screen.getByRole('button', { name: 'Найти' })).toBeDisabled();
  });

  it('сабмит', async () => {
    const user = userEvent.setup();
    renderWithStore(<SearchForm />);

    await user.type(screen.getByLabelText(/Артикул/), '  01089  ');
    await user.click(screen.getByRole('button', { name: 'Найти' }));

    expect(partsSlice.searchBrands).toHaveBeenCalledWith('01089');
  });

  it('сброс', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<SearchForm />, {
      preloadedState: {
        parts: {
          number: '01089',
          brands: ['FEBI'],
          selectedBrand: null,
          offers: [],
          status: 'idle',
          error: null,
        },
      },
    });

    await user.type(screen.getByLabelText(/Артикул/), '01089');
    await user.click(screen.getByRole('button', { name: 'Сброс' }));

    expect(screen.getByLabelText(/Артикул/)).toHaveValue('');
    expect(store.getState().parts.brands).toEqual([]);
  });

  it('лок на загрузке', () => {
    renderWithStore(<SearchForm />, {
      preloadedState: {
        parts: {
          number: '',
          brands: [],
          selectedBrand: null,
          offers: [],
          status: 'loadingBrands',
          error: null,
        },
      },
    });

    expect(screen.getByLabelText(/Артикул/)).toBeDisabled();
  });
});
