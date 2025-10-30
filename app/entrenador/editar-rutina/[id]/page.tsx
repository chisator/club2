import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { EditRoutineForm } from "@/components/edit-routine-form"

export default async function EditRoutinePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== "entrenador") {
    redirect("/unauthorized")
  }

  // Obtener la rutina
  const { data: routine, error } = await supabase
    .from("routines")
    .select("*, sports(id, name)")
    .eq("id", params.id)
    .eq("trainer_id", user.id)
    .single()

  if (error || !routine) {
    redirect("/entrenador")
  }

  // Obtener deportes disponibles
  const { data: sports } = await supabase.from("sports").select("*").order("name")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-balance">Editar Rutina</h1>
          <p className="text-muted-foreground mt-2">Actualiza los detalles de la rutina de entrenamiento</p>
        </div>

        <EditRoutineForm routine={routine} sports={sports || []} />
      </div>
    </div>
  )
}
