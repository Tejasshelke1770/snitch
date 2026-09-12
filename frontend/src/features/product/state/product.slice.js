import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    allProducts: [],
    loading: false,
    error: null,
  },
  reducers: {
    setSellerProducts: (state, action) => {
      state.products = action.payload;
    },
    setAllProducts: (state, action) => {
      state.allProducts = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setSellerProducts, setAllProducts, setLoading, setError } = productSlice.actions;
export default productSlice.reducer;
