import { useSelector } from 'react-redux';
import { getMinPrice, getStock } from '../api/partsApi';

function formatPrice(price) {
  if (price == null) return '—';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(price);
}

function OffersTable() {
  const { offers, selectedBrand } = useSelector((s) => s.parts);

  if (!selectedBrand || !offers.length) return null;

  return (
    <section className="mt-4">
      <h2 className="h5 mb-3">Аналоги и предложения ({selectedBrand})</h2>
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Название</th>
              <th>Производитель</th>
              <th>Артикул</th>
              <th className="text-end">Цена</th>
              <th className="text-end">Остаток</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((item, i) => (
              <tr key={`${item.goodsID || item.number}-${item.brand}-${i}`}>
                <td>{item.name || '—'}</td>
                <td>{item.brand || '—'}</td>
                <td>
                  <code>{item.number || '—'}</code>
                </td>
                <td className="text-end">{formatPrice(getMinPrice(item))}</td>
                <td className="text-end">{getStock(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default OffersTable;
