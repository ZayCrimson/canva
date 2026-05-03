import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import path from 'path'

function rand(min, max) {
    return Math.random() * (max - min) + min
}

// =========================
// REGISTER FONT
// =========================
const fontPath = './fonts/sans.ttf'
const fontArial = './fonts/arial.ttf'

GlobalFonts.registerFromPath(fontPath, 'Sans')
GlobalFonts.registerFromPath(fontArial, 'Arial')

export default async function handler(req, res) {
    try {
        const { searchParams } = new URL(req.url, `http://${req.headers.host}`)

        const avatarInput = searchParams.get('avatar')
        const name = searchParams.get('nama') || 'Unknown'
        const percent = Number(searchParams.get('num')) || Math.floor(rand(1, 100))

        const fallbackAvatar = 'https://i.ibb.co/dhm0d2m/image.jpg'

        const canvas = createCanvas(900, 600)
        const ctx = canvas.getContext('2d')

        const bg = ctx.createLinearGradient(0, 0, 900, 600)
        bg.addColorStop(0, '#0b1220')
        bg.addColorStop(0.5, '#111827')
        bg.addColorStop(1, '#020617')

        ctx.fillStyle = bg
        ctx.fillRect(0, 0, 900, 600)

        const fog = ctx.createRadialGradient(450, 250, 0, 450, 250, 600)
        fog.addColorStop(0, 'rgba(255,255,255,0.05)')
        fog.addColorStop(1, 'transparent')

        ctx.fillStyle = fog
        ctx.fillRect(0, 0, 900, 600)

        const glow = ctx.createRadialGradient(450, 300, 50, 450, 300, 400)
        glow.addColorStop(0, 'rgba(59,130,246,0.25)')
        glow.addColorStop(1, 'transparent')

        ctx.fillStyle = glow
        ctx.fillRect(0, 0, 900, 600)

        for (let i = 0; i < 60; i++) {
            const x = rand(0, 900)
            const y = rand(0, 600)

            ctx.beginPath()
            ctx.arc(x, y, rand(1, 2.5), 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(255,255,255,0.08)'
            ctx.fill()
        }

        let img
        try {
            img = await loadImage(avatarInput || fallbackAvatar)
        } catch {
            img = await loadImage(fallbackAvatar)
        }

        const cx = 450
        const cy = 260
        const r = 120

        ctx.beginPath()
        ctx.arc(cx, cy, r + 12, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,0,0,0.4)'
        ctx.fill()

        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2)
        ctx.restore()

        const start = -Math.PI / 2
        const end = start + (Math.PI * 2 * (percent / 100))

        ctx.beginPath()
        ctx.arc(cx, cy, r + 8, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 10
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(cx, cy, r + 8, start, end)
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 10
        ctx.lineCap = 'round'
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(cx, cy, r + 20, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(59,130,246,0.15)'
        ctx.lineWidth = 18
        ctx.stroke()

        // =========================
        // TEXT (no glass box anymore)
        // =========================
        ctx.textAlign = 'center'

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 38px Sans'
        ctx.fillText('STRESS LEVEL', 450, 460)

        ctx.font = 'bold 55px Sans'
        ctx.fillStyle = '#3b82f6'
        ctx.fillText(`${percent}%`, 450, 515)

        ctx.font = '20px Sans'
        ctx.fillStyle = '#ffffff'

        let desc = ''
        if (percent > 80) desc = 'Overloaded. Seriously, take a break.'
        else if (percent > 50) desc = 'You need some rest.'
        else if (percent > 20) desc = 'Still under control.'
        else desc = 'Calm and relaxed.'

        ctx.fillText(desc, 450, 555)

        ctx.font = '18px Sans'
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.fillText(name, 450, 590)

        const buffer = canvas.toBuffer('image/png')

        res.setHeader('Content-Type', 'image/png')
        res.status(200).send(buffer)

    } catch (e) {
        console.error(e)
        res.status(500).json({
            status: false,
            error: 'render failed'
        })
    }
}