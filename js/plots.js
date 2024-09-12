// Update the charts with the selected scheme
function renderCharts(colors) {
    const commonLayout = {
        margin: { l: 40, r: 20, t: 50, b: 40, pad: 10 },
        xaxis: { title: 'X-axis' },
        yaxis: { title: 'Y-axis' },
    };

    createBarChart(colors, commonLayout);
    createBoxPlot(colors, commonLayout);
    createScatterPlot(colors, commonLayout);
    createLineChart(colors, commonLayout);
}

// Bar chart (Plotly)
function createBarChart(colors, layout) {
    const x = colors.map((_, i) => `Bar ${i + 1}`);
    const y = colors.map(() => (Math.random() + 0.1) * 10); // Random data for the bar heights

    const trace = {
        x: x,
        y: y,
        type: 'bar',
        marker: {
            color: colors // Use colors array directly
        }
    };

    const barLayout = { ...layout, title: 'Bar Chart' };
    Plotly.newPlot('barChart', [trace], barLayout);
}

// Box plot (Plotly)
function createBoxPlot(colors, layout) {
    const traces = colors.map((color, i) => ({
        y: Array.from({ length: 10 }, () => Math.random() * 10),
        type: 'box',
        name: `Box ${i + 1}`,
        marker: { color: color } // Apply consistent color
    }));

    const boxLayout = { ...layout, title: 'Box Plot' };
    Plotly.newPlot('boxChart', traces, boxLayout);
}

// Scatter plot (Plotly)
function createScatterPlot(colors, layout) {
    const traces = colors.map((color, i) => ({
        x: Array.from({ length: 10 }, () => Math.random()),
        y: Array.from({ length: 10 }, () => Math.random() * 10),
        mode: 'markers',
        type: 'scatter',
        name: `Scatter ${i + 1}`,
        marker: { color: color, size: 12 } // Apply consistent color
    }));

    const scatterLayout = { ...layout, title: 'Scatter Plot' };
    Plotly.newPlot('scatterChart', traces, scatterLayout);
}

// Line chart (Plotly)
function createLineChart(colors, layout) {
    const x = Array.from({ length: 15 }, (_, i) => i + 1);  // Fixed x-axis values
    const traces = colors.map((color, i) => ({
        x: x,
        y: x.map(() => 10 + Math.random() * 5 + i * 5),  // Random data to simulate lines
        mode: 'lines',
        name: `Line ${i + 1}`,
        line: { color: color } // Apply consistent color
    }));

    const lineLayout = { ...layout, title: 'Line Chart' };
    Plotly.newPlot('lineChart', traces, lineLayout);
}
