import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import OffersTable from './OffersTable';
import { renderWithStore } from '../test/testUtils';

describe('OffersTable', () => {
  it('без бренда не рисуется', () => {
    const { container } = renderWithStore(<OffersTable />, {
      preloadedState: {
        parts: {
          number: '1',
          brands: ['MEYLE'],
          selectedBrand: null,
          offers: [{ brand: 'MEYLE', name: 'Деталь', number: '1' }],
          status: 'idle',
          error: null,
        },
      },
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('строка в таблице', () => {
    renderWithStore(<OffersTable />, {
      preloadedState: {
        parts: {
          number: '1',
          brands: ['MEYLE'],
          selectedBrand: 'MEYLE',
          offers: [
            {
              goodsID: 'g1',
              brand: 'MEYLE',
              name: 'Рычаг подвески',
              number: '7160500039S',
              count: 10,
              warehouses: [{ price: 1500.5, stock: 10 }],
            },
          ],
          status: 'idle',
          error: null,
        },
      },
    });

    expect(screen.getByText(/Аналоги и предложения \(MEYLE\)/)).toBeInTheDocument();
    expect(screen.getByText('Рычаг подвески')).toBeInTheDocument();
    expect(screen.getByText('7160500039S')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
