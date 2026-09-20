import { createSlice, current } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: [],
    loading: false,
    error: null,
  },
  reducers: {
    setItems: (state, action) => {
      state.cartItems = action.payload;
    },
    //localstate for 1 item
    addItemToCart: (state, action) => {
      state.cartItems.push(action.payload);
    },
    incrementCartItemQuantity: (state, action) => {
      const { productId, varientId } = action.payload;
      state.cartItems = current(state.cartItems).map((item) => {
        if (item.product._id === productId && item.variant === varientId) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
    },
    // removeItem: (state, action) => {
    //   state.cartItems = state.cartItems.filter(
    //     (item) => item.productId !== action.payload,
    //   );
    // },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setItems, setLoading, setError, incrementCartItemQuantity } =
  cartSlice.actions;
export default cartSlice.reducer;
