import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface EquipmentState {
  equipments: any[];
}

const initialState: EquipmentState = {
  equipments: [],
};

const exereyeEquipmentSlice = createSlice({
  name: 'exereyeEquipment',
  initialState,
  reducers: {
    setEquipments: (state, action: PayloadAction<any[]>) => {
      state.equipments = action.payload;
    },
  },
});

export const {setEquipments} = exereyeEquipmentSlice.actions;
export default exereyeEquipmentSlice.reducer;
