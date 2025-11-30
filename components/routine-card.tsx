"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface RoutineCardProps {
  routine: any
  attendance?: any
  athleteId: string
  isPast?: boolean
}

export function RoutineCard({ routine, attendance, athleteId, isPast = false }: RoutineCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const router = useRouter()

  const exercises = Array.isArray(routine.exercises) ? routine.exercises : []

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{routine.title}</CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="outline" className="mr-2">
                {routine.sports?.name}
              </Badge>
              <span className="text-xs">
                {routine.start_date && routine.end_date
                  ? `${formatDate(routine.start_date)} - ${formatDate(routine.end_date)}`
                  : routine.end_date
                    ? formatDate(routine.end_date)
                    : routine.start_date
                      ? formatDate(routine.start_date)
                      : "Sin fecha"}
              </span>
            </CardDescription>
          </div>
          {isPast && attendance?.completed && (
            <Badge variant="default" className="bg-green-600">
              Completada
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {routine.description && <p className="text-sm text-muted-foreground mb-4">{routine.description}</p>}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Entrenador: {routine.profiles?.full_name}</p>
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? "Ocultar" : "Ver"} ejercicios
            </Button>
          </div>

          {showDetails && exercises.length > 0 && (
            <div className="mt-4 space-y-2 border-t pt-4">
              <p className="text-sm font-semibold">Ejercicios:</p>
              <ul className="space-y-2">
                {exercises.map((exercise: any, index: number) => (
                  <li key={index} className="text-sm bg-muted p-3 rounded-md">
                    <p className="font-medium">{exercise.name}</p>
                    {exercise.sets && <p className="text-muted-foreground">Series: {exercise.sets}</p>}
                    {exercise.reps && <p className="text-muted-foreground">Repeticiones: {exercise.reps}</p>}
                    {exercise.weight && <p className="text-muted-foreground">Peso: {exercise.weight}</p>}
                    {exercise.duration && <p className="text-muted-foreground">Duración: {exercise.duration}</p>}
                    {exercise.notes && <p className="text-muted-foreground mt-1">{exercise.notes}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
