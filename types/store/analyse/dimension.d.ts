/**
 * @desc 维度字段
 */
/// <reference path="./commom.d.ts" />
declare namespace DimensionStore {
  // import type { _GettersTree } from 'pinia';
  // extends _GettersTree<DimensionState>
  /**
   * @desc 维度字段
   * @interface DimensionOption
   * @property {string} name 列名
   * @property {string} comment 列注释
   * @property {string} type 列类型
   */
  type DimensionOption = ColumnStore.ColumnOption & {
    // 无效的字段
    __invalid?: boolean
  }

  type DimensionKey = 'dimension'

  type DimensionState = {
    dimensions: Array<DimensionOption>
  }

  /**
   * @desc getter 名称
   */
  type GetterName<T extends string> = `get${Capitalize<T>}`;

  /**
   * @desc getter
   */
  type DimensionGetters<S> = {
    [K in keyof S as GetterName<K & string>]: (state: S) => S[K];
  };

  /**
   * @desc action 名称
   */
  type ActionName<T extends string> = `set${Capitalize<T>}`;
  /**
   * @desc action
   */
  type DimensionActions = {
    [K in keyof DimensionState as ActionName<K & string>]: (value: DimensionState[K]) => void;
  } & {
    addDimensions: (value: DimensionOption[]) => void;
    removeDimension: (value: number) => void;
  };
}
