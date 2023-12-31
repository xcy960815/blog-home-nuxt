export const initData = () => {
  /**
   * @description: 维度列样式
   * @returns { (column: ColumnStore.Column) => { column__item: boolean; column__item-choosed: boolean } }
   */
  const columnClasses = computed(() => (column: ColumnStore.Column) => {
    return {
      column__item: true,
      'column__item_dimension_choosed': column.dimensionChoosed,
      'column__item_group_choosed': column.groupChoosed,
    };
  });

  const columnStore = useColumnStore();

  /**
   * @desc 数据源
   * @returns {string}
   */
  const dataSource = computed({
    get:() => {
      return columnStore.getDataSource
    },
    set:(val) => {
      columnStore.setDataSource(val)
    }
  });

  /**
   * @desc 数据源选项
   * @returns {ColumnStore.dataSourceOption[]}
   */
  const dataSourceOptions = computed(() => columnStore.getDataSourceOptions);

  /**
   * @desc 维度字段列表
   * @returns {ColumnStore.Column[]}
   */
  const columnList = computed(() => {
    return columnStore.getColumns
  });
  
  /**
   * @desc 当前列
   * @returns {ColumnStore.Column}
   */
  const currentColumn = ref<ColumnStore.Column>();

  return {
    columnClasses,
    dataSource,
    dataSourceOptions,
    columnList,
    currentColumn,
  };
};
