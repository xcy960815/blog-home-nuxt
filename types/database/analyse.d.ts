

/**
 * @desc 从数据库出来的表信息
 */
declare namespace TableInfoModule {
  /**
   * @desc 左侧数据源列表
   */
  export type TableListOption = {
    tableName?: string
  }

  /**
   * @desc 左侧数据源字段类型
   */
  export type TableColumnOption = {
    columnName?: string
    columnType?: string
    columnComment?: string
  }
}

