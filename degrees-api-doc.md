# Documentación de API - Degrees (Titulaciones)

Esta documentación describe todas las rutas disponibles para la gestión de titulaciones académicas (degrees) en el backend de GPS Académico.

## Índice
- [Obtener todas las titulaciones](#obtener-todas-las-titulaciones)
- [Obtener titulación por nombre](#obtener-titulación-por-nombre)
- [Crear nueva titulación](#crear-nueva-titulación)
- [Actualizar titulación](#actualizar-titulación)
- [Eliminar titulación](#eliminar-titulación)
- [Actualizar asignaturas](#actualizar-asignaturas)
- [Eliminar asignaturas](#eliminar-asignaturas)

## Obtener todas las titulaciones
```
GET /degrees
```
Devuelve la lista de todas las titulaciones académicas registradas en el sistema.

**Autorización requerida:** Token JWT con rol ADMIN

**Respuesta exitosa: (200 OK)**
```json
[
  {
    "id": "INSO_DATA",
    "name": "INSO_DATA",
    "subjects": [
      {
        "mention": "",
        "name": "Fundamentos de Desarrollo Web",
        "credits": 6,
        "label": "frontend",
        "type": "B",
        "programming_languages": "HTML",
        "skills": ["HTML", "CSS", "JavaScript"],
        "year": 1
      },
      // Resto de asignaturas...
    ],
    "createdAt": "2024-03-16T10:30:45.123Z",
    "updatedAt": "2024-03-16T10:30:45.123Z"
  },
  // Resto de titulaciones...
]
```

## Obtener titulación por nombre
```
GET /degrees/:name
```
Obtiene información detallada de una titulación específica.

**Autorización requerida:** Token JWT con rol STUDENT o ADMIN

**Parámetros de ruta:**
- `name`: Nombre de la titulación a consultar

**Respuesta exitosa: (200 OK)**
```json
{
  "id": "INSO_DATA",
  "name": "INSO_DATA",
  "subjects": [
    {
      "mention": "",
      "name": "Fundamentos de Desarrollo Web",
      "credits": 6,
      "label": "frontend",
      "type": "B",
      "programming_languages": "HTML",
      "skills": ["HTML", "CSS", "JavaScript"],
      "year": 1
    },
    // Resto de asignaturas...
  ],
  "createdAt": "2024-03-16T10:30:45.123Z",
  "updatedAt": "2024-03-16T10:30:45.123Z"
}
```

**Respuesta de error: (404 Not Found)**
```json
{
  "error": "Degree not found"
}
```

## Crear nueva titulación
```
POST /degrees
```
Registra una nueva titulación académica en el sistema con sus asignaturas correspondientes.

**Autorización requerida:** Token JWT con rol ADMIN

**Tipo de contenido:** multipart/form-data

**Parámetros del formulario:**
- `file`: Archivo JSON con la estructura de la titulación

**Estructura del archivo JSON:**
```json
{
  "degree": {
    "name": "INSO_DATA",
    "subjects": [
      {
        "mention": "",
        "name": "Fundamentos de Desarrollo Web",
        "credits": 6,
        "label": "frontend",
        "type": "B",
        "programming_languages": "HTML",
        "skills": ["HTML", "CSS", "JavaScript"],
        "year": 1
      },
      // Más asignaturas...
    ]
  }
}
```

**Respuesta exitosa: (201 Created)**
```json
{
  "message": "Degree saved successfully",
  "id": "INSO_DATA",
  "name": "INSO_DATA",
  "subjects": [
    // Lista de asignaturas creadas...
  ],
  "createdAt": "2024-03-16T10:30:45.123Z",
  "updatedAt": "2024-03-16T10:30:45.123Z"
}
```

**Respuestas de error:**
- `400`: No se subió ningún archivo o el formato del JSON es inválido
- `409`: Ya existe una titulación con el mismo nombre
- `500`: Error interno del servidor

## Actualizar titulación
```
PATCH /degrees/:name
```
Actualiza la información general de una titulación existente.

**Autorización requerida:** Token JWT con rol ADMIN

**Parámetros de ruta:**
- `name`: Nombre de la titulación a actualizar

**Cuerpo de la solicitud:**
```json
{
  // Campos que se desean actualizar
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "id": "INSO_DATA",
  // Datos actualizados de la titulación
  "updatedAt": "2024-03-16T11:45:22.456Z"
}
```

**Respuesta de error: (404 Not Found)**
```json
{
  "error": "Degree not found"
}
```

## Eliminar titulación
```
DELETE /degrees/:name
```
Elimina una titulación académica del sistema.

**Autorización requerida:** Token JWT con rol ADMIN

**Parámetros de ruta:**
- `name`: Nombre de la titulación a eliminar

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Degree deleted",
  "id": "INSO_DATA"
}
```

**Respuesta de error: (404 Not Found)**
```json
{
  "error": "Degree not found"
}
```

## Actualizar asignaturas
```
PATCH /degrees/subjects/:name
```
Actualiza las asignaturas específicas de una titulación.

**Autorización requerida:** Token JWT con rol ADMIN

**Parámetros de ruta:**
- `name`: Nombre de la titulación cuyas asignaturas se van a actualizar

**Cuerpo de la solicitud:**
```json
{
  "subjects": [
    {
      "name": "Fundamentos de Desarrollo Web",
      "credits": 6,
      "label": "frontend",
      "type": "B",
      "skills": ["HTML", "CSS", "JavaScript"],
      "year": 1
    },
    // Más asignaturas a actualizar...
  ]
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Subjects updated successfully",
  "updatedSubjects": ["Fundamentos de Desarrollo Web", "..."],
  "degree": {
    // Datos completos de la titulación con asignaturas actualizadas
  }
}
```

**Respuestas de error:**
- `400`: Array de asignaturas inválido
- `404`: Titulación no encontrada
- `500`: Error interno del servidor

## Eliminar asignaturas
```
DELETE /degrees/subjects/:name
```
Elimina asignaturas específicas de una titulación.

**Autorización requerida:** Token JWT con rol ADMIN

**Parámetros de ruta:**
- `name`: Nombre de la titulación de la que se eliminarán asignaturas

**Cuerpo de la solicitud:**
```json
{
  "subjects": [
    "Fundamentos de Desarrollo Web",
    "Bases de Datos",
    // Más nombres de asignaturas a eliminar...
  ]
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Subjects deleted successfully",
  "deletedSubjects": ["Fundamentos de Desarrollo Web", "Bases de Datos"],
  "degree": {
    // Datos completos de la titulación con las asignaturas restantes
  }
}
```

**Respuestas de error:**
- `400`: Array de asignaturas inválido
- `404`: Titulación no encontrada o asignaturas no encontradas
- `500`: Error interno del servidor