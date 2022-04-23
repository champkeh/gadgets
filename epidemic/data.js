const data = [
    { date: '2022/04/01', count1: 260, count2: 6051 },
    { date: '2022/04/02', count1: 438, count2: 7788 },
    { date: '2022/04/03', count1: 425, count2: 8581 },
    { date: '2022/04/04', count1: 268, count2: 13086 },
    { date: '2022/04/05', count1: 311, count2: 16766 },
    { date: '2022/04/06', count1: 322, count2: 19660 },
    { date: '2022/04/07', count1: 824, count2: 20398 },
    { date: '2022/04/08', count1: 1015, count2: 22609 },
    { date: '2022/04/09', count1: 1006, count2: 23937 },
    { date: '2022/04/10', count1: 914, count2: 25173 },
    { date: '2022/04/11', count1: 994, count2: 22348 },
    { date: '2022/04/12', count1: 1189, count2: 25141 },
    { date: '2022/04/13', count1: 2573, count2: 25146 },
    { date: '2022/04/14', count1: 3200, count2: 19872 },
    { date: '2022/04/15', count1: 3590, count2: 19923 },
    { date: '2022/04/16', count1: 3238, count2: 21582 },
    { date: '2022/04/17', count1: 2417, count2: 19831 },
    { date: '2022/04/18', count1: 3084, count2: 19442 },
    { date: '2022/04/19', count1: 2494, count2: 16407 },
    { date: '2022/04/20', count1: 2634, count2: 15861 },
    { date: '2022/04/21', count1: 1931, count2: 15698 },
    { date: '2022/04/22', count1: 2736, count2: 20634 },
]

const cloneData = data.slice()
const highestData1 = cloneData.sort((a, b) => a.count1 > b.count1 ? -1 : 1)[0]
const highestData2 = cloneData.sort((a, b) => a.count2 > b.count2 ? -1 : 1)[0]

export default {
    labels: data.map(item => item.date.substring(5)),
    data1: data.map(item => item.count1),
    data2: data.map(item => item.count2),
    highestData1: highestData1,
    highestData2: highestData2,
}

const seeds = [
    'https://mp.weixin.qq.com/s/xxXPs9eVCdfm9yrjbt9mNQ', // 4.22
    'https://mp.weixin.qq.com/s/BTtYkDdU6t6OGF0a8kE3Zg', // 4.21
    'https://mp.weixin.qq.com/s/5LQeyprKrAgx__a9Ul037w', // 4.20
    'https://mp.weixin.qq.com/s/9VrtdzjAQC-3rvgokmGmBg', // 4.19
    'https://mp.weixin.qq.com/s/lSysAcZ6cJTJRfgu9M9hjQ', // 4.18+
    'https://mp.weixin.qq.com/s/wuZXG2rdCKi-A5sZQJdKfA', // 4.17
    'https://mp.weixin.qq.com/s/9YaDe0nseAmv58IwTQfakQ', // 4.16
    'https://mp.weixin.qq.com/s/SE0_F-Bwc2JFM_qKLwXpyQ', // 4.15
    'https://mp.weixin.qq.com/s/CuoDLOZXhBl5HREQZe_9IQ', // 4.14
    'https://mp.weixin.qq.com/s/C8CaP7iR8Bi1HizU9NnjDw', // 4.13
    'https://mp.weixin.qq.com/s/SQoQiurUqYMz6xOvuBdVWw', // 4.12
    'https://mp.weixin.qq.com/s/eun72mybh5Uy0k2m88ae_Q', // 4.11
    'https://mp.weixin.qq.com/s/FVqVXKK8EBnUe9sG1Gxq8g', // 4.10
    'https://mp.weixin.qq.com/s/s_Ylm-oTP-frivKUR6Wo_A', // 4.9
    'https://mp.weixin.qq.com/s/FBRtpIMlQEDd8b7mbtYENw', // 4,8
    'https://mp.weixin.qq.com/s/h_nGXZEav52TrJfIzaC1FQ', // 4.7
    'https://mp.weixin.qq.com/s/6ZmYd30MvJIltQIre6XMvA', // 4.6
    'https://mp.weixin.qq.com/s/knbDe8_s_1POJJnXDmBVXA', // 4.5
    'https://mp.weixin.qq.com/s/EEtAYt7eskfNz4A-OuBIYA', // 4.4
    'https://mp.weixin.qq.com/s/4BMkUSlU7DYdvgoLyMkYyQ', // 4.3
    'https://mp.weixin.qq.com/s/K3KUe2X9Y0o9MrMg7hf4Ng', // 4.2
    'https://mp.weixin.qq.com/s/-W3o-tlKXZFTBOGgSKnEwA', // 4.1
]
