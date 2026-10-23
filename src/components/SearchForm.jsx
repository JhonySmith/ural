import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetSearch, searchBrands } from '../store/partsSlice';

function SearchForm() {
  const dispatch = useDispatch();
  const status = useSelector((s) => s.parts.status);
  const [article, setArticle] = useState('');

  const loading = status === 'loadingBrands' || status === 'loadingOffers';

  const onSubmit = (e) => {
    e.preventDefault();
    const number = article.trim();
    if (!number || loading) return;
    dispatch(searchBrands(number));
  };

  return (
    <form onSubmit={onSubmit} className="row g-2 align-items-end">
      <div className="col-md-8">
        <label htmlFor="article" className="form-label">
          Артикул
        </label>
        <input
          id="article"
          type="text"
          className="form-control"
          placeholder="7160500039S"
          value={article}
          onChange={(e) => setArticle(e.target.value)}
          disabled={loading}
          autoComplete="off"
        />
      </div>
      <div className="col-md-4 d-flex gap-2">
        <button
          type="submit"
          className="btn btn-primary flex-grow-1"
          disabled={!article.trim() || loading}
        >
          Найти
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          disabled={loading}
          onClick={() => {
            setArticle('');
            dispatch(resetSearch());
          }}
        >
          Сброс
        </button>
      </div>
    </form>
  );
}

export default SearchForm;
