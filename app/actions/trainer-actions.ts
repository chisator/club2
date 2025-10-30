"use server"

import { createClient as createServerClient } from "@/lib/server"
import { revalidatePath } from "next/cache"

export async function updateRoutine(formData: {
  routineId: string
  title: string
  description: string
  sportId: string
  scheduledDate: string
  exercises: any[]
}) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.role !== "entrenador") {
      return { error: "No tienes permisos para actualizar rutinas" }
    }

    const { error } = await supabase
      .from("routines")
      .update({
        title: formData.title,
        description: formData.description,
        sport_id: formData.sportId,
        scheduled_date: formData.scheduledDate,
        exercises: formData.exercises,
      })
      .eq("id", formData.routineId)
      .eq("trainer_id", user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/entrenador")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Error al actualizar rutina" }
  }
}

export async function deleteRoutine(routineId: string) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.role !== "entrenador") {
      return { error: "No tienes permisos para eliminar rutinas" }
    }

    const { error } = await supabase.from("routines").delete().eq("id", routineId).eq("trainer_id", user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/entrenador")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Error al eliminar rutina" }
  }
}
