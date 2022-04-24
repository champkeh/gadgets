import {serve} from "https://deno.land/std@0.114.0/http/server.ts"
import * as postgres from "https://deno.land/x/postgres@v0.14.0/mod.ts"

const databaseUrl = Deno.env.get("DATABASE_URL")

// Create a database pool with three connections that are lazily established
const pool = new postgres.Pool(databaseUrl, 3, true)


/* ========================================================================== */


/**
 * 请求处理中心
 * @param request
 */
async function gateway(request: Request): Promise<Response> {
    const {pathname} = new URL(request.url)
    console.debug(`pathname: "${pathname}"`)
    let filePath
    if (pathname === '/') {
        filePath = './epidemic/index.html'
    } else {
        filePath = `./epidemic${pathname}`
    }

    if (await existFile(filePath)) {
        return handleStaticFileRequest(request)
    } else {
        if (pathname.startsWith('/api')) {
            // 接口调用
            return handleApiRequest(request)
        } else {
            // 非接口调用
            const fallback = await Deno.readFile('./404.html')
            return new Response(fallback, {
                headers: {
                    "Content-Type": mimeType(request),
                },
            })
        }
    }
}


/**
 * 处理静态文件请求
 * @param request
 */
async function handleStaticFileRequest(request: Request): Promise<Response> {
    const {pathname} = new URL(request.url)
    let filePath
    if (pathname === '/') {
        filePath = './epidemic/index.html'
    } else {
        filePath = `./epidemic${pathname}`
    }
    const fileContent = await Deno.readFile(filePath)
    return new Response(fileContent, {
        headers: {
            "Content-Type": mimeType(request),
        }
    })
}


/**
 * 处理 api 调用
 * @param request
 */
async function handleApiRequest(request: Request): Promise<Response> {
    const {pathname} = new URL(request.url)

    switch (pathname) {
        case '/api/status':
            return fetchStatus()
        case '/api/fetch':
            return fetchData()
        case '/api/sync':
            return syncData((await request.json()).url)
        case '/api/clear':
            return clearData()
        case '/api/refresh':
            return refreshData()
        case '/api/pull':
            return syncData((await request.formData()).get('url') as string)
        default:
            return Promise.resolve(new Response("Not Found", {
                status: 404,
            }))
    }
}


/* ========================================================================== */


/**
 * (api)
 * 获取状态
 */
async function fetchStatus(): Promise<Response> {
    const connection = await pool.connect()
    try {
        const result = await connection.queryObject`
            SELECT created_at FROM epidemic ORDER BY date DESC LIMIT 1
        `

        return writeJsonToClient({
            code: 0,
            data: {
                updateAt: (result.rows[0] as any).created_at,
            },
            msg: '成功'
        })
    } catch (err) {
        console.error(err)
        return writeJsonToClient({code: 1, msg: err.message})
    } finally {
        connection.release()
    }
}

/**
 * (api)
 * 获取数据
 */
async function fetchData(): Promise<Response> {
    const connection = await pool.connect()

    try {
        const result = await connection.queryObject`
            SELECT * FROM epidemic
        `

        return writeJsonToClient(result.rows)
    } catch (err) {
        console.error(err)
        return new Response(`Internal Server Error\n\n${err.message}`, {
            status: 500
        })
    } finally {
        connection.release()
    }
}

/**
 * (api)
 * 从指定url同步数据到数据库
 * @param url 公众号文章url
 */
async function syncData(url: string): Promise<Response> {
    const result = await pullData(url)
    if (result.code === 0) {
        // 写入数据库
        const state = await writeToDB(result.data)
        if (state === true) {
            // 写入成功
            return writeJsonToClient({
                code: 0,
                msg: '同步成功',
            })
        } else {
            // 写入失败
            return writeJsonToClient({
                code: 1,
                msg: `写入数据库失败: ${state}`,
            })
        }
    } else {
        return writeJsonToClient(result)
    }
}

/**
 * (api)
 * 清理数据
 */
async function clearData(): Promise<Response> {
    const connection = await pool.connect()
    try {
        await connection.queryObject`
            TRUNCATE TABLE epidemic
        `
        return writeJsonToClient({code: 0, msg: '清空成功'})
    } catch (err) {
        console.error(err)
        return writeJsonToClient({code: 1, msg: err.message})
    } finally {
        connection.release()
    }
}

/**
 * (api)
 * 刷新所有数据
 */
async function refreshData(): Promise<Response> {
    try {
        for await (const url of seeds) {
            await syncData(url)
        }
        return writeJsonToClient({code: 0, msg: 'success'})
    } catch (err) {
        return writeJsonToClient({code: 1, msg: err.message})
    }
}


/* ========================================================================== */


/**
 * (private)
 * 静态文件是否存在
 * @param path 文件路径
 */
async function existFile(path: string): Promise<boolean> {
    try {
        await Deno.stat(path)
        return true
    } catch (_) {
        return false
    }
}

/**
 * (private)
 * 解析 mime-type
 * @param request
 */
function mimeType(request: Request) {
    const fetchDest = request.headers.get('sec-fetch-dest')
    console.debug(`sec-fetch-dest: "${fetchDest}"`)
    switch (fetchDest) {
        case 'document':
            return 'text/html; charset=utf-8'
        case 'style':
            return 'text/css; charset=utf-8'
        case 'script':
            return 'text/javascript; charset=utf-8'
        case 'image':
            return 'image/png'
        case 'empty':
            return 'application/json'
        default:
            // 根据文件后缀返回对应的mimetype
            return mimeTypeFromExt(request)
    }
}

/**
 * (private)
 * 从扩展名解析 mime-type
 * @param request
 */
function mimeTypeFromExt(request: Request): string {
    const accept = request.headers.get('Accept') || '*/*'
    const {pathname} = new URL(request.url)

    if (accept.match(/text\/html/i) || pathname === '/' || pathname.match(/\.html$/i)) {
        return 'text/html; charset=utf-8'
    } else if (accept.match(/text\/css/i) || pathname.match(/\.css$/i)) {
        return 'text/css; charset=utf-8'
    } else if (pathname.match(/\.js$/i)) {
        return 'text/javascript; charset=utf-8'
    } else if (accept.match(/image\/\*/i)) {
        return 'image/png'
    } else if (pathname.match(/api/i)) {
        return 'application/json'
    } else {
        return 'text/html; charset=utf-8'
    }
}


interface PullDataPayload {
    date: Date
    c1: number
    c2: number
}
interface PullDataSuccess {
    code: 0
    msg: string
    data: PullDataPayload
}
interface PullDataFail {
    code: 1
    msg: string
}
type PullDataResult = PullDataSuccess | PullDataFail

/**
 * (private)
 * 拉取指定url解析数据
 * @param url 公众号文章的url
 */
async function pullData(url: string): Promise<PullDataResult> {
    console.debug('fetching', url)
    try {
        const text = await fetch(url).then(resp => resp.text())
        const titleMatchRes = text.match(/<meta property="og:title" content="(?<title>.+?)"\s*?\/>/)
        if (titleMatchRes?.groups) {
            const title = titleMatchRes.groups.title
            const matchRes = title.match(/(?<month>\d+?)月(?<day>\d+?)日.*?新增(?<c1>\d+)例.*?确诊病例.*?新增(?<c2>\d+)例.*?无症状感染者/)
            const matchRes2 = title.match(/(?<month>\d+?)月(?<day>\d+?)日.*?确诊病例(?<c1>\d+)例.*?无症状感染者(?<c2>\d+)例/)
            if (matchRes?.groups) {
                return {
                    code: 0,
                    msg: '成功',
                    data: {
                        date: new Date(2022, +matchRes.groups.month-1, +matchRes.groups.day),
                        c1: parseInt(matchRes.groups.c1),
                        c2: parseInt(matchRes.groups.c2),
                    }
                }
            } else if (matchRes2?.groups) {
                return {
                    code: 0,
                    msg: '成功',
                    data: {
                        date: new Date(2022, +matchRes2.groups.month-1, +matchRes2.groups.day),
                        c1: parseInt(matchRes2.groups.c1),
                        c2: parseInt(matchRes2.groups.c2),
                    }
                }
            } else {
                console.debug('Pull Data Failed: 数据提取失败')
                return {
                    code: 1,
                    msg: 'Pull Data Failed: 数据提取失败',
                }
            }
        } else {
            console.debug('Pull Data Failed: 标题提取失败')
            return {
                code: 1,
                msg: 'Pull Data Failed: 标题提取失败',
            }
        }
    } catch (err) {
        console.log(err)
        return {
            code: 1,
            msg: err.message
        }
    }

}

/**
 * (private)
 * 写入到数据库
 * @param data
 */
async function writeToDB(data: PullDataPayload): Promise<true | string> {
    const connection = await pool.connect()
    try {
        await connection.queryObject`
            INSERT INTO epidemic (date, c1, c2) VALUES (${data.date.toISOString()}, ${data.c1}, ${data.c2})
        `
        return true
    } catch (err) {
        console.error(err)
        return err.message
    } finally {
        connection.release()
    }
}

/**
 * (private)
 * 向浏览器返回json数据
 * @param data
 */
function writeJsonToClient(data: Record<string, any>): Response {
    return new Response(JSON.stringify(data), {
        headers: {
            "Content-Type": "application/json"
        }
    })
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


/* ========================================================================== */


console.log("Listening on http://localhost:8000")
serve(gateway)
