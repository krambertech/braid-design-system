import { atom } from 'recoil';

export const zoom = atom({
  key: 'zoom',
  default: 1,
});

export type Position = {
  x: number;
  y: number;
  scale: number;
};

export const fitToScreenDimensions = atom<Position>({
  key: 'fitToScreenDimensions',
  default: {
    x: 0,
    y: 0,
    scale: 1,
  },
});
