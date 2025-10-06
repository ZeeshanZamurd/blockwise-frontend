import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import rolesReducer from './rolesSlice';
import issuesReducer from './issuesSlice';
import buildingReducer from './buildingSlice';
import meetingsReducer from './meetingsSlice';
import suppliersReducer from './suppliersSlice';
import calendarReducer from './calendarSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state, not roles (roles can be fetched fresh)
};

const rootReducer = combineReducers({
  auth: authReducer,
  roles: rolesReducer,
  issues: issuesReducer,
  building: buildingReducer,
  meetings: meetingsReducer,
  suppliers: suppliersReducer,
  calendar: calendarReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
