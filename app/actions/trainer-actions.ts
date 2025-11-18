"use server"

import { createClient as createServerClient } from "@/lib/server"
import { revalidatePath } from "next/cache"

export async function updateRoutine(formData: {
  routineId: string
  title: string
  description: string
  // support multiple assigned users
  userIds?: string[]
  startDate?: string
  endDate?: string
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

    const updatePayload: any = {
      title: formData.title,
      description: formData.description,
      exercises: formData.exercises,
    }

    if (formData.startDate) updatePayload.start_date = new Date(formData.startDate).toISOString()
    if (formData.endDate) updatePayload.end_date = new Date(formData.endDate).toISOString()

    const { error: updateError } = await supabase.from("routines").update(updatePayload).eq("id", formData.routineId).eq("trainer_id", user.id)
      .eq("id", formData.routineId)
      .eq("trainer_id", user.id)

    if (updateError) {
      return { error: updateError.message }
    }

    // Si vienen userIds, sincronizar las asignaciones en routine_user_assignments
    if (formData.userIds) {
      // Borrar asignaciones previas para esta rutina (el trainer propietario puede hacerlo por RLS)
      const { error: delError } = await supabase.from("routine_user_assignments").delete().eq("routine_id", formData.routineId)
      if (delError) return { error: delError.message }

      if (formData.userIds.length > 0) {
        const rows = formData.userIds.map((uid) => ({ routine_id: formData.routineId, user_id: uid }))
        const { error: insError } = await supabase.from("routine_user_assignments").insert(rows)
        if (insError) return { error: insError.message }
      }
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

export async function renewRoutine({
  routineId,
  months,
  newEndDate,
}: {
  routineId: string
  months?: number
  newEndDate?: string
}) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.role !== "entrenador") {
      return { error: "No tienes permisos para renovar la rutina" }
    }

    // Obtener rutina para validar propietario y fecha actual
    const { data: routine, error: getErr } = await supabase
      .from("routines")
      .select("id, trainer_id, start_date, end_date")
      .eq("id", routineId)
      .eq("trainer_id", user.id)
      .single()

    if (getErr || !routine) {
      return { error: getErr?.message || "Rutina no encontrada o sin permisos" }
    }

    let newEnd: Date | null = null

    if (newEndDate) {
      newEnd = new Date(newEndDate)
    } else if (months && months > 0) {
      // Baseamos la extensión en la fecha de fin actual si existe, o en hoy
      const base = routine.end_date ? new Date(routine.end_date) : new Date()
      // Si la fecha base ya pasó, empezamos desde hoy
      const now = new Date()
      const from = base < now ? now : base
      newEnd = new Date(from)
      newEnd.setMonth(newEnd.getMonth() + months)
    } else {
      return { error: "Indica meses a extender o una nueva fecha de fin" }
    }

    const { error: updateErr } = await supabase
      .from("routines")
      .update({ end_date: newEnd.toISOString() })
      .eq("id", routineId)
      .eq("trainer_id", user.id)

    if (updateErr) {
      return { error: updateErr.message }
    }

    revalidatePath("/entrenador")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Error al renovar rutina" }
  }
}

export async function exportRoutine(routineId: string, format: "json" | "csv") {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.role !== "entrenador") {
      return { error: "No tienes permisos para exportar rutinas" }
    }

    // Obtener rutina y asignaciones
    const { data: routine, error: routineErr } = await supabase
      .from("routines")
      .select("*")
      .eq("id", routineId)
      .eq("trainer_id", user.id)
      .single()

    if (routineErr || !routine) {
      return { error: "Rutina no encontrada o sin permisos" }
    }

    // Obtener usuarios asignados
    const { data: assignments } = await supabase
      .from("routine_user_assignments")
      .select("user_id")
      .eq("routine_id", routineId)

    const userIds = assignments?.map((a: any) => a.user_id) || []

    // Obtener nombres de usuarios
    const { data: users } = userIds.length
      ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
      : { data: [] }

    const userData = users || []

    if (format === "json") {
      const exportData = {
        routine: {
          title: routine.title,
          description: routine.description,
          start_date: routine.start_date,
          end_date: routine.end_date,
          exercises: routine.exercises,
        },
        assigned_users: userData.map((u: any) => ({ id: u.id, name: u.full_name })),
      }
      return { success: true, data: JSON.stringify(exportData, null, 2), filename: `${routine.title}.json` }
    }

    if (format === "csv") {
      let csv = "Titulo,Descripción,Fecha Inicio,Fecha Fin\n"
      csv += `"${routine.title}","${routine.description || ""}","${routine.start_date}","${routine.end_date}"\n\n`
      csv += "Ejercicios\n"
      csv += "Nombre,Series,Repeticiones,Duracion,Notas\n"
      routine.exercises?.forEach((ex: any) => {
        csv += `"${ex.name}","${ex.sets || ""}","${ex.reps || ""}","${ex.duration || ""}","${ex.notes || ""}"\n`
      })
      csv += "\nUsuarios Asignados\n"
      csv += "Nombre\n"
      userData.forEach((u: any) => {
        csv += `"${u.full_name}"\n`
      })
      return { success: true, data: csv, filename: `${routine.title}.csv` }
    }

    return { error: "Formato no soportado" }
  } catch (error: any) {
    return { error: error.message || "Error al exportar rutina" }
  }
}

export async function importRoutine(formData: {
  title: string
  description: string
  start_date: string
  end_date: string
  exercises: any[]
  userIds: string[]
}) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.role !== "entrenador") {
      return { error: "No tienes permisos para importar rutinas" }
    }

    // Crear rutina
    const { data: inserted, error: insertErr } = await supabase
      .from("routines")
      .insert({
        title: formData.title,
        description: formData.description,
        trainer_id: user.id,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        exercises: formData.exercises,
      })
      .select("id")
      .single()

    if (insertErr || !inserted) {
      return { error: insertErr?.message || "No se pudo crear la rutina" }
    }

    // Asignar usuarios
    if (formData.userIds.length > 0) {
      const assignments = formData.userIds.map((uid) => ({
        routine_id: inserted.id,
        user_id: uid,
      }))
      const { error: assignErr } = await supabase.from("routine_user_assignments").insert(assignments)
      if (assignErr) return { error: assignErr.message }
    }

    revalidatePath("/entrenador")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Error al importar rutina" }
  }
}
