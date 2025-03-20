// 缓存图表数据
let chartData = {
    barData: null,
    boxData: null,
    scatterData: null,
    lineData: null,
    lastColors: null
};

// Update the charts with the selected scheme
function renderCharts(colors, opacity = 1.0) {
    // 确保透明度值在有效范围内
    opacity = Math.max(0, Math.min(1, opacity));
    
    // 检查颜色方案是否改变
    const colorsChanged = !chartData.lastColors || 
                         colors.length !== chartData.lastColors.length || 
                         colors.some((color, i) => color !== chartData.lastColors[i]);
    
    // 如果颜色方案改变，重置所有缓存数据
    if (colorsChanged) {
        chartData.lastColors = [...colors];
        chartData.barData = null;
        chartData.boxData = null;
        chartData.scatterData = null;
        chartData.lineData = null;
    }
    
    const commonLayout = {
        margin: { l: 50, r: 30, t: 50, b: 50, pad: 5 },
        font: { family: 'Inter, sans-serif', size: 12 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        xaxis: { 
            showgrid: false,
            zeroline: false,
            showline: true,
            linecolor: '#333',
            linewidth: 1,
            mirror: false,
            ticks: '', // 默认不显示刻度tick
            tickfont: { family: 'Inter, sans-serif', size: 11, color: '#333' }
        },
        yaxis: { 
            showgrid: false,
            zeroline: false,
            showline: true,
            linecolor: '#333',
            linewidth: 1,
            mirror: false,
            ticks: 'inside', // y轴显示刻度tick，朝内显示
            ticklen: 3,       // tick长度减少到3
            tickwidth: 1,     // tick宽度
            tickcolor: '#333', // tick颜色
            tickfont: { family: 'Inter, sans-serif', size: 11, color: '#333' }
        },
        hoverlabel: {
            font: { family: 'Inter, sans-serif', size: 12 },
            bordercolor: '#e9ecef'
            // We'll customize bgcolor for each trace
        },
        title: {
            font: { family: 'Inter, sans-serif', size: 16, weight: 500 },
            y: 0.95
        },
        transition: {
            duration: 500,
            easing: 'cubic-in-out'
        }
    };

    createBarChart(colors, commonLayout, opacity);
    createBoxPlot(colors, commonLayout, opacity);
    createScatterPlot(colors, commonLayout, opacity);
    createLineChart(colors, commonLayout, opacity);
}

// Bar chart (Plotly)
function createBarChart(colors, layout, opacity = 1.0) {
    // 如果没有缓存数据，生成新数据
    if (!chartData.barData) {
        const x = colors.map((_, i) => `Bar ${i + 1}`);
        const y = colors.map(() => (Math.random() + 0.1) * 10);
        chartData.barData = { x, y };
    }
    
    const trace = {
        x: chartData.barData.x,
        y: chartData.barData.y,
        type: 'bar',
        marker: {
            color: colors.map(color => adjustOpacity(color, opacity)),
            line: {
                color: 'rgba(255, 255, 255, 0.5)',
                width: 1
            }
        },
        hovertemplate: '<b>%{x}</b><br>Value: %{y:.1f}<extra></extra>',
        hoverlabel: {
            bgcolor: 'white',
            font: { color: '#333' }
        }
    };

    const barLayout = { 
        ...layout, 
        title: {
            text: 'Bar Chart',
            font: { 
                family: 'Inter, sans-serif', 
                size: 16, 
                weight: 'bold'  // 添加加粗
            }
        },
        bargap: 0.3,
        xaxis: {
            ...layout.xaxis,
            ticks: '', // 类别型不需要tick
        },
        yaxis: {
            ...layout.yaxis,
            title: { text: 'Value', standoff: 10 }
        }
    };
    
    const config = { 
        responsive: true,
        displayModeBar: false
    };
    
    Plotly.newPlot('barChart', [trace], barLayout, config);
}

// Box plot (Plotly)
function createBoxPlot(colors, layout, opacity = 1.0) {
    // 如果没有缓存数据，生成新数据
    if (!chartData.boxData) {
        chartData.boxData = colors.map(() => Array.from({length: 30}, () => Math.random() * 8 + 1));
    }
    
    const data = [];
    
    // 根据颜色数量调整boxwidth
    let boxwidth = 0.6;
    if (colors.length > 2) {
        boxwidth = 0.8;
    }
    
    for (let i = 0; i < colors.length; i++) {
        const colorWithOpacity = adjustOpacity(colors[i], opacity);
        
        data.push({
            y: i < chartData.boxData.length ? chartData.boxData[i] : Array.from({length: 30}, () => Math.random() * 8 + 1),
            type: 'box',
            name: `Box ${i+1}`,
            marker: {color: colorWithOpacity},
            boxpoints: 'suspectedoutliers',
            boxmean: true,
            line: {width: 2},
            fillcolor: colorWithOpacity,
            opacity: 0.7,
            boxwidth: boxwidth,
            jitter: 0.2,
            hovertemplate: '<b>%{y:.2f}</b><extra>%{fullData.name}</extra>',
            hoverlabel: {
                bgcolor: 'white',
                bordercolor: colors[i],
                font: { color: '#333' }
            }
        });
    }
    
    const boxLayout = {
        ...layout,
        title: {
            text: 'Box Plot',
            font: { 
                family: 'Inter, sans-serif', 
                size: 16, 
                weight: 'bold'  // 添加加粗
            }
        },
        showlegend: false,
        autosize: true,
        margin: {l: 40, r: 30, t: 40, b: 50},
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: {family: "'Inter', sans-serif", size: 12, color: '#333'},
        boxmode: colors.length > 2 ? 'overlay' : 'group', // 多于2个颜色时使用overlay模式
        boxgap: 0.3,
        xaxis: {
            ...layout.xaxis,
            ticks: '', // 类别型不需要tick
        }
    };
    
    const config = {
        responsive: true,
        displayModeBar: false
    };
    
    Plotly.newPlot('boxChart', data, boxLayout, config);
}

// Scatter plot (Plotly)
function createScatterPlot(colors, layout, opacity = 1.0) {
    // 如果没有缓存数据，生成新数据
    if (!chartData.scatterData) {
        chartData.scatterData = colors.map(() => ({
            x: Array.from({ length: 12 }, () => Math.floor(Math.random() * 10) + 1), // 使用整数
            y: Array.from({ length: 12 }, () => Math.random() * 10)
        }));
    }
    
    const traces = colors.map((color, i) => {
        // 确保有数据，即使颜色比之前多
        const pointData = i < chartData.scatterData.length ? 
            chartData.scatterData[i] : 
            {
                x: Array.from({ length: 12 }, () => Math.floor(Math.random() * 10) + 1), // 使用整数
                y: Array.from({ length: 12 }, () => Math.random() * 10)
            };
        
        return {
            x: pointData.x,
            y: pointData.y,
            mode: 'markers',
            type: 'scatter',
            name: `Series ${i + 1}`,
            marker: { 
                color: adjustOpacity(color, opacity), 
                size: 12,
                opacity: 0.8,
                line: {
                    color: 'white',
                    width: 1
                }
            },
            hovertemplate: '<b>Series %{fullData.name}</b><br>x: %{x}<br>y: %{y:.2f}<extra></extra>',
            hoverlabel: {
                bgcolor: 'white',
                bordercolor: color,
                font: { color: '#333' }
            }
        };
    });

    const scatterLayout = { 
        ...layout, 
        title: {
            text: 'Scatter Plot',
            font: { 
                family: 'Inter, sans-serif', 
                size: 16, 
                weight: 'bold'  // 添加加粗
            }
        },
        showlegend: false,  // 删除图例
        xaxis: {
            ...layout.xaxis,
            title: { text: 'X Value', standoff: 10 },
            ticks: 'inside', // 数值型需要tick，朝内显示
            ticklen: 3,
            tickwidth: 1,
            tickcolor: '#333',
            dtick: 2, // 每2个单位一个刻度，避免过于密集
            tickformat: 'd' // 强制使用整数格式
        },
        yaxis: {
            ...layout.yaxis,
            title: { text: 'Y Value', standoff: 10 }
        }
    };
    
    const config = { 
        responsive: true,
        displayModeBar: false
    };
    
    Plotly.newPlot('scatterChart', traces, scatterLayout, config);
}

// Line chart with SD (Plotly)
function createLineChart(colors, layout, opacity = 1.0) {
    // 如果没有缓存数据，生成新数据
    if (!chartData.lineData) {
        const x = Array.from({ length: 15 }, (_, i) => i + 1); // 使用整数
        chartData.lineData = {
            x: x,
            series: colors.map((_, i) => {
                const baseY = 5 + i * 5;
                const meanLine = x.map(() => baseY + Math.random() * 3);
                const sd = x.map(() => 0.5 + Math.random() * 1.5);
                return { meanLine, sd };
            })
        };
    }
    
    const traces = [];
    const x = chartData.lineData.x;

    colors.forEach((color, i) => {
        // 确保有数据，即使颜色比之前多
        let seriesData;
        if (i < chartData.lineData.series.length) {
            seriesData = chartData.lineData.series[i];
        } else {
            const baseY = 5 + i * 5;
            const meanLine = x.map(() => baseY + Math.random() * 3);
            const sd = x.map(() => 0.5 + Math.random() * 1.5);
            seriesData = { meanLine, sd };
            // 如果新增了颜色，也保存对应的数据
            chartData.lineData.series.push(seriesData);
        }
        
        const colorWithOpacity = adjustOpacity(color, opacity);
        const rgbaColor = `rgba(${hexToRgb(color)}, ${opacity * 0.15})`;

        // Lower bound trace
        traces.push({
            x: x,
            y: seriesData.meanLine.map((y, idx) => y - seriesData.sd[idx]),
            line: { color: 'transparent' },
            showlegend: false,
            hoverinfo: 'skip'
        });

        // Mean line trace
        traces.push({
            x: x,
            y: seriesData.meanLine,
            fill: 'tonexty',
            fillcolor: rgbaColor,
            mode: 'lines',
            name: `Series ${i + 1}`,
            line: { 
                color: colorWithOpacity,
                width: 3
            },
            hovertemplate: '<b>Series %{fullData.name}</b><br>x: %{x}<br>y: %{y:.2f}<extra></extra>',
            hoverlabel: {
                bgcolor: 'white',
                bordercolor: color,
                font: { color: '#333' }
            }
        });

        // Upper bound trace
        traces.push({
            x: x,
            y: seriesData.meanLine.map((y, idx) => y + seriesData.sd[idx]),
            fill: 'tonexty',
            fillcolor: rgbaColor,
            line: { color: 'transparent' },
            showlegend: false,
            hoverinfo: 'skip'
        });
    });

    const lineLayout = { 
        ...layout, 
        title: {
            text: 'Line Chart',
            font: { 
                family: 'Inter, sans-serif', 
                size: 16, 
                weight: 'bold'  // 添加加粗
            }
        },
        showlegend: false,
        margin: {l: 40, r: 30, t: 40, b: 50},
        xaxis: {
            ...layout.xaxis,
            title: { text: 'X Value', standoff: 10 },
            ticks: 'inside', // 数值型需要tick，朝内显示
            ticklen: 3,
            tickwidth: 1,
            tickcolor: '#333',
            dtick: 3, // 每3个单位一个刻度，避免过于密集
            tickformat: 'd' // 强制使用整数格式
        },
        yaxis: {
            ...layout.yaxis,
            title: { text: 'Y Value', standoff: 10 }
        }
    };
    
    const config = { 
        responsive: true,
        displayModeBar: false
    };
    
    Plotly.newPlot('lineChart', traces, lineLayout, config);
}

// Helper function to convert HEX color to RGB format
function hexToRgb(hex) {
    let bigint = parseInt(hex.slice(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return `${r},${g},${b}`;
}

// Helper function to adjust color opacity
function adjustOpacity(hexColor, opacity) {
    const rgb = hexToRgb(hexColor);
    return `rgba(${rgb},${opacity})`;
}
