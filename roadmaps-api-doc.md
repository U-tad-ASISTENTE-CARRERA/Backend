# Documentación de API - Roadmaps (Rutas de aprendizaje)

Esta documentación describe todas las rutas disponibles para la gestión de roadmaps (rutas de aprendizaje) en el backend de GPS Académico.

## Índice
- [Crear nuevo roadmap](#crear-nuevo-roadmap)
- [Obtener todos los roadmaps](#obtener-todos-los-roadmaps)
- [Obtener roadmap por nombre (Admin)](#obtener-roadmap-por-nombre-admin)
- [Obtener roadmap por nombre (Estudiante)](#obtener-roadmap-por-nombre-estudiante)
- [Actualizar roadmap](#actualizar-roadmap)
- [Actualizar contenido del roadmap](#actualizar-contenido-del-roadmap)
- [Eliminar roadmap](#eliminar-roadmap)
- [Eliminar contenido del roadmap](#eliminar-contenido-del-roadmap)

## Crear nuevo roadmap
```
POST /roadmaps
```
Registra un nuevo roadmap de aprendizaje en el sistema.

**Autorización requerida:** Token JWT con rol ADMIN

**Tipo de contenido:** multipart/form-data

**Parámetros del formulario:**
- `file`: Archivo JSON con la estructura del roadmap

**Estructura del archivo JSON:**
```json
{
  "roadmap": {
    "name": "Frontend Developer",
    "body": {
      "intro": {
        "intro a desarrollo frontend": {
          "description": "Este roadmap está diseñado para estudiantes que desean desarrollar habilidades en desarrollo frontend.",
          "status": "doing",
          "skill": "",
          "subject": "",
          "resources": [
            {
              "description": "Frontend Developer Career Path en Scrimba",
              "link": "https://scrimba.com/learn/frontend"
            }
          ]
        }
      },
      "Fundamentos": {
        "HTML y CSS": {
          "description": "Aprende la estructura y el diseño de páginas web con HTML y CSS.",
          "status": "doing",
          "skill": "HTML",
          "subject": "Fundamentos de Desarrollo Web",
          "resources": [
            {
              "description": "HTML & CSS Full Course - Beginner to Pro (YouTube)",
              "link": "https://www.youtube.com/watch?v=mU6anWqZJcc"
            }
          ]
        }
      },
      // Más secciones y temas...
    }
  }
}
```

**Respuesta exitosa: (201 Created)**
```json
{
  "message": "Roadmap saved successfully",
  "name": "Frontend Developer",
  "body": {
    // Estructura completa del roadmap creado
  },
  "createdAt": "2024-03-16T10:30:45.123Z",
  "updatedAt": "2024-03-16T10:30:45.123Z"
}
```

**Respuestas de error:**
- `400`: No se subió ningún archivo o el formato del JSON es inválido
- `409`: Ya existe un roadmap con el mismo nombre
- `500`: Error interno del servidor

## Obtener todos los roadmaps
```
GET /roadmaps
```
Devuelve la lista de todos los roadmaps registrados en el sistema.

**Autorización requerida:** Token JWT con rol ADMIN

**Respuesta exitosa: (200 OK)**
```json
[
  {
    "name": "Frontend Developer",
    "body": {
      // Estructura completa del roadmap
    },
    "createdAt": "2024-03-16T10:30:45.123Z",
    "updatedAt": "2024-03-16T10:30:45.123Z"
  },
  {
    "name": "Backend Development",
    "body": {
      // Estructura completa del roadmap
    },
    "createdAt": "2024-03-16T11:45:22.456Z",
    "updatedAt": "2024-03-16T11:45:22.456Z"
  },
  // Resto de roadmaps...
]
```

## Obtener roadmap por nombre (Admin)
```
GET /roadmaps/:name
```
Obtiene información detallada de un roadmap específico (acceso de administrador).

**Autorización requerida:** Token JWT con rol ADMIN

**Parámetros de ruta:**
- `name`: Nombre del roadmap a consultar

**Respuesta exitosa: (200 OK)**
```json
{
  "name": "Frontend Developer",
  "body": {
    // Estructura completa del roadmap
  },
  "createdAt": "2024-03-16T10:30:45.123Z",
  "updatedAt": "2024-03-16T10:30:45.123Z"
}
```

**Respuesta de error: (404 Not Found)**
```json
{
  "error": "Roadmap not found"
}
```

## Obtener roadmap por nombre (Estudiante)
```
GET /roadmaps/student/:name
```
Obtiene información detallada de un roadmap específico (acceso de estudiante).

**Autorización requerida:** Token JWT con rol STUDENT

**Parámetros de ruta:**
- `name`: Nombre del roadmap a consultar

**Respuesta exitosa: (200 OK)**
```json
{
  "name": "Frontend Developer",
  "body": {
    // Estructura completa del roadmap
  },
  "createdAt": "2024-03-16T10:30:45.123Z",
  "updatedAt": "2024-03-16T10:30:45.123Z"
}
```

**Respuesta de error: (404 Not Found)**
```json
{
  "error": "Roadmap not found"
}
```

## Actualizar roadmap
```
PATCH /roadmaps/:name
```
Actualiza la información general de un roadmap existente.

**Autorización requerida:** Token JWT con rol ADMIN

**Parámetros de ruta:**
- `name`: Nombre del roadmap a actualizar

**Cuerpo de la solicitud:**
```json
{
  "name": "Frontend Developer Updated",
  // Otros campos que se desean actualizar
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Roadmap updated successfully",
  "name": "Frontend Developer Updated",
  // Datos actualizados del roadmap
}
```

**Respuesta de error: (404 Not Found)**
```json
{
  "error": "Roadmap not found"
}
```

## Actualizar contenido del roadmap
```
PATCH /roadmaps/:name/body
```
Actualiza secciones específicas del contenido de un roadmap.

**Autorización requerida:** Token JWT con rol ADMIN

**Parámetros de ruta:**
- `name`: Nombre del roadmap cuyo contenido se va a actualizar

**Cuerpo de la solicitud:**
```json
{
  "field": "Fundamentos",
  "updates": {
    "HTML y CSS": {
      "description": "Descripción actualizada",
      "status": "done",
      "resources": [
        {
          "description": "Recurso actualizado",
          "link": "https://ejemplo.com/nuevo-recurso"
        }
      ]
    }
  }
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Roadmap body updated successfully",
  "name": "Frontend Developer",
  "body": {
    // Datos completos del roadmap con el contenido actualizado
  },
  "updatedAt": "2024-03-16T14:22:33.789Z"
}
```

**Respuestas de error:**
- `400`: Campo no especificado o no existe en el roadmap
- `404`: Roadmap no encontrado
- `500`: Error interno del servidor

## Eliminar roadmap
```
DELETE /roadmaps/:name
```
Elimina un roadmap del sistema.

**Autorización requerida:** Token JWT con rol ADMIN

**Parámetros de ruta:**
- `name`: Nombre del roadmap a eliminar

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Roadmap deleted",
  "name": "Frontend Developer"
}
```

**Respuesta de error: (404 Not Found)**
```json
{
  "error": "Roadmap not found"
}
```

## Eliminar contenido del roadmap
```
DELETE /roadmaps/:name/body
```
Elimina un campo específico del contenido de un roadmap.

**Autorización requerida:** Token JWT con rol ADMIN

**Parámetros de ruta:**
- `name`: Nombre del roadmap del que se eliminará contenido

**Cuerpo de la solicitud:**
```json
{
  "field": "Fundamentos"
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Roadmap body content deleted successfully",
  "name": "Frontend Developer",
  "body": {
    // Datos completos del roadmap con el campo eliminado
  },
  "updatedAt": "2024-03-16T15:10:45.123Z"
}
```

**Respuestas de error:**
- `400`: Campo no especificado o no existe en el roadmap
- `404`: Roadmap no encontrado
- `500`: Error interno del servidor