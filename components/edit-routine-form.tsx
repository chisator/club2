"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateRoutine } from "@/app/actions/trainer-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditRoutineFormProps {
  routine: any
  sports: any[]
}

export function EditRoutineForm({ routine, sports }: EditRoutineFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(routine.title)
  const [description, setDescription] = useState(routine.description || "")
  const [sportId, setSportId] = useState(routine.sport_id)
  const [scheduledDate, setScheduledDate] = useState(routine.scheduled_date.split("T")[0])
  const [exercises, setExercises] = useState(routine.exercises || [])

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "", duration: "", notes: "" }])
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_: any, i: number) => i !== index))
  }

  const updateExercise = (index: number, field: string, value: string) => {
    const newExercises = [...exercises]
    newExercises[index][field] = value
    setExercises(newExercises)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await updateRoutine({
      routineId: routine.id,
      title,
      description,
      sportId,
      scheduledDate,
      exercises: exercises.filter((ex: any) => ex.name.trim() !== ""),
    })

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.push("/entrenador")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Rutina</CardTitle>
        <CardDescription>Actualiza los detalles del entrenamiento</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Título de la Rutina</Label>
              <Input
                id="title"
                placeholder="Ej: Entrenamiento de Fuerza"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sport">Deporte</Label>
              <Select value={sportId} onValueChange={setSportId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sports.map((sport) => (
                    <SelectItem key={sport.id} value={sport.id}>
                      {sport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe el objetivo de esta rutina..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Fecha Programada</Label>
            <Input
              id="date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Ejercicios</Label>
              <Button type="button" variant="outline" size="sm" onClick={addExercise}>
                Agregar Ejercicio
              </Button>
            </div>

            {exercises.map((exercise: any, index: number) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 grid gap-2">
                        <Label htmlFor={`exercise-name-${index}`}>Nombre del Ejercicio</Label>
                        <Input
                          id={`exercise-name-${index}`}
                          placeholder="Ej: Sentadillas"
                          value={exercise.name}
                          onChange={(e) => updateExercise(index, "name", e.target.value)}
                          required
                        />
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeExercise(index)}>
                        Eliminar
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="grid gap-2">
                        <Label htmlFor={`exercise-sets-${index}`}>Series</Label>
                        <Input
                          id={`exercise-sets-${index}`}
                          placeholder="Ej: 3"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(index, "sets", e.target.value)}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor={`exercise-reps-${index}`}>Repeticiones</Label>
                        <Input
                          id={`exercise-reps-${index}`}
                          placeholder="Ej: 12"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(index, "reps", e.target.value)}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor={`exercise-duration-${index}`}>Duración</Label>
                        <Input
                          id={`exercise-duration-${index}`}
                          placeholder="Ej: 30 min"
                          value={exercise.duration}
                          onChange={(e) => updateExercise(index, "duration", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor={`exercise-notes-${index}`}>Notas</Label>
                      <Textarea
                        id={`exercise-notes-${index}`}
                        placeholder="Instrucciones adicionales..."
                        value={exercise.notes}
                        onChange={(e) => updateExercise(index, "notes", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Actualizando..." : "Actualizar Rutina"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/entrenador")}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
