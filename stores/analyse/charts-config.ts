/**
 * @desc 图表配置 store
 * @param {string} ChartConfigKey
 * @param {ChartConfigState} ChartConfigState
 * @param {ChartConfigGetters} ChartConfigGetters
 * @param {ChartConfigActions} ChartConfigActions
 * @returns {Store}
 */
export const useChartConfigStore = definePiniaStore<
  ChartConfigStore.ChartConfigKey,
  ChartConfigStore.ChartConfigState,
  ChartConfigStore.ChartConfigGetters<ChartConfigStore.ChartConfigState>,
  ChartConfigStore.ChartConfigActions
>('chartConfig',
  {
    state: () => ({
      chartConfigDrawer: false,
      commonChartConfig: {
        description: '',
        limit: 1000,
        suggest: false,
        mixStrategy: 'daily',
        shareStrategy: ''
      },
      chartConfig: {
        line: {
          showPoint: false,
          showLabel: false,
          smooth: false,
          autoDualAxis: false,
          horizontalBar: false
        },
        interval: {
          displayMode: 'levelDisplay',
          showPercentage: false,
          showLabel: false,
          horizontalDisplay: false,
          horizontalBar: false
        },
        pie: {
          showLabel: false,
          chartType: 'pie'
        },
        table: {
          displayMode: 'originalDisplay',
          showCompare: false,
          conditions: []
        }
      }
    }),
    getters: {
      getChartConfigDrawer(state) {
        return state.chartConfigDrawer
      },
      getCommonChartConfig(state) {
        return state.commonChartConfig
      },
      getChartConfig(state) {
        return state.chartConfig
      }
    },
    actions: {
      setChartConfigDrawer(drawer) {
        this.chartConfigDrawer = drawer
      },
      setCommonChartConfig(config) {
        this.commonChartConfig = config
      },
      setChartConfig(config) {
        this.chartConfig = config
      },
      setTableChartConditions(conditions) {
        this.chartConfig.table.conditions = conditions
      }
    }
  })

