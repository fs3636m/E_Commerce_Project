import { configureStore } from "@reduxjs/toolkit";
import aiReducer from "./ai/aiSlice";
import authReducer from "./auth-slice";
import adminProductsSlice from "./admin/products_slice";
import adminOrderReducer from "./admin/order_slice";
import adminBrandReducer from './admin/admin_brand_slice';
import adminReportsReducer from "./admin/adminBrandReportsSlice";
import { saveToLocalStorage } from "./ai/aiSlice";

import shopOrderSlice from "./shop/order_slice";
import shopProductsSlice from "./shop/products_slice";
import shopCartSlice from "./shop/cart-slice";
import shopAddressSlice from "./shop/address_slice";
import shopSearchSlice from "./shop/search_slice";
import shopReviewSlice from "./shop/review_slice";
import commonFeatureSlice from "./common_slice";
import brandProductSlice from "./brand/products_slice";
import brandOrderReducer from "./brand/order_slice";
import brandSummaryReducer from "./brand/summary_slice";
import brandReducer from "./shop/brand_slice";
import homepageFeatureReducer from "./shop/feature_slice";
import brandReportsReducer from "./brand/brandSales_slice";




const store = configureStore({
  reducer: {
    auth: authReducer,
     ai: aiReducer,

    adminOrder: adminOrderReducer,
    adminProducts: adminProductsSlice,
    adminBrands: adminBrandReducer,
    adminBrandReports: adminReportsReducer,

    shopProducts: shopProductsSlice,
    shopCart: shopCartSlice,
    shopAddress: shopAddressSlice,
    shopOrder: shopOrderSlice,
    shopSearch: shopSearchSlice,  
    shopReview: shopReviewSlice,
    commonFeature: commonFeatureSlice,
    brandProducts: brandProductSlice,
    brandOrder: brandOrderReducer,
    brand: brandReducer,
    brandSummary: brandSummaryReducer,
    homepageFeature: homepageFeatureReducer,
    brandReports: brandReportsReducer
    
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(saveToLocalStorage),
});

export default store;
