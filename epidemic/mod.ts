import { serve } from "https://deno.land/std@0.114.0/http/server.ts"

/**
 * 请求处理中心
 * @param request
 */
async function handleRequest(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url)
    console.debug(pathname)
    let filePath
    if (pathname === '/') {
        filePath = './epidemic/index.html'
    } else {
        filePath = `./epidemic${pathname}`
    }

    if (existFile(filePath)) {
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
    const { pathname } = new URL(request.url)
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
 * 静态文件是否存在
 * @param path 文件路径
 */
function existFile(path: string): boolean {
    try {
        Deno.statSync(path)
        return true
    } catch (e) {
        console.debug(e)
        return false
    }
}

/**
 * 解析 mine-type
 * @param request
 */
function mimeType(request: Request) {
    const fetchDest = request.headers.get('sec-fetch-dest')
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
            return 'text/html; charset=utf-8'
    }
}

/**
 * 处理 api 调用
 * @param request
 */
async function handleApiRequest(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url)
    let payload: ApiDataPayload
    switch (pathname) {
        case '/api/status':
            payload = await fetchStatus()
            break
        default:
            payload = await fetchStatus()
    }
    return new Response(JSON.stringify(payload), {
        headers: {
            "Content-Type": mimeType(request),
        },
    })
}

interface ApiDataPayload {
    updateAt: Date
}

async function fetchStatus(): Promise<ApiDataPayload> {
    const fileInfo = await Deno.stat('./epidemic/data.js')
    return {
        updateAt: fileInfo.mtime as Date
    }
}

console.log("Listening on http://localhost:8000")
serve(handleRequest)
