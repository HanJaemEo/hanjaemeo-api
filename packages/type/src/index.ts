export type { DeepNonNullable, DeepReadonly } from 'ts-essentials';

export type Extends<T extends U, U> = T;

export type NestedTree<Leaf> = {
  [key: string]: NestedTree<Leaf> | Leaf;
};

export type ImageData = {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
  blurWidth?: number;
  blurHeight?: number;
};
