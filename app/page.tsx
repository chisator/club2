import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // El middleware se encargará de redirigir según el rol
  return null
}
