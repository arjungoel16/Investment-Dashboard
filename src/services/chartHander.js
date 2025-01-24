// chart.js

import Chart from 'chart.js/auto';

/**
 * Creates a reusable function to render a chart.
 * @param {string} canvasId - The ID of the canvas element where the chart will be rendered.
 * @param {Object} data - The chart data including labels and datasets.
 * @param {Object} options - Chart configuration options.
 */
export function createChart(canvasId, data, options = {}) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  return new Chart(ctx, {
    type: 'line',
    data,
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: options.xAxisLabel || 'X-Axis',
          },
        },
        y: {
          title: {
            display: true,
            text: options.yAxisLabel || 'Y-Axis',
          },
        },
      },
      ...options.additionalOptions,
    },
  });
}

/**
 * Generates sample data for the chart.
 * @returns {Object} Sample chart data.
 */
export function generateSampleData() {
  return {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Sample Data',
        data: [10, 20, 30, 40, 50, 60],
        borderColor: 'blue',
        fill: false,
      },
    ],
  };
}
