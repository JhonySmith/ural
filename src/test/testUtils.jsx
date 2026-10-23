import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import partsReducer from '../store/partsSlice';

export function createTestStore(preloadedState) {
  return configureStore({
    reducer: {
      parts: partsReducer,
    },
    preloadedState,
  });
}

export function renderWithStore(ui, { preloadedState, store, ...options } = {}) {
  const testStore = store || createTestStore(preloadedState);

  return {
    store: testStore,
    ...render(<Provider store={testStore}>{ui}</Provider>, options),
  };
}
