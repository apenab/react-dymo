import {useRef, useState, useEffect, useReducer} from "react";

export function useData(initialData) {
  return useReducer((prevState, nextState) => ({...prevState, ...nextState}), initialData);
}
