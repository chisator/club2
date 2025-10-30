"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Link from "next/link"
import { deleteRoutine } from "@/app/actions/trainer-actions"

interface TrainerRoutineCardProps {
  routine: any
  isPast?: boolean
}

export function TrainerRoutineCard({ routine, isPast = false }: TrainerRoutineCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta rutina? Esta acción no se puede deshacer.")) {
      return
    }

    setIsDeleting(true)
    const result = await deleteRoutine(routine.id)

    if (result.error) {
      alert(result.error)
      setIsDeleting(false)
    }
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
              <span className="text-xs">{formatDate(routine.scheduled_date)}</span>
            </CardDescription>
          </div>
          {isPast && (
            <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700">
              Finalizada
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {routine.description && <p className="text-sm text-muted-foreground mb-4">{routine.description}</p>}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{exercises.length} ejercicios</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? "Ocultar" : "Ver"} detalles
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/entrenador/editar-rutina/${routine.id}`}>Editar</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
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
