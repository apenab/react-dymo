import { renderHook, act } from "@testing-library/react-hooks";
import { useData } from "./hooks";

describe("useData", () => {
  it("should initialize with provided data", () => {
    const initialData = { count: 0, name: "test" };
    const { result } = renderHook(() => useData(initialData));

    expect(result.current[0]).toEqual(initialData);
  });

  it("should merge state updates", () => {
    const initialData = { count: 0, name: "test", active: true };
    const { result } = renderHook(() => useData(initialData));

    act(() => {
      result.current[1]({ count: 5 });
    });

    expect(result.current[0]).toEqual({ count: 5, name: "test", active: true });
  });

  it("should handle multiple sequential updates", () => {
    const initialData = { a: 1, b: 2, c: 3 };
    const { result } = renderHook(() => useData(initialData));

    act(() => {
      result.current[1]({ a: 10 });
    });

    expect(result.current[0]).toEqual({ a: 10, b: 2, c: 3 });

    act(() => {
      result.current[1]({ b: 20 });
    });

    expect(result.current[0]).toEqual({ a: 10, b: 20, c: 3 });

    act(() => {
      result.current[1]({ c: 30 });
    });

    expect(result.current[0]).toEqual({ a: 10, b: 20, c: 30 });
  });

  it("should not lose previous state on partial update", () => {
    const initialData = {
      status: "initial",
      data: null,
      error: null,
      count: 0
    };
    const { result } = renderHook(() => useData(initialData));

    act(() => {
      result.current[1]({ status: "loading" });
    });

    expect(result.current[0]).toEqual({
      status: "loading",
      data: null,
      error: null,
      count: 0,
    });
  });

  it("should handle updating multiple properties at once", () => {
    const initialData = { x: 0, y: 0, z: 0 };
    const { result } = renderHook(() => useData(initialData));

    act(() => {
      result.current[1]({ x: 1, y: 2 });
    });

    expect(result.current[0]).toEqual({ x: 1, y: 2, z: 0 });
  });

  it("should handle overwriting values", () => {
    const initialData = { name: "John", age: 30 };
    const { result } = renderHook(() => useData(initialData));

    act(() => {
      result.current[1]({ name: "Jane" });
    });

    expect(result.current[0].name).toBe("Jane");
    expect(result.current[0].age).toBe(30);

    act(() => {
      result.current[1]({ name: "Bob", age: 25 });
    });

    expect(result.current[0]).toEqual({ name: "Bob", age: 25 });
  });

  it("should handle complex nested objects", () => {
    const initialData = {
      user: { name: "John", settings: { theme: "dark" } },
      count: 0,
    };
    const { result } = renderHook(() => useData(initialData));

    act(() => {
      result.current[1]({
        user: { name: "Jane", settings: { theme: "light" } }
      });
    });

    expect(result.current[0].user.name).toBe("Jane");
    expect(result.current[0].user.settings.theme).toBe("light");
    expect(result.current[0].count).toBe(0);
  });

  it("should handle empty update object", () => {
    const initialData = { a: 1, b: 2 };
    const { result } = renderHook(() => useData(initialData));

    act(() => {
      result.current[1]({});
    });

    expect(result.current[0]).toEqual({ a: 1, b: 2 });
  });
});
