import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogoutButton } from "@/components/logout-button"
import { RoutineCard } from "@/components/routine-card"
import { StatsCard } from "@/components/stats-card"

export default async function DeportistaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "deportista") {
    redirect("/unauthorized")
  }

  // Obtener rutinas asignadas al usuario
  const { data: routines } = await supabase
    .from("routines")
    .select("*")
    .eq("user_id", user.id)
    .order("scheduled_date", { ascending: true })

  // Calcular estadísticas
  const totalRoutines = routines?.length || 0

  // Filtrar rutinas por fecha
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingRoutines = routines?.filter((r) => {
    const routineDate = new Date(r.scheduled_date)
    routineDate.setHours(0, 0, 0, 0)
    return routineDate >= today
  })

  const pastRoutines = routines?.filter((r) => {
    const routineDate = new Date(r.scheduled_date)
    routineDate.setHours(0, 0, 0, 0)
    return routineDate < today
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <svg className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold">Gimnasio</h1>
              <p className="text-xs text-muted-foreground">Panel de Usuario</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{profile?.full_name}</p>
              <Badge variant="secondary" className="text-xs">
                Deportista
              </Badge>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-balance">Bienvenido, {profile?.full_name}</h2>
          <p className="text-muted-foreground mt-1">Aquí puedes ver tus rutinas y seguir tu progreso</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <StatsCard title="Rutinas Totales" value={totalRoutines} icon="calendar" />
          <StatsCard title="Completadas" value={upcomingRoutines?.length || 0} icon="check" />
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Próximas Rutinas</h3>
            {upcomingRoutines && upcomingRoutines.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingRoutines.map((routine: any) => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    athleteId={user.id}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No tienes rutinas próximas programadas</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4">Rutinas Anteriores</h3>
            {pastRoutines && pastRoutines.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {pastRoutines.slice(0, 4).map((routine: any) => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    athleteId={user.id}
                    isPast
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No tienes rutinas anteriores</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
