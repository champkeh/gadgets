import data from './data.js'

function render(options) {
    new frappe.Chart("#chart1", {
        title: "上海新增确诊人数",
        data: {
            labels: data.labels,
            datasets: [
                {
                    values: data.data1,
                }
            ],
            yMarkers: [
                {
                    label: `${data.highestData1.date.substring(5)}  ${data.highestData1.count1}(最高点)`,
                    value: 3590,
                    options: {
                        labelPos: 'right'
                    }
                }
            ]
        },
        type: 'line', // or 'line', 'bar', 'axis-mixed', 'pie', 'percentage', 'heatmap'
        height: 350,
        colors: ['#b43e18'],
        animate: true,
        axisOptions: {
            xAxisMode: 'span', // 'span' or 'tick'
            yAxisMode: 'span', // 'span' or 'tick'
            xIsSeries: true,
        },
        tooltipOptions: {},
        lineOptions: {
            dotSize: 4,
            regionFill: 1,
            hideDots: 1,
            hideLine: 0,
            heatline: 1,
            spline: 0,
        },
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
                    values: data.data2,
                }
            ],
            yMarkers: [
                {
                    label: `${data.highestData2.date.substring(5)}  ${data.highestData2.count2}(最高点)`,
                    value: 25173,
                    options: {
                        labelPos: 'right'
                    }
                }
            ]
        },
        type: 'line', // or 'line', 'bar', 'axis-mixed', 'pie', 'percentage', 'heatmap'
        height: 350,
        colors: ['#7b50d2'],
        animate: true,
        axisOptions: {
            xAxisMode: 'span', // 'span' or 'tick'
            yAxisMode: 'span', // 'span' or 'tick'
            xIsSeries: true,
        },
        lineOptions: {
            dotSize: 4,
            regionFill: 1,
            hideDots: 1,
            hideLine: 0,
            heatline: 1,
            spline: 0,
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
