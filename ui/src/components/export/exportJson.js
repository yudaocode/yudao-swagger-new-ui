/**
 * JSON 导出功能
 */

import { getSelectedOperations, buildFilteredExportData, downloadFile } from './exportUtils'

/**
 * 导出 JSON 文件
 */
export const exportJson = (selectedEndpoints, apiData) => {
  const operations = getSelectedOperations(selectedEndpoints, apiData)
  const exportData = buildFilteredExportData(operations, apiData)
  const json = JSON.stringify(exportData, null, 2)
  const fileName = apiData.info?.title 
    ? `${apiData.info.title.replace(/\s+/g, '-')}-openapi.json` 
    : 'openapi.json'
  
  downloadFile(json, fileName, 'application/json')
}
