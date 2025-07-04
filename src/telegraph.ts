import fs from 'node:fs'
import path from 'node:path'
import Telegraph from 'telegraph-node'
import { uploadByBuffer } from 'telegraph-uploader'
import mime from 'mime'
import { resolvePath } from './utils'

interface TelegraphClient {
    createAccount(
        short_name: string,
        options: Record<string, string>
    ): Promise<{ access_token: string }>
    createPage(
        token: string,
        title: string,
        content: unknown,
        options: Record<string, unknown>
    ): Promise<{ url: string }>
}

const TelegraphConstructor = Telegraph as unknown as { new (): TelegraphClient }
const ph = new TelegraphConstructor()
const TOKEN_PATH = resolvePath('.telegraph_token')

export async function getToken() {
    if (process.env.TELEGRAPH_TOKEN) {
        return process.env.TELEGRAPH_TOKEN
    }
    if (fs.existsSync(TOKEN_PATH)) {
        return fs.readFileSync(TOKEN_PATH, 'utf8').trim()
    }
    const res = await ph.createAccount('pica-cli', {
        short_name: 'pica-cli',
        author_name: 'pica-cli'
    })
    const token = res.access_token
    fs.writeFileSync(TOKEN_PATH, token, 'utf8')
    return token
}

async function uploadImages(imgDir: string) {
    const files = fs.readdirSync(imgDir).sort()
    const links: string[] = []
    for (const file of files) {
        const filePath = path.join(imgDir, file)
        const buf = fs.readFileSync(filePath)
        const type = mime.getType(filePath) || 'application/octet-stream'
        const res = await uploadByBuffer(buf, type)
        links.push(res.link)
    }
    return links
}

export async function uploadComic(title: string) {
    const dir = resolvePath('comics', title)
    if (!fs.existsSync(dir)) {
        throw new Error('Comic directory not found')
    }
    const chapters = fs.readdirSync(dir).sort()
    const token = await getToken()
    const content: unknown[] = []
    for (const chapter of chapters) {
        const chapterDir = path.join(dir, chapter)
        if (!fs.lstatSync(chapterDir).isDirectory()) continue
        content.push({ tag: 'h3', children: [chapter] })
        const images = await uploadImages(chapterDir)
        for (const img of images) {
            content.push({ tag: 'img', attrs: { src: img } })
        }
    }
    const page = await ph.createPage(token, title, content, {
        return_content: false
    })
    return page.url
}
