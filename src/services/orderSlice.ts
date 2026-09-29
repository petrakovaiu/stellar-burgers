import { createAsyncThunk, createSlice, type SerializedError } from '@reduxjs/toolkit';

import { getOrderByNumberApi, orderBurgerApi } from '@api';
import type { TOrder } from '@utils-types';

type TOrderState = {
  orderRequest: boolean;
  orderModalData: TOrder | null;
  currentOrder: TOrder | null;
  currentOrderLoading: boolean;
  error: SerializedError | null;
};

const initialState: TOrderState = {
  orderRequest: false,
  orderModalData: null,
  currentOrder: null,
  currentOrderLoading: false,
  error: null,
};

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (ingredients: string[]) => orderBurgerApi(ingredients)
);

export const getOrderByNumber = createAsyncThunk<TOrder | null, number>(
  'order/getOrderByNumber',
  async (number) => {
    const data = await getOrderByNumberApi(number);
    return data.orders[0] ?? null;
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderModal: (state) => {
      state.orderModalData = null;
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.currentOrderLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.orderModalData = null;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload.order;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.error;
      })
      .addCase(getOrderByNumber.pending, (state) => {
        state.currentOrderLoading = true;
        state.currentOrder = null;
        state.error = null;
      })
      .addCase(getOrderByNumber.fulfilled, (state, action) => {
        state.currentOrderLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(getOrderByNumber.rejected, (state, action) => {
        state.currentOrderLoading = false;
        state.error = action.error;
      });
  },
});

export const { clearOrderModal, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
