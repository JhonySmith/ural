import { useSelector } from 'react-redux';
import SearchForm from './components/SearchForm';
import BrandList from './components/BrandList';
import OffersTable from './components/OffersTable';
import Loader from './components/Loader';
import ErrorAlert from './components/ErrorAlert';

function App() {
  const { status, error } = useSelector((s) => s.parts);

  return (
    <div className="bg-light min-vh-100">
      <header className="bg-primary text-white py-3 mb-4">
        <div className="container">
          <h1 className="h4 mb-0">Поиск автозапчастей</h1>
        </div>
      </header>

      <main className="container pb-5">
        <div className="card">
          <div className="card-body">
            <SearchForm />

            {status === 'loadingBrands' && <Loader text="Поиск производителей..." />}
            {status === 'loadingOffers' && <Loader text="Загрузка аналогов..." />}

            <div className="mt-3">
              <ErrorAlert message={error} />
            </div>

            <BrandList />
            <OffersTable />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
