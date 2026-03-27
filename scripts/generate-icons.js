/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require("sharp")
const path = require("path")
const fs = require("fs")

const PUBLIC = path.join(__dirname, "..", "public")

// Simple duck icon as SVG — yellow duck on warm cream background
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="108" fill="#FFF8F0"/>
  <circle cx="256" cy="240" r="140" fill="#FFD93D"/>
  <circle cx="256" cy="300" r="120" fill="#FFD93D"/>
  <ellipse cx="256" cy="370" rx="100" ry="60" fill="#FFD93D"/>
  <!-- head -->
  <circle cx="256" cy="190" r="90" fill="#FFD93D"/>
  <!-- eye -->
  <circle cx="230" cy="175" r="12" fill="#3D2B1F"/>
  <circle cx="226" cy="171" r="4" fill="white"/>
  <!-- blush -->
  <circle cx="200" cy="200" r="15" fill="#FFB7C5" opacity="0.5"/>
  <!-- beak -->
  <ellipse cx="280" cy="195" rx="30" ry="15" fill="#F4A261"/>
  <!-- text -->
  <text x="256" y="450" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="52" fill="#3D2B1F">PATITOS</text>
</svg>`

async function run() {
  if (!fs.existsSync(PUBLIC)) fs.mkdirSync(PUBLIC, { recursive: true })

  const svgBuffer = Buffer.from(svg)

  // 512x512
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(PUBLIC, "icon-512.png"))
  console.log("OK: icon-512.png")

  // 192x192
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(PUBLIC, "icon-192.png"))
  console.log("OK: icon-192.png")

  // 180x180 apple
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(PUBLIC, "apple-icon.png"))
  console.log("OK: apple-icon.png")

  // favicon 32x32
  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(PUBLIC, "favicon.png"))
  console.log("OK: favicon.png")

  // Also save the SVG
  fs.writeFileSync(path.join(PUBLIC, "icon.svg"), svg)
  console.log("OK: icon.svg")
}

run()
