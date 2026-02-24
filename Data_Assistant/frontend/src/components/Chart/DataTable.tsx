import { useState, useMemo } from 'react'

interface DataTableProps {
  data: Record<string, unknown>[]
  maxRows?: number
}

type SortDirection = 'asc' | 'desc' | null

export function DataTable({ data, maxRows = 10 }: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [filterColumn, setFilterColumn] = useState<string | null>(null)
  const [filterValue, setFilterValue] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const columns = useMemo(() => {
    if (!data || data.length === 0) return []
    return Object.keys(data[0] || {})
  }, [data])

  // 处理排序
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortColumn(null)
        setSortDirection(null)
      }
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // 处理筛选和排序后的数据
  const processedData = useMemo(() => {
    let result = [...data]

    // 筛选
    if (filterColumn && filterValue) {
      result = result.filter(row => {
        const cellValue = String(row[filterColumn] || '').toLowerCase()
        return cellValue.includes(filterValue.toLowerCase())
      })
    }

    // 排序
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]

        let comparison = 0
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal
        } else {
          comparison = String(aVal || '').localeCompare(String(bVal || ''), 'zh-CN')
        }

        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [data, filterColumn, filterValue, sortColumn, sortDirection])

  const displayData = processedData.slice(0, maxRows)
  const hasMore = processedData.length > maxRows

  if (!data || data.length === 0) {
    return null
  }

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return (
        <svg className="w-3 h-3 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 8l5-5 5 5H5zm10 4l-5 5-5-5h10z" />
        </svg>
      )
    }
    if (sortDirection === 'asc') {
      return (
        <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 8l5-5 5 5H5z" />
        </svg>
      )
    }
    return (
      <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M15 12l-5 5-5-5h10z" />
      </svg>
    )
  }

  return (
    <div className="mt-4">
      {/* 标题和工具栏 */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-700">数据预览</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              showFilters ? 'bg-primary-100 text-primary-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {showFilters ? '隐藏筛选' : '筛选'}
          </button>
          <span className="text-xs text-slate-400">
            {processedData.length !== data.length && (
              <span className="text-primary-600 mr-1">已筛选 {processedData.length} 条</span>
            )}
            {hasMore ? `显示前 ${maxRows} 条，共 ${processedData.length} 条` : `共 ${processedData.length} 条`}
          </span>
        </div>
      </div>

      {/* 筛选区域 */}
      {showFilters && (
        <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600">列:</label>
              <select
                value={filterColumn || ''}
                onChange={(e) => setFilterColumn(e.target.value || null)}
                className="text-xs border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">全部</option>
                {columns.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <label className="text-xs text-slate-600">包含:</label>
              <input
                type="text"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder="输入筛选内容..."
                className="text-xs border border-slate-300 rounded px-2 py-1 flex-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            {filterValue && (
              <button
                onClick={() => {
                  setFilterValue('')
                  setFilterColumn(null)
                }}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                清除
              </button>
            )}
          </div>
        </div>
      )}

      {/* 表格 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {columns.map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>{col}</span>
                      {getSortIcon(col)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayData.length > 0 ? (
                displayData.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-3 text-slate-700">
                        {row[col] !== null && row[col] !== undefined
                          ? String(row[col])
                          : '-'}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                    无匹配数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
