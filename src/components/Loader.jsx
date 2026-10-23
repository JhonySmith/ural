function Loader({ text = 'Загрузка...' }) {
  return (
    <div className="d-flex align-items-center gap-2 my-3">
      <div className="spinner-border spinner-border-sm text-primary" />
      <span className="text-muted">{text}</span>
    </div>
  );
}

export default Loader;
