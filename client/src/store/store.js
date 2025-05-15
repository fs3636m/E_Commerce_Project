import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import adminProductsSlice from "./admin/products_slice";
import adminOrderReducer from "./admin/order_slice";

import shopOrderSlice from "./shop/order_slice";
import shopProductsSlice from "./shop/products_slice";
import shopCartSlice from "./shop/cart-slice";
import shopAddressSlice from "./shop/address_slice";
import shopSearchSlice from "./shop/search_slice";
import shopReviewSlice from "./shop/review_slice";
import commonFeatureSlice from "./common_slice";

const store = configureStore({
  reducer: {
    auth: authReducer,

    adminOrder: adminOrderReducer,
    adminProducts: adminProductsSlice,

    shopProducts: shopProductsSlice,
    shopCart: shopCartSlice,
    shopAddress: shopAddressSlice,
    shopOrder: shopOrderSlice,
    shopSearch: shopSearchSlice,  
    shopReview: shopReviewSlice,

    commonFeature: commonFeatureSlice
  },
});

export default store;
