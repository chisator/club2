"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Exercise {
  name: string
  sets?: string
  reps?: string
  duration?: string
  notes?: string
}

interface CreateRoutineFormProps {
  athletes: any[]
  trainerId: string
}

export function CreateRoutineForm({ athletes, trainerId }: CreateRoutineFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [userId, setUserId] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [exercises, setExercises] = useState<Exercise[]>([{ name: "", sets: "", reps: "", duration: "", notes: "" }])

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "", duration: "", notes: "" }])
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index: number, field: keyof Exercise, value: string) => {
    const newExercises = [...exercises]
    newExercises[index] = { ...newExercises[index], [field]: value }
    setExercises(newExercises)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validar que se seleccionó un usuario
    if (!userId) {
      setError("Debes seleccionar un usuario")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // Filtrar ejercicios vacíos
      const validExercises = exercises.filter((ex) => ex.name.trim() !== "")

      const { error: insertError } = await supabase.from("routines").insert({
        title,
        description,
        user_id: userId,
        trainer_id: trainerId,
        scheduled_date: scheduledDate,
        exercises: validExercises,
      })

      if (insertError) throw insertError

      router.push("/entrenador")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al crear la rutina")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Información de la Rutina</CardTitle>
          <CardDescription>Completa los datos básicos de la rutina</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título de la Rutina</Label>
            <Input
              id="title"
              placeholder="Ej: Entrenamiento de Resistencia"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
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
            <Label htmlFor="user">Usuario Deportista</Label>
            <Select value={userId} onValueChange={setUserId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un usuario" />
              </SelectTrigger>
              <SelectContent>
                {athletes.map((athlete) => (
                  <SelectItem key={athlete.id} value={athlete.id}>
                    {athlete.full_name} ({athlete.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ejercicios</CardTitle>
              <CardDescription>Agrega los ejercicios de la rutina</CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={addExercise}>
              Agregar Ejercicio
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {exercises.map((exercise, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Ejercicio {index + 1}</h4>
                {exercises.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeExercise(index)}>
                    Eliminar
                  </Button>
                )}
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={`exercise-name-${index}`}>Nombre del Ejercicio</Label>
                  <Input
                    id={`exercise-name-${index}`}
                    placeholder="Ej: Sentadillas"
                    value={exercise.name}
                    onChange={(e) => updateExercise(index, "name", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                      placeholder="Ej: 10"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(index, "reps", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`exercise-duration-${index}`}>Duración</Label>
                    <Input
                      id={`exercise-duration-${index}`}
                      placeholder="Ej: 30 seg"
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
            </div>
          ))}
        </CardContent>
      </Card>

      {error && (
        <div className="mt-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          <p>{error}</p>
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Creando rutina..." : "Crear Rutina"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
