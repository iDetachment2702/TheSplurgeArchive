import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToggle } from './useToggle';

describe('useToggle', () => {
  it('デフォルトでfalseで初期化される', () => {
    const { result } = renderHook(() => useToggle());
    const [value] = result.current;
    expect(value).toBe(false);
  });

  it('指定された値で初期化される', () => {
    const { result } = renderHook(() => useToggle(true));
    const [value] = result.current;
    expect(value).toBe(true);
  });

  it('falseからtrueにトグルできる', () => {
    const { result } = renderHook(() => useToggle());

    act(() => {
      const [, toggle] = result.current;
      toggle();
    });

    const [value] = result.current;
    expect(value).toBe(true);
  });

  it('trueからfalseにトグルできる', () => {
    const { result } = renderHook(() => useToggle(true));

    act(() => {
      const [, toggle] = result.current;
      toggle();
    });

    const [value] = result.current;
    expect(value).toBe(false);
  });

  it('複数回トグルできる', () => {
    const { result } = renderHook(() => useToggle());

    act(() => {
      const [, toggle] = result.current;
      toggle();
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      const [, toggle] = result.current;
      toggle();
    });
    expect(result.current[0]).toBe(false);

    act(() => {
      const [, toggle] = result.current;
      toggle();
    });
    expect(result.current[0]).toBe(true);
  });

  it('値を直接trueに設定できる', () => {
    const { result } = renderHook(() => useToggle());

    act(() => {
      const [, , setValue] = result.current;
      setValue(true);
    });

    const [value] = result.current;
    expect(value).toBe(true);
  });

  it('値を直接falseに設定できる', () => {
    const { result } = renderHook(() => useToggle(true));

    act(() => {
      const [, , setValue] = result.current;
      setValue(false);
    });

    const [value] = result.current;
    expect(value).toBe(false);
  });

  it('トグル関数の参照が安定している', () => {
    const { result, rerender } = renderHook(() => useToggle());

    const [, initialToggle] = result.current;

    act(() => {
      initialToggle();
    });

    rerender();

    const [, afterToggle] = result.current;
    expect(afterToggle).toBe(initialToggle);
  });

  it('急速なトグルを処理できる', () => {
    const { result } = renderHook(() => useToggle());

    act(() => {
      const [, toggle] = result.current;
      toggle();
      toggle();
      toggle();
      toggle();
      toggle();
    });

    // falseから5回トグル: false -> true -> false -> true -> false -> true
    const [value] = result.current;
    expect(value).toBe(true);
  });

  it('トグル後にsetValueできる', () => {
    const { result } = renderHook(() => useToggle());

    act(() => {
      const [, toggle] = result.current;
      toggle();
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      const [, , setValue] = result.current;
      setValue(false);
    });
    expect(result.current[0]).toBe(false);

    act(() => {
      const [, toggle] = result.current;
      toggle();
    });
    expect(result.current[0]).toBe(true);
  });

  it('setValue後にトグルできる', () => {
    const { result } = renderHook(() => useToggle());

    act(() => {
      const [, , setValue] = result.current;
      setValue(true);
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      const [, toggle] = result.current;
      toggle();
    });
    expect(result.current[0]).toBe(false);
  });

  it('同じ値に設定できる', () => {
    const { result } = renderHook(() => useToggle(true));

    act(() => {
      const [, , setValue] = result.current;
      setValue(true);
    });

    const [value] = result.current;
    expect(value).toBe(true);
  });

  it('複数のインスタンスが独立して動作する', () => {
    const { result: result1 } = renderHook(() => useToggle());
    const { result: result2 } = renderHook(() => useToggle(true));

    expect(result1.current[0]).toBe(false);
    expect(result2.current[0]).toBe(true);

    act(() => {
      result1.current[1]();
    });

    expect(result1.current[0]).toBe(true);
    expect(result2.current[0]).toBe(true);

    act(() => {
      result2.current[1]();
    });

    expect(result1.current[0]).toBe(true);
    expect(result2.current[0]).toBe(false);
  });
});
