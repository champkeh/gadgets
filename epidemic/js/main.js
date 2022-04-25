
// Register the service worker
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', async () => {
//         try {
//             const registration = await navigator.serviceWorker.register('/service-worker.js')
//             if (registration.installing) {
//                 console.log('Service worker installing')
//             } else if (registration.waiting) {
//                 console.log('Service worker installed')
//             } else if (registration.active) {
//                 console.log('Service worker active')
//             }
//         } catch (err) {
//             console.log('😥 Service worker registration failed: ', err)
//         }
//     })
// }


let fetchedData = null
const breakpoint = 500
let isMobile = window.innerWidth <= breakpoint

window.addEventListener('resize', (event) => {
    const innerWidth = event.target.innerWidth
    if (!isMobile && innerWidth <= breakpoint) {
        isMobile = true
        Promise.resolve().then(() => {
            fetchedData && render(fetchedData,{ valuesOverPoints: false })
        })
    } else if (isMobile && innerWidth > breakpoint) {
        isMobile = false
        Promise.resolve().then(() => {
            fetchedData && render(fetchedData,{ valuesOverPoints: true })
        })
    }
})

fetchData()
fetchLastUpdateInfo()


/**
 * 获取数据
 */
function fetchData() {
    const mainEl = document.querySelector('main')
    mainEl.classList.add('loading')
    fetch('/api/fetch').then(resp => resp.json()).then(json => {
        const data = json.map(item => ({
            date: formatLabelDate(item.date),
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
        render(fetchedData,{ valuesOverPoints: !isMobile })
    }).finally(() => {
        mainEl.classList.remove('loading')
    })
}

/**
 * 格式化坐标轴时间
 * @param dateStr ISO格式的时间字符串
 * @returns {string} yyyy/MM/dd 格式的字符串
 */
function formatLabelDate(dateStr) {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}/${('0'+month).slice(-2)}/${('0'+day).slice(-2)}`
}

/**
 * 渲染图表
 * @param data
 * @param options
 */
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


/**
 * 获取 updatedAt 信息
 */
function fetchLastUpdateInfo() {
    const timeEl = document.getElementById('updateAt')

    fetch('/api/status').then(resp => resp.json()).then(json => {
        const {code, data, msg} = json
        if (code === 0) {
            timeEl.innerHTML = formatUpdateAtInfo(new Date(data.updateAt))
        } else {
            alert(msg)
        }
    })
}


/**
 * 格式化 updateAt 字段
 * @param date
 * @returns {string}
 */
function formatUpdateAtInfo(date) {
    const options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
    }
    return new Intl.DateTimeFormat('zh-CN', options).format(date) + `&nbsp;&nbsp;(${beautifulDateDiff(date)})`
}

/**
 * 根据当前时间格式化日期差
 * @param date {Date}
 */
function beautifulDateDiff(date) {
    const now = new Date()
    date.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0)
    const days = ~~((now - date) / (1000 * 60 * 60 * 24))
    if (days === 0) {
        return '今天'
    } else if (days === 1) {
        return '昨天'
    } else if (days < 7 && days > 0) {
        return `${days}天前`
    } else if (days < 30 && days > 0) {
        return `${~~(days / 7)}周前`
    } else if (days < 365 && days > 0) {
        return `${~~(days / 30)}个月前`
    } else if (days === -1) {
        return '明天'
    } else if (days > -7) {
        return `${-days}天后`
    } else if (days > -30) {
        return `${~~(-days / 7)}周后`
    } else if (days > -365) {
        return `${~~(-days / 30)}个月后`
    }
}
