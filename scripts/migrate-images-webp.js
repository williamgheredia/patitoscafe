/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require("sharp")

const SUPABASE_URL = "https://soqkmjdtpzrmenksmwmk.supabase.co"
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_KEY) {
  console.error("Set SUPABASE_SERVICE_ROLE_KEY env var")
  process.exit(1)
}

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
}

async function migrateProducts() {
  // Get products with image URLs that are NOT webp
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?image_url=not.is.null&select=id,name,image_url`,
    { headers }
  )
  const products = await res.json()
  const toConvert = products.filter(
    (p) => p.image_url && !p.image_url.endsWith(".webp")
  )

  console.log(`Products to convert: ${toConvert.length} of ${products.length}`)

  for (const product of toConvert) {
    try {
      // Download original
      const imgRes = await fetch(product.image_url)
      if (!imgRes.ok) {
        console.log(`SKIP: ${product.name} (fetch failed)`)
        continue
      }
      const originalBuffer = Buffer.from(await imgRes.arrayBuffer())
      const originalSize = originalBuffer.length

      // Convert to WebP
      const webpBuffer = await sharp(originalBuffer).webp({ quality: 82 }).toBuffer()
      const savings = ((1 - webpBuffer.length / originalSize) * 100).toFixed(0)

      // Upload WebP
      const webpPath = `${product.id}-${Date.now()}.webp`
      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/product-images/${webpPath}`,
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "image/webp",
            "x-upsert": "true",
          },
          body: webpBuffer,
        }
      )

      if (!uploadRes.ok) {
        console.log(`SKIP: ${product.name} (upload failed: ${uploadRes.status})`)
        continue
      }

      // Get public URL and update DB
      const newUrl = `${SUPABASE_URL}/storage/v1/object/public/product-images/${webpPath}`
      await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}`, {
        method: "PATCH",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ image_url: newUrl }),
      })

      console.log(
        `OK: ${product.name} — ${(originalSize / 1024).toFixed(0)}KB → ${(webpBuffer.length / 1024).toFixed(0)}KB (${savings}% smaller)`
      )
    } catch (e) {
      console.log(`ERR: ${product.name} — ${e.message}`)
    }
  }
}

async function migrateCategories() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/categories?image_url=not.is.null&select=id,name,image_url`,
    { headers }
  )
  const categories = await res.json()
  const toConvert = categories.filter(
    (c) => c.image_url && !c.image_url.endsWith(".webp")
  )

  console.log(`\nCategories to convert: ${toConvert.length} of ${categories.length}`)

  for (const cat of toConvert) {
    try {
      const imgRes = await fetch(cat.image_url)
      if (!imgRes.ok) {
        console.log(`SKIP: ${cat.name}`)
        continue
      }
      const originalBuffer = Buffer.from(await imgRes.arrayBuffer())
      const originalSize = originalBuffer.length

      const webpBuffer = await sharp(originalBuffer).webp({ quality: 82 }).toBuffer()
      const savings = ((1 - webpBuffer.length / originalSize) * 100).toFixed(0)

      const webpPath = `cat-${cat.id}-${Date.now()}.webp`
      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/product-images/${webpPath}`,
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "image/webp",
            "x-upsert": "true",
          },
          body: webpBuffer,
        }
      )

      if (!uploadRes.ok) {
        console.log(`SKIP: ${cat.name} (upload failed)`)
        continue
      }

      const newUrl = `${SUPABASE_URL}/storage/v1/object/public/product-images/${webpPath}`
      await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${cat.id}`, {
        method: "PATCH",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ image_url: newUrl }),
      })

      console.log(
        `OK: ${cat.name} — ${(originalSize / 1024).toFixed(0)}KB → ${(webpBuffer.length / 1024).toFixed(0)}KB (${savings}% smaller)`
      )
    } catch (e) {
      console.log(`ERR: ${cat.name} — ${e.message}`)
    }
  }
}

async function run() {
  console.log("=== Migrating images to WebP ===\n")
  await migrateProducts()
  await migrateCategories()
  console.log("\n=== Done ===")
}

run()
