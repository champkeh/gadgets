let fetchedData
const mainEl = document.querySelector('main')

function formatDate(dateStr) {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}/${('0'+month).slice(-2)}/${('0'+day).slice(-2)}`
}

mainEl.classList.add('loading')
fetch('/api/fetch').then(resp => resp.json()).then(data => {
    data = data.map(item => ({
        date: formatDate(item.date),
        count1: item.c1,
        count2: item.c2,
    })).sort((a, b) => a.date > b.date ? 1 : -1)

    const cloneData = data.slice()
    const highestData1 = cloneData.sort((a, b) => a.count1 > b.count1 ? -1 : 1)[0]
    const highestData2 = cloneData.sort((a, b) => a.count2 > b.count2 ? -1 : 1)[0]

    fetchedData = {
        labels: data.map(item => item.date.substring(5)),
        data1: data.map(item => item.count1),
        data2: data.map(item => item.count2),
        highestData1: highestData1,
        highestData2: highestData2,
    }

    // 初次渲染
    render(fetchedData,{ valuesOverPoints: !isSmallScreen })
}).finally(() => {
    mainEl.classList.remove('loading')
})

function render(data, options) {
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
            yMarkers: [
                {
                    label: `最高点: ${data.highestData1.date.substring(5)}  ${data.highestData1.count1}`,
                    value: data.highestData1.count1,
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
                    name: "新增无症状感染者",
                    chartType: "line",
                    values: data.data2,
                }
            ],
            yMarkers: [
                {
                    label: `最高点: ${data.highestData2.date.substring(5)}  ${data.highestData2.count2}`,
                    value: data.highestData2.count2,
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


window.addEventListener('resize', (event) => {
    const innerWidth = event.target.innerWidth
    if (!isSmallScreen && innerWidth <= breakpoint) {
        fetchedData && render(fetchedData,{ valuesOverPoints: false })
        isSmallScreen = true
    } else if (isSmallScreen && innerWidth > breakpoint) {
        fetchedData && render(fetchedData,{ valuesOverPoints: true })
        isSmallScreen = false
    }
})
