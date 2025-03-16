# Documentación de API - GPS Académico Backend (Revisada)

Esta documentación describe todas las rutas disponibles en el backend de GPS Académico, organizadas por categoría funcional.

## Índice

- [Autenticación y Gestión de Usuarios](#autenticación-y-gestión-de-usuarios)
- [Gestión de Perfiles](#gestión-de-perfiles)
- [Historial Académico](#historial-académico)
- [Roadmaps](#roadmaps)
- [Interacción Estudiante-Profesor](#interacción-estudiante-profesor)
- [Titulaciones (Degrees)](#titulaciones-degrees)
- [Administración](#administración)

## Autenticación y Gestión de Usuarios

### Registro de Usuario

```
POST /register
```

Registra un nuevo usuario (estudiante o profesor) en el sistema.

**Cuerpo de la solicitud:**
```json
{
  "email": "usuario@live.u-tad.com",
  "password": "ContraseñaSegura123!",
  "seedWord": "palabra-semilla"
}
```

**Respuesta exitosa: (201 Created)**
```json
{
  "message": "USER_CREATED",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "email": "usuario@live.u-tad.com",
    "role": "STUDENT"
  }
}
```

### Inicio de Sesión

```
POST /login
```

Autentica un usuario existente.

**Cuerpo de la solicitud:**
```json
{
  "email": "usuario@live.u-tad.com",
  "password": "ContraseñaSegura123!"
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "LOGIN_SUCCESS",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "email": "usuario@live.u-tad.com",
    "role": "STUDENT"
  }
}
```

### Cierre de Sesión

```
POST /logout
```

Cierra la sesión del usuario actual.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "LOGOUT_SUCCESS"
}
```

### Actualizar Contraseña

```
PUT /updatePassword
```

Actualiza la contraseña de un usuario usando su seed word.

**Cuerpo de la solicitud:**
```json
{
  "email": "usuario@live.u-tad.com",
  "newPassword": "NuevaContraseñaSegura123!",
  "seedWord": "palabra-semilla"
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "PASSWORD_UPDATED_SUCCESS"
}
```

### Actualizar Seed Word

```
PATCH /
```

Actualiza la palabra semilla (seed word) del usuario.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`

**Cuerpo de la solicitud:**
```json
{
  "seedWord": "nueva-palabra-semilla"
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "SEED_WORD_UPDATED_SUCCESS"
}
```

### Actualizar Usuario

```
PATCH /
```

Actualiza información general del usuario autenticado.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`

**Cuerpo de la solicitud:**
```json
{
  "email": "nuevo-email@live.u-tad.com"
  // Otros campos actualizables
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "USER_UPDATED",
  "updatedFields": {
    "email": "nuevo-email@live.u-tad.com"
  }
}
```

### Eliminar Usuario

```
DELETE /
```

Elimina la cuenta del usuario autenticado.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "USER_DELETED"
}
```

## Gestión de Perfiles

### Obtener Perfil

```
GET /
```

Obtiene el perfil completo del usuario autenticado.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`

**Respuesta exitosa: (200 OK)**
```json
{
  "user": {
    "id": "user-id",
    "email": "usuario@live.u-tad.com",
    "role": "STUDENT",
    "metadata": {
      "firstName": "Nombre",
      "lastName": "Apellido",
      "degree": "INSO_DATA",
      "specialization": "Frontend Developer",
      "skills": ["HTML", "CSS", "JavaScript"]
    }
  }
}
```

### Obtener Metadatos

```
GET /metadata
```

Obtiene solo los metadatos del usuario autenticado.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`

**Respuesta exitosa: (200 OK)**
```json
{
  "metadata": {
    "firstName": "Nombre",
    "lastName": "Apellido",
    "degree": "INSO_DATA",
    "specialization": "Frontend Developer",
    "skills": ["HTML", "CSS", "JavaScript"]
  }
}
```

### Actualizar Metadatos

```
PATCH /metadata
```

Actualiza los metadatos del usuario autenticado.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`

**Cuerpo de la solicitud (estudiante):**
```json
{
  "firstName": "Nuevo Nombre",
  "lastName": "Nuevo Apellido",
  "degree": "INSO_DATA",
  "specialization": "Frontend Developer",
  "skills": [
    { "skill": "JavaScript" },
    { "skill": "React" }
  ],
  "languages": [
    { "language": "English", "level": "C1" }
  ],
  "certifications": [
    { "name": "AWS Certified Developer", "date": "2024-01-15", "institution": "Amazon" }
  ]
}
```

**Cuerpo de la solicitud (profesor):**
```json
{
  "firstName": "Nuevo Nombre",
  "lastName": "Nuevo Apellido",
  "gender": "male",
  "specialization": "Frontend Developer"
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "METADATA_UPDATED_SUCCESS",
  "updatedFields": {
    "metadata.firstName": "Nuevo Nombre",
    "metadata.lastName": "Nuevo Apellido"
  },
  "updateHistory": [
    {
      "timestamp": "2023-01-01T00:00:00.000Z",
      "changes": [
        {
          "field": "firstName",
          "oldValue": "Nombre",
          "newValue": "Nuevo Nombre"
        }
      ]
    }
  ]
}
```

### Eliminar Metadatos

```
DELETE /metadata
```

Elimina campos específicos de los metadatos.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`

**Cuerpo de la solicitud:**
```json
{
  "workExperience": [
    { 
      "jobType": "Intern", 
      "startDate": "2023-06-01", 
      "endDate": "2023-12-31", 
      "company": "Nvidia", 
      "description": "AI Developer", 
      "responsibilities": "AI development tasks" 
    }
  ]
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "METADATA_DELETED_SUCCESS",
  "deletedFields": ["metadata.workExperience"],
  "updateHistory": [
    {
      "timestamp": "2023-01-01T00:00:00.000Z",
      "changes": [
        {
          "field": "workExperience",
          "oldValue": [{...}],
          "newValue": "DELETED"
        }
      ]
    }
  ]
}
```

## Historial Académico

### Obtener Historial Académico

```
GET /AH
```

Obtiene el historial académico (Academic History) del estudiante.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: STUDENT

**Respuesta exitosa: (200 OK)**
```json
{
  "subjects": [
    {
      "name": "Fundamentos de Desarrollo Web",
      "credits": 6,
      "skills": ["HTML", "CSS", "JavaScript"],
      "grade": 8.5
    },
    {
      "name": "Introducción a la Programación I",
      "credits": 6,
      "skills": ["C"],
      "grade": 7.0
    }
  ],
  "lastUpdatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Inicializar Historial Académico

```
PATCH /AH
```

Inicializa el historial académico del estudiante (sin enviar calificaciones).

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: STUDENT

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "AH_INITIALIZED",
  "metadataAH": {
    "subjects": [
      {
        "name": "Fundamentos de Desarrollo Web",
        "credits": 6,
        "skills": ["HTML", "CSS", "JavaScript"],
        "grade": null
      },
      {
        "name": "Introducción a la Programación I",
        "credits": 6,
        "skills": ["C"],
        "grade": null
      }
    ]
  }
}
```

### Actualizar Calificaciones

```
PATCH /AH
```

Actualiza las calificaciones del estudiante.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: STUDENT

**Cuerpo de la solicitud:**
```json
{
  "grades": [
    { "name": "Fundamentos de Desarrollo Web", "grade": 8.5 },
    { "name": "Introducción a la Programación I", "grade": 7.5 }
  ]
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "SUBJECTS_METADATA_UPDATED",
  "updatedSubjects": [
    {
      "name": "Fundamentos de Desarrollo Web",
      "credits": 6,
      "skills": ["HTML", "CSS", "JavaScript"],
      "grade": 8.5
    },
    {
      "name": "Introducción a la Programación I",
      "credits": 6,
      "skills": ["C"],
      "grade": 7.5
    }
  ],
  "metadataUpdates": {
    "metadata.AH.subjects": [...],
    "metadata.AH.averageGrade": 8.0,
    "metadata.AH.totalCredits": 12,
    "metadata.AH.totalCreditsWithGrades": 12,
    "metadata.AH.top5BestSubjects": [...],
    "metadata.AH.top5WorstSubjects": [...],
    "metadata.AH.lastUpdatedAt": "2023-01-01T00:00:00.000Z",
    "metadata.skills": ["HTML", "CSS", "JavaScript", "C"],
    "metadata.programming_languages": [...],
    "metadata.completedFields": [...],
    "metadata.yearsCompleted": [1]
  },
  "updateHistory": [...]
}
```

## Roadmaps

### Obtener Roadmap de Usuario

```
GET /userRoadmap
```

Obtiene el roadmap asignado al estudiante.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: STUDENT

**Respuesta exitosa: (200 OK)**
```json
{
  "roadmap": {
    "name": "Frontend Developer",
    "body": {
      "intro": {
        "intro a desarrollo frontend": {
          "status": "doing",
          "description": "Introducción al desarrollo frontend"
        }
      },
      "fundamentos": {
        "HTML y CSS": {
          "status": "done",
          "description": "Fundamentos de HTML y CSS"
        }
      }
    }
  }
}
```

### Asignar/Inicializar Roadmap

```
PATCH /userRoadmap
```

Asigna o inicializa un roadmap para el estudiante basado en su especialización (sin parámetros adicionales).

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: STUDENT

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Roadmap asignado correctamente"
}
```

### Autocompletar Roadmap

```
PATCH /userRoadmap
```

Actualiza automáticamente el roadmap según el historial académico del estudiante (sin modificar un tema específico).

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: STUDENT

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Roadmap actualizado automáticamente"
}
```

### Actualizar Estado de Tema en Roadmap

```
PATCH /userRoadmap
```

Actualiza el estado de un tema específico en el roadmap del estudiante.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: STUDENT

**Cuerpo de la solicitud:**
```json
{
  "sectionName": "fundamentos",
  "topicName": "HTML y CSS",
  "newStatus": "done"
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Roadmap actualizado correctamente"
}
```

### Eliminar Roadmap

```
DELETE /userRoadmap
```

Elimina el roadmap asignado al estudiante.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: STUDENT

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Roadmap deleted successfully"
}
```

## Interacción Estudiante-Profesor

### Obtener Todos los Profesores

```
GET /teacher
```

Obtiene la lista de todos los profesores disponibles.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: STUDENT

**Respuesta exitosa: (200 OK)**
```json
[
  {
    "id": "teacher-id",
    "email": "profesor@u-tad.com",
    "role": "TEACHER",
    "metadata": {
      "firstName": "Nombre",
      "lastName": "Apellido",
      "specialization": "Frontend Developer"
    }
  }
]
```

### Obtener Profesores por Especialización

```
GET /teacher/:specialization
```

Obtiene la lista de profesores filtrados por especialización.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: STUDENT

**Respuesta exitosa: (200 OK)**
```json
[
  {
    "id": "teacher-id",
    "email": "profesor@u-tad.com",
    "role": "TEACHER",
    "metadata": {
      "firstName": "Nombre",
      "lastName": "Apellido",
      "specialization": "Frontend Developer"
    }
  }
]
```

### Obtener Profesores Asignados

```
GET /student/teacher
```

Obtiene la lista de profesores asignados al estudiante.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: STUDENT

**Respuesta exitosa: (200 OK)**
```json
{
  "teachers": [
    {
      "id": "teacher-id",
      "email": "profesor@u-tad.com",
      "role": "TEACHER",
      "metadata": {
        "firstName": "Nombre",
        "lastName": "Apellido",
        "specialization": "Frontend Developer"
      }
    }
  ]
}
```

### Añadir Profesor

```
POST /student/teacher
```

Añade un profesor a la lista del estudiante.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: STUDENT

**Cuerpo de la solicitud:**
```json
{
  "teacherId": "teacher-id"
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "TEACHER_ADDED_TO_STUDENT",
  "teacherId": "teacher-id"
}
```

### Enviar Notificación a Profesor

```
POST /student/teacher/notification
```

Envía una notificación a un profesor asignado.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: STUDENT

**Cuerpo de la solicitud:**
```json
{
  "teacherId": "teacher-id",
  "message": "Consulta sobre programación"
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "NOTIFICATION_SENT",
  "notification": {
    "studentId": "student-id",
    "message": "Consulta sobre programación",
    "date": "2023-01-01T00:00:00.000Z",
    "status": "unread"
  }
}
```

### Obtener Notificaciones (Profesor)

```
GET /student/teacher/notification
```

Obtiene las notificaciones recibidas por el profesor.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: TEACHER

**Respuesta exitosa: (200 OK)**
```json
{
  "notifications": [
    {
      "studentId": "student-id",
      "message": "Consulta sobre programación",
      "date": "2023-01-01T00:00:00.000Z",
      "status": "unread"
    }
  ]
}
```

### Obtener Estudiantes (Profesor)

```
GET /student/teacher/getAllStudents
```

Obtiene la lista de estudiantes asignados al profesor.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: TEACHER

**Respuesta exitosa: (200 OK)**
```json
[
  {
    "id": "student-id",
    "email": "estudiante@live.u-tad.com",
    "firstName": "Nombre",
    "lastName": "Apellido",
    "dni": "12345678A",
    "degree": "INSO_DATA",
    "specialization": "Frontend Developer",
    "yearsCompleted": [1, 2]
  }
]
```

### Obtener Estudiante Específico (Profesor)

```
GET /student/teacher/getStudent
```

Obtiene la información detallada de un estudiante específico.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: TEACHER

**Cuerpo de la solicitud:**
```json
{
  "studentId": "student-id"
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "id": "student-id",
  "email": "estudiante@live.u-tad.com",
  "role": "STUDENT",
  "metadata": {
    "firstName": "Nombre",
    "lastName": "Apellido",
    "degree": "INSO_DATA",
    "specialization": "Frontend Developer",
    "AH": {
      "subjects": [...]
    }
  }
}
```

## Titulaciones (Degrees)

### Crear Titulación

```
POST /degrees
```

Crea una nueva titulación.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: ADMIN

**Formato:** multipart/form-data
- `file`: Archivo JSON con la estructura de la titulación

**Respuesta exitosa: (201 Created)**
```json
{
  "message": "Degree saved successfully",
  "name": "INSO_DATA",
  "subjects": [...]
}
```

### Obtener Todas las Titulaciones

```
GET /degrees
```

Obtiene todas las titulaciones disponibles.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: ADMIN

**Respuesta exitosa: (200 OK)**
```json
[
  {
    "id": "INSO_DATA",
    "name": "INSO_DATA",
    "subjects": [...]
  }
]
```

### Obtener Titulación por Nombre

```
GET /degrees/:name
```

Obtiene una titulación específica por su nombre.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: STUDENT o ADMIN

**Respuesta exitosa: (200 OK)**
```json
{
  "id": "INSO_DATA",
  "name": "INSO_DATA",
  "subjects": [...]
}
```

### Actualizar Titulación

```
PATCH /degrees/:name
```

Actualiza una titulación completa.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: ADMIN

**Cuerpo de la solicitud:**
```json
{
  "name": "INSO_DATA",
  "subjects": [...]
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "id": "INSO_DATA",
  "name": "INSO_DATA",
  "subjects": [...],
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Actualizar Asignaturas

```
PATCH /degrees/subjects/:name
```

Actualiza asignaturas específicas de una titulación.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: ADMIN

**Cuerpo de la solicitud:**
```json
{
  "subjects": [
    {
      "name": "Fundamentos de Desarrollo Web",
      "credits": 7,
      "label": "frontend",
      "type": "B",
      "skills": ["HTML", "CSS", "JavaScript"],
      "year": 1
    }
  ]
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Subjects updated successfully",
  "updatedSubjects": ["Fundamentos de Desarrollo Web"],
  "degree": {
    "name": "INSO_DATA",
    "subjects": [...]
  }
}
```

### Eliminar Asignaturas

```
DELETE /degrees/subjects/:name
```

Elimina asignaturas específicas de una titulación.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: ADMIN

**Cuerpo de la solicitud:**
```json
{
  "subjects": ["Fundamentos de Desarrollo Web"]
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Subjects deleted successfully",
  "deletedSubjects": ["Fundamentos de Desarrollo Web"],
  "degree": {
    "name": "INSO_DATA",
    "subjects": [...]
  }
}
```

### Eliminar Titulación

```
DELETE /degrees/:name
```

Elimina una titulación completa.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: ADMIN

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Degree deleted",
  "id": "INSO_DATA"
}
```

## Roadmaps (Administración)

### Crear Roadmap

```
POST /roadmaps
```

Crea un nuevo roadmap.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: ADMIN

**Formato:** multipart/form-data
- `file`: Archivo JSON con la estructura del roadmap

**Respuesta exitosa: (201 Created)**
```json
{
  "message": "Roadmap saved successfully",
  "name": "Frontend Developer",
  "body": {...}
}
```

### Obtener Todos los Roadmaps

```
GET /roadmaps
```

Obtiene todos los roadmaps disponibles.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: ADMIN

**Respuesta exitosa: (200 OK)**
```json
[
  {
    "name": "Frontend Developer",
    "body": {...}
  }
]
```

### Obtener Roadmap por Nombre (Admin)

```
GET /roadmaps/:name
```

Obtiene un roadmap específico por su nombre.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: ADMIN

**Respuesta exitosa: (200 OK)**
```json
{
  "name": "Frontend Developer",
  "body": {...}
}
```

### Obtener Roadmap por Nombre (Estudiante)

```
GET /roadmaps/student/:name
```

Obtiene un roadmap específico por su nombre (acceso para estudiantes).

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: STUDENT

**Respuesta exitosa: (200 OK)**
```json
{
  "name": "Frontend Developer",
  "body": {...}
}
```

### Actualizar Roadmap

```
PATCH /roadmaps/:name
```

Actualiza un roadmap completo.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: ADMIN

**Cuerpo de la solicitud:**
```json
{
  "name": "Frontend Developer",
  "body": {...}
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Roadmap updated successfully",
  "name": "Frontend Developer",
  "body": {...}
}
```

### Actualizar Contenido Específico del Roadmap

```
PATCH /roadmaps/:name/body
```

Actualiza una sección específica de un roadmap.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: ADMIN

**Cuerpo de la solicitud:**
```json
{
  "field": "intro",
  "updates": {
    "intro a desarrollo frontend": {
      "description": "Descripción actualizada",
      "status": "done"
    }
  }
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Roadmap body updated successfully",
  "name": "Frontend Developer",
  "body": {...}
}
```

### Eliminar Contenido Específico del Roadmap

```
DELETE /roadmaps/:name/body
```

Elimina una sección específica de un roadmap.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: ADMIN

**Cuerpo de la solicitud:**
```json
{
  "field": "avanzado"
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Roadmap body content deleted successfully",
  "name": "Frontend Developer",
  "body": {...}
}
```

### Eliminar Roadmap

```
DELETE /roadmaps/:name
```

Elimina un roadmap completo.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: ADMIN

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "Roadmap deleted",
  "name": "Frontend Developer"
}
```

## Administración

### Crear Admin

```
POST /admin
```

Crea un usuario administrador hardcodeado.

**Respuesta exitosa: (201 Created)**
```json
{
  "message": "HARDCODED_ADMIN_CREATED",
  "token": "jwt-token",
  "user": {
    "email": "alvaro.vazquez.1716@gmail.com",
    "role": "ADMIN"
  }
}
```

### Obtener Todos los Usuarios

```
GET /admin
```

Obtiene la lista de todos los usuarios registrados.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: ADMIN

**Respuesta exitosa: (200 OK)**
```json
[
  {
    "id": "user-id",
    "email": "usuario@live.u-tad.com",
    "role": "STUDENT",
    "metadata": {...}
  }
]
```

### Actualizar Usuario por ID

```
PATCH /admin/:id
```

Actualiza un usuario específico por su ID.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: ADMIN

**Cuerpo de la solicitud:**
```json
{
  "email": "nuevo-email@live.u-tad.com",
  "password": "NuevaContraseña123!",
  "role": "STUDENT",
  "metadata": {...}
}
```

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "USER_UPDATED_SUCCESSFULLY",
  "updatedUser": {
    "id": "user-id",
    "email": "nuevo-email@live.u-tad.com",
    "role": "STUDENT",
    "metadata": {...}
  }
}
```

### Eliminar Usuario por ID

```
DELETE /admin/:id
```

Elimina un usuario específico por su ID.

**Encabezados requeridos:**
- `Authorization: Bearer jwt-token`
- Requiere rol: ADMIN

**Respuesta exitosa: (200 OK)**
```json
{
  "message": "USER_DELETED_SUCCESSFULLY"
}
```