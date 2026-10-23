import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { extractBrands, fetchParts, flattenOffers } from '../api/partsApi';

export const searchBrands = createAsyncThunk(
  'parts/searchBrands',
  async (number, { rejectWithValue }) => {
    try {
      const { goods, isEmpty } = await fetchParts({ number });

      if (isEmpty) {
        return rejectWithValue('Деталь с таким артикулом не найдена');
      }

      const brands = extractBrands(goods);
      if (!brands.length) {
        return rejectWithValue('Производители не найдены');
      }

      return { number, brands, goods };
    } catch (e) {
      return rejectWithValue(e.message || 'Не удалось выполнить запрос');
    }
  }
);

export const searchAnalogues = createAsyncThunk(
  'parts/searchAnalogues',
  async ({ number, brand }, { rejectWithValue }) => {
    try {
      const { goods, isEmpty } = await fetchParts({
        number,
        brand,
        analogues: true,
      });

      if (isEmpty) {
        return rejectWithValue('Предложения и аналоги не найдены');
      }

      const offers = flattenOffers(goods);
      if (!offers.length) {
        return rejectWithValue('Предложения и аналоги не найдены');
      }

      return { brand, offers };
    } catch (e) {
      return rejectWithValue(e.message || 'Не удалось выполнить запрос');
    }
  }
);

const initialState = {
  number: '',
  brands: [],
  selectedBrand: null,
  offers: [],
  status: 'idle',
  error: null,
};

const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {
    resetSearch(state) {
      Object.assign(state, initialState);
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchBrands.pending, (state) => {
        state.status = 'loadingBrands';
        state.error = null;
        state.brands = [];
        state.selectedBrand = null;
        state.offers = [];
      })
      .addCase(searchBrands.fulfilled, (state, action) => {
        state.status = 'idle';
        state.number = action.payload.number;
        state.brands = action.payload.brands;
      })
      .addCase(searchBrands.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload || 'Ошибка поиска';
        state.brands = [];
      })
      .addCase(searchAnalogues.pending, (state) => {
        state.status = 'loadingOffers';
        state.error = null;
        state.offers = [];
      })
      .addCase(searchAnalogues.fulfilled, (state, action) => {
        state.status = 'idle';
        state.selectedBrand = action.payload.brand;
        state.offers = action.payload.offers;
      })
      .addCase(searchAnalogues.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload || 'Ошибка загрузки аналогов';
        state.offers = [];
      });
  },
});

export const { resetSearch, clearError } = partsSlice.actions;
export default partsSlice.reducer;
