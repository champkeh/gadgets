import { serve } from "https://deno.land/std@0.114.0/http/server.ts"

async function handleRequest(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url)

    const file = await Deno.readFile("./epidemic/index.html")
    return new Response(file, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
        }
    })
}

console.log("Listening on http://localhost:8000")
serve(handleRequest)
