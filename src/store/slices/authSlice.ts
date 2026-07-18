import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  userToken: string | null;
  hasOnboarded: boolean;
  needsSetup: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  userToken: null,
  hasOnboarded: false,
  needsSetup: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrate: (
      state,
      action: PayloadAction<{
        token: string | null;
        onboarded: boolean;
        setup: boolean;
      }>,
    ) => {
      state.userToken = action.payload.token;
      state.hasOnboarded = action.payload.onboarded;
      state.needsSetup = action.payload.setup;
      state.isLoading = false;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.userToken = action.payload;
    },
    completeOnboarding: state => {
      state.hasOnboarded = true;
    },
    setSetupNeeded: (state, action: PayloadAction<boolean>) => {
      state.needsSetup = action.payload;
    },
  },
});

export const { hydrate, setToken, completeOnboarding, setSetupNeeded } =
  authSlice.actions;

export default authSlice.reducer;
