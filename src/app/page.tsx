import { MenuHeader } from "@/features/menu-public/components/menu-header"
import { CategoryGrid } from "@/features/menu-public/components/category-grid"
import { WhatsAppButton } from "@/features/whatsapp-order/components/whatsapp-button"
import { PushPrompt } from "@/features/menu-public/components/push-prompt"
import { getCategories } from "@/features/menu-public/services/menu-queries"

export default async function HomePage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-8">
      <MenuHeader />
      <CategoryGrid categories={categories} />
      <WhatsAppButton />
      <PushPrompt />
    </div>
  )
}
