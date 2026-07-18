import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface FitnessGoals {
  toning: boolean;
  strength: boolean;
  flexibility: boolean;
  lose_weight: boolean;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  weight: number;
  height: number;
  fitness_goals: FitnessGoals;
  exercise_exp: 'beginner' | 'intermediate' | 'advanced';
  activity_level: 'low' | 'moderate' | 'advanced';
  language: string;
  deactivated: boolean | null;
  terms_of_service_accepted: boolean | null;
  terms_of_service_accepted_date: string | null;
  privacy_policy_accepted: boolean | null;
  privacy_policy_accepted_date: string | null;
  dial_code: string;
  token_expire_date: string;
  sms_verified: boolean;
  gdpr_consent: boolean;
  gdpr_consent_date: string;
  mobile_device_id: string | null;
  created_at: string;
  updated_at: string;
  program_id: number | null;
  program_start_date: string | null;
  diseases: number[];
}

interface UserState {
  activeUser: User;
  userDiseases?: number[];
}

export const initialState: UserState = {
  activeUser: {
    id: 0,
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    gender: 'male',
    age: 0,
    weight: 0,
    height: 0,
    fitness_goals: {
      toning: false,
      strength: false,
      flexibility: false,
      lose_weight: false,
    },
    exercise_exp: 'beginner',
    activity_level: 'low',
    language: 'TR',
    deactivated: null,
    terms_of_service_accepted: null,
    terms_of_service_accepted_date: null,
    privacy_policy_accepted: null,
    privacy_policy_accepted_date: null,
    dial_code: '+90',
    token_expire_date: '',
    sms_verified: false,
    gdpr_consent: false,
    gdpr_consent_date: '',
    mobile_device_id: null,
    created_at: '',
    updated_at: '',
    program_id: null,
    program_start_date: null,
    diseases: [],
  },
  userDiseases: [],

};


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setActiveUser: (state, action: PayloadAction<User>) => {
      state.activeUser = action.payload;
    },
    setUserDiseases: (state, action: PayloadAction<number[]>) => {
      state.userDiseases = action.payload;
    }
  },
});

export const {setActiveUser, setUserDiseases} = userSlice.actions;
export default userSlice.reducer;