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

    if (!nama) nama = 'User'

    // fallback PP kalau kosong
    if (!avatar) {
        avatar = 'https://i.pinimg.com/564x/8a/eb/d8/8aebd875fbddd22bf3971c3a7159bdc7.jpg'
    }

    num = parseInt(num)
    if (isNaN(num)) num = Math.floor(Math.random() * 100) + 1

    try {
        const canvas = createCanvas(700, 520)
        const ctx = canvas.getContext('2d')

        // background
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // diagonal
        ctx.fillStyle = '#1e293b'
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(350, 0)
        ctx.lineTo(0, 350)
        ctx.fill()

        // title
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = 'bold 32px Sans'
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
        } catch {}

        // border avatar
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.strokeStyle = '#ff4d6d'
        ctx.lineWidth = 5
        ctx.stroke()

        // ===== OVERLAY HATI PNG =====
        try {
            const heart = await loadImage('https://cdn-icons-png.flaticon.com/512/833/833472.png')

            ctx.save()
            ctx.globalAlpha = 0.4

            const size = radius * 1.6

            ctx.drawImage(
                heart,
                centerX - size / 2,
                centerY - size / 2,
                size,
                size
            )

            ctx.restore()
        } catch {}

        // ===== NAMA =====
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 26px Sans'
        ctx.fillText(nama, centerX, 330)

        // ===== BOX =====
        const boxW = 220
        const boxH = 80
        const boxX = centerX - boxW / 2
        const boxY = 370

        ctx.fillStyle = '#ffffff'
        roundRect(ctx, boxX, boxY, boxW, boxH, 25)
        ctx.fill()

        // ===== PERSEN =====
        ctx.fillStyle = '#ff4d6d'
        ctx.font = 'bold 42px Sans'
        ctx.fillText(`${num}%`, centerX, boxY + 45)

        const buffer = canvas.toBuffer('image/png')

        res.setHeader('Content-Type', 'image/png')
        res.status(200).send(buffer)

    } catch (e) {
        console.error(e)
        res.status(500).send('error generate image')
    }
}
