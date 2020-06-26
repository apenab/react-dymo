import {useReducer} from "react";

export function useData(initialData) {
  return useReducer((prevState, nextState) => ({...prevState, ...nextState}), initialData);
}
