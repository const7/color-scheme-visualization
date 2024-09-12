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

// Line chart with SD (Plotly)
function createLineChart(colors, layout) {
    const x = Array.from({ length: 15 }, (_, i) => i + 1);  // Fixed x-axis values
    const traces = [];

    colors.forEach((color, i) => {
        const baseY = 10 + i * 10;  // Adjust base value for each line to reduce overlap
        const meanLine = x.map(() => baseY + Math.random() * 5);
        const sd = x.map(() => 1 + Math.random() * colors.length);

        // Lower bound trace
        traces.push({
            x: x,
            y: meanLine.map((y, idx) => y - sd[idx]),
            line: { color: 'transparent' },  // No visible line for lower bound
            showlegend: false,
        });

        // Mean line trace
        traces.push({
            x: x,
            y: meanLine,
            fill: 'tonexty',    // Fill between lower and mean line
            fillcolor: `rgba(${hexToRgb(color)}, 0.2)`,
            mode: 'lines',
            name: `Line ${i + 1}`,
            line: { color: color },
        });

        // Upper bound trace
        traces.push({
            x: x,
            y: meanLine.map((y, idx) => y + sd[idx]),
            fill: 'tonexty',    // Fill between mean and upper bound
            fillcolor: `rgba(${hexToRgb(color)}, 0.2)`,
            line: { color: 'transparent' },
            showlegend: false,
        });
    });

    const lineLayout = { ...layout, title: 'Line Chart' };
    Plotly.newPlot('lineChart', traces, lineLayout);
}

// Helper function to convert HEX color to RGB format
function hexToRgb(hex) {
    let bigint = parseInt(hex.slice(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return `${r},${g},${b}`;
}
