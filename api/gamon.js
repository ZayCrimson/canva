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
    // 🔥 FIX: ambil query dari URL (bukan req.query)
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`)

    let nama = searchParams.get('nama')
    let avatar = searchParams.get('avatar')
    let num = searchParams.get('num')

    // fallback
    if (!nama) nama = 'User'

    // 👉 kalau pp ga ada → pakai default kosong (bukan random)
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
        ctx.font = 'bold 32px Sans'
        ctx.fillStyle = '#ff4d6d'
        ctx.textAlign = 'center'
        ctx.fillText('CEK GAMON 💔', canvas.width / 2, 60)

        // avatar bulat
        const centerX = canvas.width / 2
        const centerY = 200
        const radius = 90

        try {
            const img = await loadImage(avatar)

            ctx.save()
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
            ctx.clip()
            ctx.drawImage(img, centerX - radius, centerY - radius, radius * 2, radius * 2)
            ctx.restore()
        } catch {
            // kalau gagal load gambar → skip (biar ga error)
        }

        // border avatar
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.strokeStyle = '#ff4d6d'
        ctx.lineWidth = 5
        ctx.stroke()

        // icon hati retak
        ctx.font = '60px Sans'
        ctx.fillText('💔', centerX, 320)

        // nama
        ctx.fillStyle = '#fff'
        ctx.font = '22px Sans'
        ctx.fillText(nama, centerX, 360)

        // box persen
        const boxW = 220
        const boxH = 80
        const boxX = centerX - boxW / 2
        const boxY = 390

        ctx.fillStyle = '#fff'
        roundRect(ctx, boxX, boxY, boxW, boxH, 25)
        ctx.fill()

        // persen (sinkron dari bot)
        ctx.fillStyle = '#ff4d6d'
        ctx.font = 'bold 40px Sans'
        ctx.fillText(`${num}%`, centerX, boxY + 52)

        const buffer = canvas.toBuffer('image/png')

        res.setHeader('Content-Type', 'image/png')
        res.status(200).send(buffer)

    } catch (e) {
        console.error(e)
        res.status(500).send('error generate image')
    }
}
