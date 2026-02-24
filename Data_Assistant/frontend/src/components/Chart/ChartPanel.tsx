import { useChartStore } from '@/stores/chartStore'

export function ChartPanel() {
  const { chartConfig, rawData } = useChartStore()

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">可视化图表</h2>
        <p className="text-sm text-slate-500">数据可视化展示</p>
      </div>
      
      {/* 图表区域 */}
      <div className="flex-1 overflow-y-auto p-6">
        {!chartConfig ? (
          <div className="text-center text-slate-400 py-12">
            <div className="text-4xl mb-4">📊</div>
            <p>查询数据后将在此展示图表</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div id="chart-container" className="w-full h-64">
              {/* ECharts 将在这里渲染 */}
              <div className="flex items-center justify-center h-full text-slate-400">
                图表区域 (ECharts)
              </div>
            </div>
          </div>
        )}
        
        {/* 数据表格 */}
        {rawData.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-slate-600 mb-2">数据预览</h3>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {Object.keys(rawData[0] || {}).map((key) => (
                        <th key={key} className="px-4 py-2 text-left font-medium text-slate-600">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rawData.slice(0, 5).map((row, index) => (
                      <tr key={index} className="border-t border-slate-100">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="px-4 py-2 text-slate-700">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rawData.length > 5 && (
                <div className="px-4 py-2 text-sm text-slate-500 bg-slate-50">
                  显示前 5 条，共 {rawData.length} 条数据
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
