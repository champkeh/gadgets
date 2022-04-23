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
