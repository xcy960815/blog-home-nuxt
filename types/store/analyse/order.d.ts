/// <reference path="./commom.d.ts" />
/**
 * @desc 左侧列字段
 */
declare namespace OrderStore {
  type OrderKey = 'order'
  type OrderType = 'asc' | 'desc' | 'default'
  /**
   * @desc 左侧列字段
   * @interface OrderOption
   * @property {string} name 列名
   * @property {string} comment 列注释
   * @property {string} type 列类型
   */
  interface OrderOption extends  ColumnStore.Column {
    orderType:OrderType
  }

  type OrderState = {
    orders: OrderOption[]
  }

  /**
   * @desc getter 名称
   */
  type GetterName<T extends string> = `get${Capitalize<T>}`;

  /**
   * @desc getter
   */
  type OrderGetters<S> = {
    [K in keyof S as GetterName<K & string>]: (state: S) => S[K];
  };

  /**
    * @desc action 名称
    */
  type ActionName<T extends string> = `set${Capitalize<T>}`;
  /**
   * @desc action
   */
  type OrderActions = {
    [K in keyof OrderState as ActionName<K & string>]: (value: OrderState[K]) => void;
  } & {
    updateOrder: (value: OrderOption, index: number) => void;
    addOrders: (value: OrderOption[]) => void;
    removeOrder: (value: number) => void;
  }
}
