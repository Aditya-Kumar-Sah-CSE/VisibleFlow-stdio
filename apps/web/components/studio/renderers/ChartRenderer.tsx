'use client';

import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEditorStore } from '@/stores/editor-store';
import {
  BarChart3,
  LineChart,
  PieChart,
  Table as TableIcon,
  Upload,
  Plus,
  Trash2,
  Palette,
  Sparkles,
} from 'lucide-react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

export default function ChartRenderer() {
  const { project, activePageIndex, updateChartConfig } = useEditorStore();
  const activePage = project?.pages[activePageIndex];

  const chartConfig = activePage?.chartConfig || {
    chartType: 'bar',
    title: 'Enterprise Metrics Overview',
    subtitle: 'Performance Data (2025)',
    theme: 'corporate',
    showLegend: true,
    showTooltips: true,
    showGridLines: true,
    animation: true,
    dataset: {
      headers: ['Category', 'Q1 Revenue', 'Q2 Revenue', 'Q3 Target'],
      rows: [
        ['Enterprise SaaS', 140, 195, 220],
        ['Developer Tools', 90, 130, 160],
        ['AI Cloud APIs', 210, 310, 400],
        ['Professional Services', 60, 75, 80],
      ],
    },
  };

  const [activeTab, setActiveTab] = useState<'chart' | 'data'>('chart');
  const [dataGrid, setDataGrid] = useState(chartConfig.dataset);

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const updatedRows = [...dataGrid.rows];
    const parsedVal = isNaN(Number(value)) || value.trim() === '' ? value : Number(value);
    updatedRows[rowIndex][colIndex] = parsedVal;
    const newDataset = { ...dataGrid, rows: updatedRows };
    setDataGrid(newDataset);
    updateChartConfig({ ...chartConfig, dataset: newDataset });
  };

  const handleHeaderChange = (colIndex: number, value: string) => {
    const updatedHeaders = [...dataGrid.headers];
    updatedHeaders[colIndex] = value;
    const newDataset = { ...dataGrid, headers: updatedHeaders };
    setDataGrid(newDataset);
    updateChartConfig({ ...chartConfig, dataset: newDataset });
  };

  const handleAddRow = () => {
    const emptyRow = dataGrid.headers.map((_, i) => (i === 0 ? `Item ${dataGrid.rows.length + 1}` : 100));
    const newDataset = { ...dataGrid, rows: [...dataGrid.rows, emptyRow] };
    setDataGrid(newDataset);
    updateChartConfig({ ...chartConfig, dataset: newDataset });
    toast.success('Row added');
  };

  const handleAddCol = () => {
    const colName = `Series ${dataGrid.headers.length}`;
    const newHeaders = [...dataGrid.headers, colName];
    const newRows = dataGrid.rows.map((row) => [...row, 100]);
    const newDataset = { headers: newHeaders, rows: newRows };
    setDataGrid(newDataset);
    updateChartConfig({ ...chartConfig, dataset: newDataset });
    toast.success('Column added');
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (result) => {
        if (result.data && result.data.length > 1) {
          const headers = result.data[0] as string[];
          const rows = (result.data.slice(1) as any[]).filter((r) => r.length === headers.length);
          const newDataset = { headers, rows };
          setDataGrid(newDataset);
          updateChartConfig({ ...chartConfig, dataset: newDataset });
          toast.success(`Imported ${rows.length} rows from CSV`);
        }
      },
    });
  };

  // Compile ECharts Options dynamically
  const echartsOption = useMemo(() => {
    const categories = dataGrid.rows.map((r) => String(r[0]));
    const seriesList = [];

    if (chartConfig.chartType === 'pie') {
      const pieData = dataGrid.rows.map((r) => ({
        name: String(r[0]),
        value: Number(r[1]) || 0,
      }));
      seriesList.push({
        name: dataGrid.headers[1] || 'Value',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#0f172a', borderWidth: 2 },
        data: pieData,
      });
    } else {
      for (let col = 1; col < dataGrid.headers.length; col++) {
        const seriesName = dataGrid.headers[col];
        const values = dataGrid.rows.map((r) => Number(r[col]) || 0);

        seriesList.push({
          name: seriesName,
          type: chartConfig.chartType === 'area' ? 'line' : chartConfig.chartType,
          data: values,
          smooth: true,
          areaStyle: chartConfig.chartType === 'area' ? { opacity: 0.3 } : undefined,
          itemStyle: { borderRadius: chartConfig.chartType === 'bar' ? [6, 6, 0, 0] : undefined },
        });
      }
    }

    return {
      title: {
        text: chartConfig.title,
        subtext: chartConfig.subtitle,
        textStyle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
        subtextStyle: { color: '#94a3b8', fontSize: 13 },
      },
      tooltip: {
        trigger: chartConfig.chartType === 'pie' ? 'item' : 'axis',
        show: chartConfig.showTooltips,
      },
      legend: {
        show: chartConfig.showLegend,
        bottom: '0%',
        textStyle: { color: '#cbd5e1' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '18%',
        containLabel: true,
        show: chartConfig.showGridLines,
        borderColor: '#334155',
      },
      xAxis:
        chartConfig.chartType === 'pie'
          ? undefined
          : {
              type: 'category',
              data: categories,
              axisLine: { lineStyle: { color: '#475569' } },
              axisLabel: { color: '#94a3b8' },
            },
      yAxis:
        chartConfig.chartType === 'pie'
          ? undefined
          : {
              type: 'value',
              splitLine: { lineStyle: { color: '#1e293b' } },
              axisLabel: { color: '#94a3b8' },
            },
      color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
      series: seriesList,
    };
  }, [dataGrid, chartConfig]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 select-none">
      {/* Chart Studio Control Header */}
      <div className="h-14 border-b border-slate-800 bg-slate-950 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Chart Type Selector */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => updateChartConfig({ ...chartConfig, chartType: 'bar' })}
              className={`p-1.5 rounded text-xs font-semibold flex items-center space-x-1 transition-colors ${
                chartConfig.chartType === 'bar' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bar</span>
            </button>
            <button
              onClick={() => updateChartConfig({ ...chartConfig, chartType: 'line' })}
              className={`p-1.5 rounded text-xs font-semibold flex items-center space-x-1 transition-colors ${
                chartConfig.chartType === 'line' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Line</span>
            </button>
            <button
              onClick={() => updateChartConfig({ ...chartConfig, chartType: 'pie' })}
              className={`p-1.5 rounded text-xs font-semibold flex items-center space-x-1 transition-colors ${
                chartConfig.chartType === 'pie' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Donut</span>
            </button>
          </div>

          <div className="w-px h-5 bg-slate-800 mx-2" />

          {/* View Toggle */}
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'chart' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Chart View
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              activeTab === 'data' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>Data Spreadsheet</span>
          </button>
        </div>

        {/* CSV Import */}
        <label className="cursor-pointer px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors">
          <Upload className="w-3.5 h-3.5 text-blue-400" />
          <span>Import CSV</span>
          <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
        </label>
      </div>

      {/* Main Body */}
      <div className="flex-1 p-8 overflow-auto flex items-center justify-center">
        {activeTab === 'chart' ? (
          <div className="w-full max-w-4xl h-[520px] bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl">
            <ReactECharts
              option={echartsOption}
              style={{ width: '100%', height: '100%' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        ) : (
          /* Live Spreadsheet Data Editor */
          <div className="w-full max-w-4xl bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Live Tabular Data Grid</h3>
                <p className="text-xs text-slate-400">Edit cells in real-time. Changes instantly update the chart.</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddRow}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 hover:border-blue-500 rounded text-xs font-semibold text-slate-200 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Row</span>
                </button>
                <button
                  onClick={handleAddCol}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 hover:border-blue-500 rounded text-xs font-semibold text-slate-200 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Column</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-300 border-b border-slate-800 font-bold">
                  <tr>
                    {dataGrid.headers.map((h, colIdx) => (
                      <th key={colIdx} className="p-2 border-r border-slate-800 last:border-r-0">
                        <input
                          type="text"
                          value={h}
                          onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                          className="bg-transparent font-bold text-blue-400 focus:outline-none w-full"
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dataGrid.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-slate-900/40">
                      {row.map((val, colIdx) => (
                        <td key={colIdx} className="p-2 border-r border-slate-800/60 last:border-r-0">
                          <input
                            type="text"
                            value={String(val)}
                            onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                            className="bg-transparent text-slate-200 focus:outline-none focus:text-white w-full"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

