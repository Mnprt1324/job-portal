import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import jobSlice from "./jobSlice";
import applicationSlice from "./applicationSlice";
import companySlice from "./companySlice";
import { messagesApi } from './messagesApi';
import { notificationsApi } from './notificationsApi';
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import persistStore from "redux-persist/es/persistStore";
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: ['messagesApi', 'notificationsApi'],
};

const rootReducer = combineReducers({
  auth: authSlice,
  job: jobSlice,
  company: companySlice,
  application: applicationSlice,
  [messagesApi.reducerPath]: messagesApi.reducer,
  [notificationsApi.reducerPath]: notificationsApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(messagesApi.middleware, notificationsApi.middleware),
});

export const persistor = persistStore(store);
export default store;
