/**
 * @desc 初始化 table-chart 组件的数据
 * @param {TableChart.InitDataParams} props
 * @returns {TableChart.InitDataReturn}
 */
export const initData = (props: TableChart.InitDataParams) => {
  const pageNum = ref(1)
  const pageSize = ref(10)
  const total = computed(() => {
    return props.data.length
  })
  /**
   * @desc 获取当前列的最大长度
   */
  const tableHeader = computed<
    TableChart.TableHeaderOption[]
  >(() => {
    // 获取当前表格的所有字段
    const fields = [
      ...props.xAxisFields,
      ...props.yAxisFields
    ]
    const tableHeader = fields.map((field) => {
      const currentColumnData = tableData.value.map(
        (item) =>
          String(item[field.alias ? field.alias : ''])
      )
      currentColumnData.push(
        field.displyName || field.alias || field.name
      )
      return {
        ...field,
        minWidth: props.autoWidth
          ? getMaxLength(currentColumnData) + 64
          : undefined
      }
    })

    return tableHeader
  })
  /**
   * @desc 表格数据
   */
  const tableData = computed(() => {
    return props.data
      .map((item) => {
        return {
          ...item
        }
      })
      .slice(
        (pageNum.value - 1) * pageSize.value,
        pageNum.value * pageSize.value
      )
  })

  return {
    pageNum,
    pageSize,
    total,
    tableHeader,
    tableData
  }
}
