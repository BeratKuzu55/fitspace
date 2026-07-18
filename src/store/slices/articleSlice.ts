import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface Article {
  id: number;
  title: string;
  text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ArticleState {
  activeArticle: Article;
}

const initialState: ArticleState = {
  activeArticle: {
    id: 0,
    title: '',
    text: '',
    is_active: false,
    created_at: '',
    updated_at: '',
  },
};

const articleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    setActiveArticle: (state, action: PayloadAction<Article>) => {
      state.activeArticle = action.payload;
    },
  },
});

export const {setActiveArticle} = articleSlice.actions;
export default articleSlice.reducer;
