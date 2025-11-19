"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { deleteRoutine } from "@/app/actions/trainer-actions"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface RoutinesTableProps {
  routines: any[]
  trainers: any[]
}

export function RoutinesTable({ routines, trainers }: RoutinesTableProps) {
  const getTrainerName = (trainerId: string) => {
    return trainers.find(t => t.id === trainerId)?.full_name || "N/A"
  }

  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (routineId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta rutina? Esta acción no se puede deshacer.")) {
      return
    }
    setIsDeleting(routineId)
    const result = await deleteRoutine(routineId)
    if (result.error) {
      alert(result.error)
    }
    setIsDeleting(null)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Gestión de Rutinas</CardTitle>
                <CardDescription>Visualiza, edita y crea nuevas rutinas para cualquier usuario.</CardDescription>
            </div>
            <Button asChild>
                <Link href="/admin/crear-rutina">Crear Rutina</Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Entrenador Asignado</TableHead>
              <TableHead>Fecha de Inicio</TableHead>
              <TableHead>Fecha de Fin</TableHead>
              <TableHead># Ejercicios</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routines.map((routine) => (
              <TableRow key={routine.id}>
                <TableCell className="font-medium">{routine.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{getTrainerName(routine.trainer_id)}</Badge>
                </TableCell>
                <TableCell>{new Date(routine.start_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(routine.end_date).toLocaleDateString()}</TableCell>
                <TableCell>{routine.exercises?.length || 0}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/entrenador/editar-rutina/${routine.id}`}>
                      Ver/Editar
                    </Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(routine.id)}
                    disabled={isDeleting === routine.id}
                  >
                    {isDeleting === routine.id ? "Eliminando..." : "Borrar"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
