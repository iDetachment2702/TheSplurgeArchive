import { useState, useCallback } from 'react';

/**
 * boolean値をトグルするカスタムフック
 * @param initialValue - 初期値（デフォルト: false）
 * @returns [現在の値, トグル関数, 値を設定する関数]
 */
export const useToggle = (initialValue = false): [boolean, () => void, (value: boolean) => void] => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle, setValue];
};
