import {useRef, useState, useEffect, useReducer} from "react";

export function useData(initialData) {
  return useReducer((prevState, nextState) => ({...prevState, ...nextState}), initialData);
}

export function useDebounce(data, delay) {
  const handler = useRef();
  const [value, setValue] = useState(data);
  let optionsString;
  try {
    optionsString = JSON.stringify(data);
  } catch (err) {}

  useEffect(() => {
    handler.current = setTimeout(() => {
      setValue(data);
    }, delay);

    return () => {
      clearTimeout(handler.current);
    };
  }, [data, delay]);

  return value;
}
