import { useDispatch } from 'react-redux';
import { clearError } from '../store/partsSlice';

function ErrorAlert({ message }) {
  const dispatch = useDispatch();
  if (!message) return null;

  return (
    <div className="alert alert-danger alert-dismissible fade show" role="alert">
      {message}
      <button
        type="button"
        className="btn-close"
        aria-label="Закрыть"
        onClick={() => dispatch(clearError())}
      />
    </div>
  );
}

export default ErrorAlert;
