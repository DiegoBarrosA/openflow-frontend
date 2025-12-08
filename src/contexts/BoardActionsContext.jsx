import React, { createContext, useContext, useState } from 'react';

const BoardActionsContext = createContext(null);

export function BoardActionsProvider({ children }) {
  const [boardActions, setBoardActions] = useState(null);

  return (
    <BoardActionsContext.Provider value={{ boardActions, setBoardActions }}>
      {children}
    </BoardActionsContext.Provider>
  );
}

export function useBoardActions() {
  const context = useContext(BoardActionsContext);
  if (!context) {
    return { boardActions: null, setBoardActions: () => {} };
  }
  return context;
}

