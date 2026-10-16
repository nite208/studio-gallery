import { createContext, useContext } from 'react';

export interface PhotoCountStore {
  readonly count: number;
  readonly setCount: (n: number) => void;
}

const noop = (): void => {};

export const PhotoCountContext = createContext<PhotoCountStore>({
  count: 0,
  setCount: noop,
});

export function usePhotoCount(): number {
  return useContext(PhotoCountContext).count;
}

export function useSetPhotoCount(): (n: number) => void {
  return useContext(PhotoCountContext).setCount;
}
