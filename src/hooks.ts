import { useReducer, Dispatch } from "react";

/**
 * Custom hook that provides a convenient way to merge state updates
 * Similar to this.setState() in class components
 * @param initialData - Initial state value
 * @returns A tuple of [state, setState] where setState merges updates into existing state
 */
export function useData<T extends Record<string, any>>(
  initialData: T
): [T, Dispatch<Partial<T>>] {
  return useReducer(
    (prevState: T, nextState: Partial<T>) => ({ ...prevState, ...nextState }),
    initialData
  );
}
