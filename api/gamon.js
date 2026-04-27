import { createCanvas, loadImage } from '@napi-rs/canvas'

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
}

// 🔥 TEXT VIA SVG (ANTI GAGAL)
async function loadTextImage(text, size = 40, color = '#fff') {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="700" height="100">
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-size="${size}" fill="${color}" font-family="Arial">
        ${text}
        </text>
    </svg>
    `
    const base64 = Buffer.from(svg).toString('base64')
    return await loadImage(`data:image/svg+xml;base64,${base64}`)
}

export default async function handler(req, res) {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`)

    let nama = searchParams.get('nama')
    let avatar = searchParams.get('avatar')
    let num = searchParams.get('num')

    // STRICT MODE
    if (!nama || !avatar || !num) {
        return res.status(400).json({
            status: false,
            error: 'Parameters "nama", "avatar", and "num" are required',
            code: 400
        })
    }

    num = parseInt(num)
    if (isNaN(num)) {
        return res.status(400).json({
            status: false,
            error: '"num" must be a number',
            code: 400
        })
    }

    try {
        const canvas = createCanvas(700, 520)
        const ctx = canvas.getContext('2d')

        // ===== BACKGROUND =====
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = '#1e293b'
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(350, 0)
        ctx.lineTo(0, 350)
        ctx.fill()

        const centerX = canvas.width / 2
        const centerY = 190
        const radius = 90

        // ===== TITLE =====
        const titleImg = await loadTextImage('CEK GAMON 💔', 32, '#ff4d6d')
        ctx.drawImage(titleImg, 0, 10)

        // ===== AVATAR =====
        try {
            const img = await loadImage(avatar)

            ctx.save()
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
            ctx.clip()
            ctx.drawImage(img, centerX - radius, centerY - radius, radius * 2, radius * 2)
            ctx.restore()
        } catch {
            return res.status(400).json({
                status: false,
                error: 'Invalid avatar URL',
                code: 400
            })
        }

        // border
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.strokeStyle = '#ff4d6d'
        ctx.lineWidth = 5
        ctx.stroke()

        // ===== HEART OVERLAY =====
        try {
            const heart = await loadImage('https://cdn-icons-png.flaticon.com/512/742/742751.png')
            ctx.globalAlpha = 0.5
            const size = radius * 1.4
            ctx.drawImage(heart, centerX - size / 2, centerY - size / 2, size, size)
            ctx.globalAlpha = 1
        } catch {}

        // ===== NAMA (SVG) =====
        const nameImg = await loadTextImage(nama, 28, '#ffffff')
        ctx.drawImage(nameImg, 0, 280)

        // ===== BOX =====
        const boxW = 220
        const boxH = 80
        const boxX = centerX - boxW / 2
        const boxY = 370

        ctx.fillStyle = '#ffffff'
        roundRect(ctx, boxX, boxY, boxW, boxH, 20)
        ctx.fill()

        // ===== PERSEN (SVG) =====
        const percentImg = await loadTextImage(`${num}%`, 45, '#000000')
        ctx.drawImage(percentImg, 0, boxY + 10)

        const buffer = canvas.toBuffer('image/png')

        res.setHeader('Content-Type', 'image/png')
        res.status(200).send(buffer)

    } catch (e) {
        console.error(e)
        res.status(500).json({
            status: false,
            error: 'Failed to generate image',
            code: 500
        })
    }
}
