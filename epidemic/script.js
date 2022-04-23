import data from './data.js'

function render(options) {
    new frappe.Chart("#chart1", {
        title: "上海新增确诊人数",
        data: {
            labels: data.labels,
            datasets: [
                {
                    name: "新增确诊",
                    chartType: "line",
                    values: data.data1,
                }
            ],
        },
        type: 'axis-mixed', // or 'line', 'bar', 'axis-mixed', 'pie', 'percentage', 'heatmap'
        height: 350,
        colors: ['#743ee2'],
        animate: true,
        axisOptions: {
            xAxisMode: 'span', // 'span' or 'tick'
            yAxisMode: 'span', // 'span' or 'tick'
            xIsSeries: true,
        },
        tooltipOptions: {},
        barOptions: {
            spaceRatio: 0.5,
            stacked: true,
        },
        lineOptions: {},
        isNavigable: true,
        valuesOverPoints: false,
        truncateLegends: true,
        ...options,
    })
    new frappe.Chart("#chart2", {
        title: "上海新增无症状感染人数",
        data: {
            labels: data.labels,
            datasets: [
                {
                    name: "新增无症状感染者",
                    chartType: "line",
                    values: data.data2,
                }
            ],
        },
        type: 'axis-mixed', // or 'line', 'bar', 'axis-mixed', 'pie', 'percentage', 'heatmap'
        height: 350,
        colors: ['#7cd6fd'],
        animate: true,
        axisOptions: {
            xAxisMode: 'span', // 'span' or 'tick'
            yAxisMode: 'span', // 'span' or 'tick'
            xIsSeries: true,
        },
        barOptions: {
            spaceRatio: 0.5,
            stacked: false,
        },
        isNavigable: true,
        valuesOverPoints: false,
        truncateLegends: true,
        ...options,
    })
}

const breakpoint = 500
let isSmallScreen = window.innerWidth <= breakpoint
render({ valuesOverPoints: !isSmallScreen })

window.addEventListener('resize', (event) => {
    const innerWidth = event.target.innerWidth
    if (!isSmallScreen && innerWidth <= breakpoint) {
        render({ valuesOverPoints: false })
        isSmallScreen = true
    } else if (isSmallScreen && innerWidth > breakpoint) {
        render({ valuesOverPoints: true })
        isSmallScreen = false
    }
})
