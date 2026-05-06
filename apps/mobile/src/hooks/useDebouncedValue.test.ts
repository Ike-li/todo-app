import { renderHook, act } from "@testing-library/react-native";
import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("should debounce value updates", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: "initial", delay: 300 } },
    );

    rerender({ value: "updated", delay: 300 });
    // Value should still be initial before delay
    expect(result.current).toBe("initial");

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe("updated");
  });

  it("should reset timer on rapid changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: "a", delay: 300 } },
    );

    rerender({ value: "b", delay: 300 });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    rerender({ value: "c", delay: 300 });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    // Still not 300ms since last change
    expect(result.current).toBe("a");

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe("c");
  });
});
