
/**
 * @desc 分析页面逻辑处理
 */
export const handler = () => {
    const columnStore = useColumnStore();
    const filterStore = useFilterStore();
    const orderStore = useOrderStore();
    const dimensionStore = useDimensionStore();
    const groupStore = useGroupStore();
    const chartConfigStore = useChartConfigStore();
    const chartStore = useChartStore();
    /**
     * @desc 查询表格列表
     * @returns {Promise<void>}
     */
    const queryTableList = async () => {
        const result = await $fetch('/api/analyse/queryTableList')
        if (result.code === 200) {
            columnStore.setDataSourceOptions(result.data as Array<{ label: string; value: string }> || [])
        } else {
            columnStore.setDataSourceOptions([])
        }
    }
    /**
     * @desc 查询表格列
     * @param tableName
     * @returns {Promise<void>}
     */
    const queryTableColumns = async (tableName: string) => {
        const result = await $fetch('/api/analyse/queryTableColumns', {
            method: 'GET',
            params: {
                tableName
            }
        })
        if (result.code === 200) {
            const cloumns = result.data?.map((item) => {
                return {
                    ...item,
                    // 刚从数据库出来的时候 只有 columnName columnComment columnType 
                    // 所以到列配置的时候 需要给他加上 是否选中 属性
                    dimensionChoosed: false,
                    groupChoosed: false,
                }
            })
            columnStore.setColumns(cloumns || [])
        } else {
            columnStore.setDataSourceOptions([])
        }
    }
    /**
     * @desc 监听表格数据源变化
     */
    watch(() => columnStore.getDataSource, (dataSource) => {
        if(!dataSource) return
        queryTableColumns(dataSource)
        // 如果数据源变化，清空筛选条件
        filterStore.setFilters([])
        // 如果数据源变化，清空排序条件
        orderStore.setOrders([])
        // 如果数据源变化，清空分组条件
        groupStore.setGroups([])
        // 如果数据源变化，清空维度条件
        dimensionStore.setDimensions([])
    },{
        immediate:true
    })
    /**
     * @desc 需要查询表格数据的参数
     */
    const queryChartDataParams = computed(() => {
        return {
            dataSource: columnStore.getDataSource,
            filters: filterStore.getFilters,
            orders: orderStore.getOrders,
            groups: groupStore.getGroups,
            dimensions: dimensionStore.getDimensions,
            limit: chartConfigStore.getCommonChartConfig.limit,
        }
    })
    /**
   * @desc 图表推荐策略类
   * @param {ChartStore.ChartState['chartType']} chartType
   * @returns {string}
   */
    const chartSuggestStrategies = (
        chartType: ChartStore.ChartState['chartType']
    ) => {
        const dimensions = dimensionStore.getDimensions
        const groups = groupStore.getGroups
        const chartNames = {
            table: '表格',
            interval: '柱状图',
            line: '折线图',
            pie: '饼图'
        }
        switch (chartType) {
            case 'table':
                if (dimensions.length > 0 || groups.length > 0) {
                    return ''
                } else {
                    return `${chartNames[chartType]}至少需要一个值或者一个分组`
                }
            case 'interval':
            case 'line':
                if (dimensions.length > 0 && groups.length > 0) {
                    return ''
                } else {
                    return `${chartNames[chartType]}至少需要一个值和一个分组`
                }
            case 'pie':
                if (
                    dimensions.length === 1 &&
                    groups.length === 1
                ) {
                    return ''
                } else {
                    return `${chartNames[chartType]}只需要一个值和一个分组`
                }
            default:
                return ''
        }
    }
    /**
     * @desc 查询表格数据
     * @returns {Promise<void>}
     */
    const queryChartData = async () => {
        const chartType = chartStore.getChartType 
        const errorMessage = chartSuggestStrategies(chartType)
        chartStore.setChartErrorMessage(errorMessage)
        if (errorMessage) {
            return
        }
        const { dataSource, dimensions } = queryChartDataParams.value
        if (!dataSource) return
        if (!dimensions.length) return
       
        chartStore.setChartLoading(true)
        const result = await $fetch('/api/analyse/getAnswer', {
            method: 'POST',
            // 请求参数
            body: queryChartDataParams.value
        })
        if (result.code === 200) {
            chartStore.setChartData(result.data || [])
        } else {
            chartStore.setChartData([])
            chartStore.setChartErrorMessage(result.message)
        }
        chartStore.setChartLoading(false)
    }

    /**
     * @desc 监听查询表格数据的参数变化
     */
    watch(queryChartDataParams, () => {
        queryChartData()
    }, {
        deep: true,
        immediate: true
    })



    onMounted(async () => {
        queryTableList()
        // queryChartData()
    })
}