"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { createClient as createServerClient } from "@/lib/server"

export async function createUser(formData: {
  email: string
  password: string
  fullName: string
  role: "deportista" | "entrenador" | "administrador"
}) {
  try {
    console.log("[v0] Starting user creation:", formData.email)

    // Verificar que el usuario actual es administrador
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] No authenticated user")
      return { error: "No autenticado" }
    }

    const userRole = user.user_metadata?.role

    if (userRole !== "administrador") {
      console.log("[v0] User is not admin:", userRole)
      return { error: "No tienes permisos para crear usuarios" }
    }

    // Crear cliente con service role para tener permisos de admin
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] Creating user with admin client")

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: {
        full_name: formData.fullName,
        role: formData.role,
      },
    })

    if (createError) {
      console.log("[v0] Error creating user:", createError)
      return { error: createError.message }
    }

    console.log("[v0] User created successfully:", newUser.user?.id)

    // El trigger handle_new_user creará automáticamente el perfil
    // usando los datos de user_metadata

    revalidatePath("/admin")

    return { success: true, user: newUser }
  } catch (error: any) {
    console.error("[v0] Unexpected error:", error)
    return { error: error.message || "Error al crear usuario" }
  }
}

export async function createSport(formData: { name: string; description: string }) {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.from("sports").insert({
      name: formData.name,
      description: formData.description,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Error al crear deporte" }
  }
}

export async function assignAthleteToSport(formData: { athleteId: string; sportId: string }) {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.from("athlete_sports").insert({
      athlete_id: formData.athleteId,
      sport_id: formData.sportId,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Error al asignar deportista" }
  }
}

export async function updateUser(formData: {
  userId: string
  email: string
  fullName: string
  role: "deportista" | "entrenador" | "administrador"
}) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.role !== "administrador") {
      return { error: "No tienes permisos para actualizar usuarios" }
    }

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Actualizar email y metadata del usuario
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(formData.userId, {
      email: formData.email,
      user_metadata: {
        full_name: formData.fullName,
        role: formData.role,
      },
    })

    if (updateError) {
      return { error: updateError.message }
    }

    // Actualizar perfil
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        email: formData.email,
        full_name: formData.fullName,
        role: formData.role,
      })
      .eq("id", formData.userId)

    if (profileError) {
      return { error: profileError.message }
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Error al actualizar usuario" }
  }
}

export async function deleteUser(userId: string) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.role !== "administrador") {
      return { error: "No tienes permisos para eliminar usuarios" }
    }

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Eliminar usuario de auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      return { error: deleteError.message }
    }

    // El perfil se eliminará automáticamente por CASCADE
    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Error al eliminar usuario" }
  }
}
