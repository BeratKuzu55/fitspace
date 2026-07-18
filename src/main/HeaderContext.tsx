// File: context/HeaderContext.tsx
import React, {createContext, useContext, useState} from 'react';

const HeaderContext = createContext({
  title: 'Fitspace',
  setTitle: (title: string) => {},
});

export const useHeaderTitle = () => useContext(HeaderContext);

export const HeaderProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [title, setTitle] = useState('Fitspace');
  return (
    <HeaderContext.Provider value={{title, setTitle}}>
      {children}
    </HeaderContext.Provider>
  );
};
