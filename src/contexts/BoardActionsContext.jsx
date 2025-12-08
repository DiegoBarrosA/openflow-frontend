import React, { createContext, useContext, useState } from 'react';

const BoardActionsContext = createContext(null);

export function BoardActionsProvider({ children }) {
  const [boardData, setBoardData] = useState(null);

  const setBoardActions = (data) => {
    setBoardData(data);
  };

  return (
    <BoardActionsContext.Provider value={{ boardData, setBoardActions }}>
      {children}
    </BoardActionsContext.Provider>
  );
}

export function useBoardActions() {
  const context = useContext(BoardActionsContext);
  if (!context) {
    return { boardData: null, setBoardActions: () => {} };
  }
  return context;
}

