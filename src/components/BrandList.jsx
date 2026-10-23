import { useDispatch, useSelector } from 'react-redux';
import { searchAnalogues } from '../store/partsSlice';

function BrandList() {
  const dispatch = useDispatch();
  const { brands, number, selectedBrand, status } = useSelector((s) => s.parts);

  if (!brands.length) return null;

  const loading = status === 'loadingOffers';

  return (
    <section className="mt-4">
      <h2 className="h5 mb-3">Производители</h2>
      <div className="list-group">
        {brands.map((brand) => (
          <button
            key={brand}
            type="button"
            className={`list-group-item list-group-item-action${
              selectedBrand === brand ? ' active' : ''
            }`}
            disabled={loading}
            onClick={() => {
              if (loading || brand === selectedBrand) return;
              dispatch(searchAnalogues({ number, brand }));
            }}
          >
            {brand}
          </button>
        ))}
      </div>
    </section>
  );
}

export default BrandList;
