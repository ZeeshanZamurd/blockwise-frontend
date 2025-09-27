// Quick component interfaces for empty mode
export interface EmptyModeProps {
  emptyDataMode?: boolean;
}

// Create simple wrappers for components that don't have empty mode yet
import React from 'react';

export const withEmptyMode = <P extends object>(
  Component: React.ComponentType<P>,
  emptyComponent: React.ComponentType
) => {
  return ({ emptyDataMode, ...props }: P & EmptyModeProps) => {
    if (emptyDataMode) {
      return React.createElement(emptyComponent);
    }
    return React.createElement(Component, props as P);
  };
};