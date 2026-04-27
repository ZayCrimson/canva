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

export default async function handler(req, res) {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`)

    let nama = searchParams.get('nama')
    let avatar = searchParams.get('avatar')
    let num = searchParams.get('num')

    // ===== VALIDASI KETAT =====
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

        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // ===== TITLE =====
        ctx.font = 'bold 32px'
        ctx.fillStyle = '#ff4d6d'
        ctx.fillText('CEK GAMON 💔', canvas.width / 2, 50)

        const centerX = canvas.width / 2
        const centerY = 190
        const radius = 90

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

        // ===== NAMA =====
        ctx.font = 'bold 28px'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(nama, centerX, 330)

        // ===== BOX =====
        const boxW = 220
        const boxH = 80
        const boxX = centerX - boxW / 2
        const boxY = 370

        ctx.fillStyle = '#ffffff'
        roundRect(ctx, boxX, boxY, boxW, boxH, 20)
        ctx.fill()

        // ===== PERSEN =====
        ctx.font = 'bold 45px'
        ctx.fillStyle = '#000000'
        ctx.fillText(`${num}%`, centerX, boxY + 40)

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
