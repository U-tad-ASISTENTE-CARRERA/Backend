# Documentación de API de Usuarios

Este documento proporciona información detallada sobre todas las rutas relacionadas con usuarios en la API del Backend de GPS Académico.

## Índice

- [Autenticación](#autenticación)
- [Gestión de Perfiles](#gestión-de-perfiles)
- [Gestión de Metadatos](#gestión-de-metadatos)
- [Historial Académico](#historial-académico)
- [Gestión de Roadmaps](#gestión-de-roadmaps)
- [Interacción Estudiante-Profesor](#interacción-estudiante-profesor)
- [Sistema de Notificaciones](#sistema-de-notificaciones)
- [Operaciones de Administrador](#operaciones-de-administrador)

## Autenticación

### Registro de Usuario
Crea una nueva cuenta de usuario basada en el dominio de correo electrónico (estudiantes: live.u-tad.com, profesores: u-tad.com).

```
POST /register
```

**Cuerpo de la Solicitud:**
```json
{
  "email": "usuario@live.u-tad.com",
  "password": "ContraseñaSegura123!",
  "seedWord": "mi-frase-recuperacion"
}
```

**Respuesta (201 Created):**
```json
{
  "message": "USER_CREATED",
  "token": "jwt-token",
  "user": {
    "id": "id-usuario",
    "email": "usuario@live.u-tad.com",
    "role": "STUDENT"
  }
}
```

### Inicio de Sesión
Autentica a un usuario y devuelve un token JWT.

```
POST /login
```

**Cuerpo de la Solicitud:**
```json
{
  "email": "usuario@live.u-tad.com",
  "password": "ContraseñaSegura123!"
}
```

**Respuesta (200 OK):**
```json
{
  "message": "LOGIN_SUCCESS",
  "token": "jwt-token",
  "user": {
    "id": "id-usuario",
    "email": "usuario@live.u-tad.com",
    "role": "STUDENT",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Cierre de Sesión
Cierra la sesión del usuario actual.

```
POST /logout
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```

**Respuesta (200 OK):**
```json
{
  "message": "LOGOUT_SUCCESS"
}
```

### Actualizar Contraseña
Actualiza la contraseña de un usuario usando su palabra semilla.

```
PUT /updatePassword
```

**Cuerpo de la Solicitud:**
```json
{
  "email": "usuario@live.u-tad.com",
  "newPassword": "NuevaContraseñaSegura123!",
  "seedWord": "mi-frase-recuperacion"
}
```

**Respuesta (200 OK):**
```json
{
  "message": "PASSWORD_UPDATED_SUCCESS"
}
```

## Gestión de Perfiles

### Obtener Perfil de Usuario
Recupera el perfil completo del usuario autenticado.

```
GET /
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```

**Respuesta (200 OK):**
```json
{
  "user": {
    "id": "id-usuario",
    "email": "usuario@live.u-tad.com",
    "role": "STUDENT",
    "metadata": {
      "firstName": "Juan",
      "lastName": "Pérez",
      "degree": "INSO_DATA",
      "specialization": "Frontend Developer"
    }
  }
}
```

### Actualizar Usuario
Actualiza la información general del usuario.

```
PATCH /
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```

**Opciones:**

1. **Actualizar Email:**
```json
{
  "email": "nuevo-email@live.u-tad.com"
}
```

2. **Actualizar Palabra Semilla:**
```json
{
  "seedWord": "nueva-frase-recuperacion"
}
```

**Respuesta (200 OK):**
```json
{
  "message": "USER_UPDATED",
  "updatedFields": {
    "email": "nuevo-email@live.u-tad.com"
  }
}
```

### Eliminar Usuario
Elimina la cuenta del usuario autenticado.

```
DELETE /
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```

**Respuesta (200 OK):**
```json
{
  "message": "USER_DELETED"
}
```

## Gestión de Metadatos

### Obtener Metadatos del Usuario
Recupera solo los metadatos del usuario autenticado.

```
GET /metadata
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```

**Respuesta (200 OK):**
```json
{
  "metadata": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "degree": "INSO_DATA",
    "specialization": "Frontend Developer",
    "skills": ["HTML", "CSS", "JavaScript"]
  }
}
```

### Actualizar Metadatos del Usuario
Actualiza campos específicos de metadatos para el usuario autenticado.

```
PATCH /metadata
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```

**Opciones:**

1. **Actualizar Información Personal (Estudiante):**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "birthDate": "1995-05-15",
  "gender": "male",
  "dni": "12345678A"
}
```

2. **Actualizar Información Académica (Estudiante):**
```json
{
  "degree": "INSO_DATA",
  "specialization": "Frontend Developer",
  "endDate": "2025-06-30"
}
```

3. **Actualizar Habilidades (Estudiante):**
```json
{
  "skills": [{"skill": "JavaScript"}, {"skill": "React"}]
}
```

4. **Actualizar Idiomas (Estudiante):**
```json
{
  "languages": [{"language": "English", "level": "C1"}, {"language": "French", "level": "A2"}]
}
```

5. **Actualizar Lenguajes de Programación (Estudiante):**
```json
{
  "programming_languages": [{"name": "Python", "level": "medium"}, {"name": "JavaScript", "level": "high"}]
}
```

6. **Actualizar Certificaciones (Estudiante):**
```json
{
  "certifications": [
    {"name": "AWS Certified Developer", "date": "2024-01-15", "institution": "Amazon"},
    {"name": "Microsoft Azure Developer", "date": "2024-02-15", "institution": "Microsoft"}
  ]
}
```

7. **Actualizar Experiencia Laboral (Estudiante):**
```json
{
  "workExperience": [
    {
      "jobType": "Intern",
      "startDate": "2023-06-01",
      "endDate": "2023-12-31",
      "company": "TechCorp",
      "description": "Frontend Development",
      "responsibilities": "Developing user interfaces"
    }
  ]
}
```

8. **Actualizar Información de Profesor:**
```json
{
  "firstName": "María",
  "lastName": "Gómez",
  "gender": "female",
  "specialization": "Data Science"
}
```

**Respuesta (200 OK):**
```json
{
  "message": "METADATA_UPDATED_SUCCESS",
  "updatedFields": {
    "metadata.firstName": "Juan",
    "metadata.lastName": "Pérez"
  },
  "updateHistory": [
    {
      "timestamp": "2023-01-01T00:00:00.000Z",
      "changes": [
        {
          "field": "firstName",
          "oldValue": "Nombre Anterior",
          "newValue": "Juan"
        },
        {
          "field": "lastName",
          "oldValue": "Apellido Anterior",
          "newValue": "Pérez"
        }
      ]
    }
  ]
}
```

### Eliminar Metadatos del Usuario
Elimina campos específicos de metadatos del perfil del usuario.

```
DELETE /metadata
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```

**Opciones:**

1. **Eliminar Experiencia Laboral:**
```json
{
  "workExperience": [
    {
      "jobType": "Intern",
      "startDate": "2023-06-01",
      "endDate": "2023-12-31",
      "company": "TechCorp",
      "description": "Frontend Development",
      "responsibilities": "Developing user interfaces"
    }
  ]
}
```

2. **Eliminar Certificaciones:**
```json
{
  "certifications": [
    {"name": "AWS Certified Developer", "date": "2024-01-15", "institution": "Amazon"}
  ]
}
```

3. **Eliminar Idiomas:**
```json
{
  "languages": [{"language": "French", "level": "A2"}]
}
```

**Respuesta (200 OK):**
```json
{
  "message": "METADATA_DELETED_SUCCESS",
  "deletedFields": ["metadata.workExperience", "metadata.certifications"],
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
Recupera el historial académico de un estudiante.

```
GET /AH
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** STUDENT

**Respuesta (200 OK):**
```json
{
  "subjects": [
    {
      "name": "Fundamentos de Desarrollo Web",
      "credits": 6,
      "label": "frontend",
      "type": "B",
      "skills": ["HTML", "CSS", "JavaScript"],
      "grade": 8.5
    },
    {
      "name": "Introducción a la Programación I",
      "credits": 6,
      "label": "software",
      "type": "B",
      "skills": ["C"],
      "grade": 7.0
    }
  ],
  "lastUpdatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Inicializar/Actualizar Historial Académico
Inicializa o actualiza el historial académico de un estudiante.

```
PATCH /AH
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** STUDENT

**Opciones:**

1. **Inicializar Historial Académico (Sin Cuerpo):**  
Sin cuerpo de solicitud, solo inicializa la estructura con asignaturas basadas en el grado del estudiante.

**Respuesta (200 OK):**
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

2. **Actualizar Calificaciones:**
```json
{
  "grades": [
    {"name": "Fundamentos de Desarrollo Web", "grade": 8.5},
    {"name": "Introducción a la Programación I", "grade": 7.5},
    {"name": "Bases de Datos", "grade": 9.0}
  ]
}
```

**Respuesta (200 OK):**
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
    },
    {
      "name": "Bases de Datos",
      "credits": 6,
      "skills": ["SQL"],
      "grade": 9.0
    }
  ],
  "metadataUpdates": {
    "metadata.AH.subjects": [...],
    "metadata.AH.averageGrade": 8.33,
    "metadata.AH.totalCredits": 18,
    "metadata.skills": ["HTML", "CSS", "JavaScript", "C", "SQL"],
    "metadata.programming_languages": [...],
    "metadata.completedFields": [...],
    "metadata.yearsCompleted": [...]
  }
}
```

## Gestión de Roadmaps

### Obtener Roadmap del Usuario
Recupera el roadmap asignado al estudiante.

```
GET /userRoadmap
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** STUDENT

**Respuesta (200 OK):**
```json
{
  "roadmap": {
    "name": "Frontend Developer",
    "body": {
      "intro": {
        "intro a desarrollo frontend": {
          "status": "doing",
          "description": "Introducción al desarrollo frontend",
          "skill": "",
          "subject": "",
          "resources": [...]
        }
      },
      "fundamentos": {
        "HTML y CSS": {
          "status": "done",
          "description": "Fundamentos de HTML y CSS",
          "skill": "HTML",
          "subject": "Fundamentos de Desarrollo Web",
          "resources": [...]
        }
      }
    }
  }
}
```

### Inicializar/Auto-actualizar Roadmap
Asigna o auto-actualiza un roadmap para el estudiante basado en su especialización e historial académico.

```
PATCH /userRoadmap
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** STUDENT

**Opciones:**

1. **Inicializar/Auto-actualizar (Sin Cuerpo):**  
Sin cuerpo de solicitud, asigna o actualiza automáticamente el roadmap basado en la especialización y el historial académico.

**Respuesta (200 OK):**
```json
{
  "message": "Roadmap actualizado automáticamente"
}
```

2. **Actualizar Estado de un Tema Específico:**
```json
{
  "sectionName": "fundamentos",
  "topicName": "HTML y CSS",
  "newStatus": "done"
}
```

**Respuesta (200 OK):**
```json
{
  "message": "Roadmap actualizado correctamente"
}
```

### Eliminar Roadmap
Elimina el roadmap del perfil del estudiante.

```
DELETE /userRoadmap
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** STUDENT

**Respuesta (200 OK):**
```json
{
  "message": "Roadmap deleted successfully"
}
```

## Interacción Estudiante-Profesor

### Obtener Todos los Profesores
Recupera todos los profesores disponibles.

```
GET /teacher
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** STUDENT

**Respuesta (200 OK):**
```json
[
  {
    "id": "id-profesor-1",
    "email": "profesor1@u-tad.com",
    "role": "TEACHER",
    "metadata": {
      "firstName": "María",
      "lastName": "Gómez",
      "specialization": "Frontend Developer"
    }
  },
  {
    "id": "id-profesor-2",
    "email": "profesor2@u-tad.com",
    "role": "TEACHER",
    "metadata": {
      "firstName": "Carlos",
      "lastName": "Rodríguez",
      "specialization": "Data Science"
    }
  }
]
```

### Obtener Profesores por Especialización
Recupera profesores filtrados por especialización.

```
GET /teacher/:specialization
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** STUDENT

**Respuesta (200 OK):**
```json
[
  {
    "id": "id-profesor-1",
    "email": "profesor1@u-tad.com",
    "role": "TEACHER",
    "metadata": {
      "firstName": "María",
      "lastName": "Gómez",
      "specialization": "Frontend Developer"
    }
  }
]
```

### Obtener Profesores Asignados
Recupera los profesores asignados al estudiante.

```
GET /student/teacher
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** STUDENT

**Respuesta (200 OK):**
```json
{
  "teachers": [
    {
      "id": "id-profesor-1",
      "email": "profesor1@u-tad.com",
      "role": "TEACHER",
      "metadata": {
        "firstName": "María",
        "lastName": "Gómez",
        "specialization": "Frontend Developer"
      }
    }
  ]
}
```

### Añadir Profesor a Estudiante
Añade un profesor a la lista de profesores asignados del estudiante.

```
POST /student/teacher
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** STUDENT

**Cuerpo de la Solicitud:**
```json
{
  "teacherId": "id-profesor-1"
}
```

**Respuesta (200 OK):**
```json
{
  "message": "TEACHER_ADDED_TO_STUDENT",
  "teacherId": "id-profesor-1"
}
```

### Eliminar Profesor de Estudiante
Elimina un profesor de la lista de profesores asignados del estudiante.

```
DELETE /student/teacher
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** STUDENT

**Cuerpo de la Solicitud:**
```json
{
  "teacherId": "id-profesor-1"
}
```

**Respuesta (200 OK):**
```json
{
  "message": "TEACHER_REMOVED_FROM_STUDENT",
  "teacherId": "id-profesor-1",
  "remainingTeachers": 0
}
```

### Obtener Todos los Estudiantes (Profesor)
Recupera todos los estudiantes asignados al profesor.

```
GET /student/teacher/getAllStudents
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** TEACHER

**Respuesta (200 OK):**
```json
[
  {
    "id": "id-estudiante-1",
    "email": "estudiante1@live.u-tad.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "dni": "12345678A",
    "degree": "INSO_DATA",
    "specialization": "Frontend Developer",
    "yearsCompleted": [1, 2]
  },
  {
    "id": "id-estudiante-2",
    "email": "estudiante2@live.u-tad.com",
    "firstName": "Ana",
    "lastName": "Martínez",
    "dni": "87654321B",
    "degree": "INSO_DATA",
    "specialization": "Data Science",
    "yearsCompleted": [1]
  }
]
```

### Obtener Estudiante Específico (Profesor)
Recupera información detallada sobre un estudiante específico.

```
GET /student/teacher/getStudent
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** TEACHER

**Cuerpo de la Solicitud:**
```json
{
  "studentId": "id-estudiante-1"
}
```

**Respuesta (200 OK):**
```json
{
  "id": "id-estudiante-1",
  "email": "estudiante1@live.u-tad.com",
  "role": "STUDENT",
  "metadata": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "degree": "INSO_DATA",
    "specialization": "Frontend Developer",
    "AH": {
      "subjects": [...]
    }
  }
}
```

## Sistema de Notificaciones

### Enviar Notificación a Profesor
Envía una notificación de un estudiante a un profesor asignado.

```
POST /student/teacher/notification
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** STUDENT

**Cuerpo de la Solicitud:**
```json
{
  "teacherId": "id-profesor-1",
  "message": "Tengo una duda sobre la tarea de estructuras de datos"
}
```

**Respuesta (200 OK):**
```json
{
  "message": "NOTIFICATION_SENT",
  "notification": {
    "id": "id-notificacion",
    "senderId": "id-estudiante-1",
    "senderName": "Juan Pérez",
    "senderEmail": "estudiante1@live.u-tad.com",
    "senderRole": "STUDENT",
    "receiverId": "id-profesor-1",
    "title": "Nuevo mensaje de estudiante",
    "body": "Tengo una duda sobre la tarea de estructuras de datos",
    "timestamp": "2023-01-01T00:00:00.000Z",
    "read": false
  }
}
```

### Obtener Notificaciones de Profesor
Recupera todas las notificaciones recibidas por el profesor.

```
GET /student/teacher/notification
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** TEACHER

**Parámetros de Consulta:**
- `limit`: Número máximo de notificaciones a devolver (por defecto: 20)
- `startAfter`: ID de la última notificación de la página anterior para paginación
- `onlyUnread`: Filtrar solo notificaciones no leídas (true/false)

**Respuesta (200 OK):**
```json
{
  "notifications": [
    {
      "id": "id-notificacion-1",
      "senderId": "id-estudiante-1",
      "senderName": "Juan Pérez",
      "senderEmail": "estudiante1@live.u-tad.com",
      "title": "Nuevo mensaje de estudiante",
      "body": "Tengo una duda sobre la tarea de estructuras de datos",
      "timestamp": "2023-01-01T00:00:00.000Z",
      "read": false
    },
    {
      "id": "id-notificacion-2",
      "senderId": "id-estudiante-2",
      "senderName": "Ana Martínez",
      "senderEmail": "estudiante2@live.u-tad.com",
      "title": "Nuevo mensaje de estudiante",
      "body": "¿Podemos programar una reunión para discutir mi proyecto?",
      "timestamp": "2023-01-02T00:00:00.000Z",
      "read": true
    }
  ],
  "pagination": {
    "total": 10,
    "unreadCount": 5,
    "hasMore": true,
    "nextCursor": "id-notificacion-2"
  }
}
```

### Obtener Notificaciones de Profesor por Estudiante
Recupera notificaciones de un estudiante específico.

```
GET /student/teacher/notification/byStudent
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** TEACHER

**Parámetros de Consulta:**
- `studentId`: ID del estudiante
- `limit`: Número máximo de notificaciones a devolver (por defecto: 20)
- `startAfter`: ID de la última notificación de la página anterior para paginación
- `onlyUnread`: Filtrar solo notificaciones no leídas (true/false)

**Respuesta (200 OK):**
```json
{
  "notifications": [
    {
      "id": "id-notificacion-1",
      "senderId": "id-estudiante-1",
      "senderName": "Juan Pérez",
      "title": "Nuevo mensaje de estudiante",
      "body": "Tengo una duda sobre la tarea de estructuras de datos",
      "timestamp": "2023-01-01T00:00:00.000Z",
      "read": false
    }
  ],
  "pagination": {
    "total": 5,
    "unreadCount": 3,
    "hasMore": true,
    "nextCursor": "id-notificacion-1"
  }
}
```

### Actualizar Estado de Notificación
Actualiza el estado de lectura de una notificación.

```
PATCH /student/teacher/notification
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** TEACHER

**Cuerpo de la Solicitud:**
```json
{
  "notificationId": "id-notificacion-1",
  "read": true
}
```

**Respuesta (200 OK):**
```json
{
  "message": "NOTIFICATION_MARKED_AS_READ",
  "notification": {
    "id": "id-notificacion-1",
    "read": true,
    "readAt": "2023-01-03T00:00:00.000Z"
  }
}
```

### Marcar Todas las Notificaciones como Leídas
Marca todas las notificaciones como leídas para un profesor.

```
POST /student/teacher/notification/read-all
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** TEACHER

**Respuesta (200 OK):**
```json
{
  "message": "ALL_NOTIFICATIONS_MARKED_AS_READ",
  "unreadCount": 0
}
```

### Eliminar Notificación
Elimina una notificación específica.

```
DELETE /student/teacher/notification/:notificationId
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** TEACHER

**Respuesta (200 OK):**
```json
{
  "message": "NOTIFICATION_DELETED",
  "notificationId": "id-notificacion-1"
}
```

## Operaciones de Administrador

### Crear Administrador
Crea un usuario administrador predefinido.

```
POST /admin
```

**Respuesta (201 Created):**
```json
{
  "message": "HARDCODED_ADMIN_CREATED",
  "token": "jwt-token",
  "user": {
    "email": "admin@u-tad.com",
    "role": "ADMIN"
  }
}
```

### Obtener Todos los Usuarios
Recupera todos los usuarios en el sistema.

```
GET /admin
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** ADMIN

**Respuesta (200 OK):**
```json
[
  {
    "id": "id-usuario-1",
    "email": "estudiante1@live.u-tad.com",
    "role": "STUDENT",
    "metadata": {...}
  },
  {
    "id": "id-usuario-2",
    "email": "profesor1@u-tad.com",
    "role": "TEACHER",
    "metadata": {...}
  }
]
```

### Obtener Estudiante Específico (Admin)
Recupera un estudiante específico por ID.

```
GET /admin/student
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```
**Rol Requerido:** ADMIN

**Parámetros de Consulta:**
- `id`: ID del Estudiante

**Respuesta (200 OK):**
```json
{
  "id": "id-estudiante-1",
  "email": "estudiante1@live.u-tad.com",
  "role": "STUDENT",
  "metadata": {...}
}
```

### Actualizar Usuario (Admin)
Actualiza un usuario por ID.
```
PATCH /admin/:id
```

**Cabeceras:**
```
Authorization: Bearer jwt-token
```

**Rol Requerido:** ADMIN

**Descripción:**
Este endpoint permite a los administradores actualizar diferentes aspectos de un usuario existente. Soporta actualizaciones parciales, lo que significa que no es necesario proporcionar todos los campos en cada solicitud.

**Tipos de Actualización:**

1. **Actualizar Email y Rol:**
```json
{
    "email": "nuevo-email@live.u-tad.com",
    "role": "STUDENT"
}
```

2. **Actualizar Contraseña:**
```json
{
    "password": "NuevaContraseñaSegura123!"
}
```

3. **Actualizar Metadatos:**
```json
{
    "metadata": {
        "firstName": "Nombre Actualizado",
        "lastName": "Apellido Actualizado"
    }
}
```

4. **Actualización Completa:**
```json
{
    "email": "nuevo-email@live.u-tad.com",
    "password": "NuevaContraseñaSegura123!",
    "role": "STUDENT",
    "metadata": {
        "firstName": "Nombre Actualizado",
        "lastName": "Apellido Actualizado"
    }
}
```

**Parámetros:**
- `id` (requerido): ID del usuario a actualizar (en la URL)
- `email` (opcional): Nuevo correo electrónico del usuario
- `password` (opcional): Nueva contraseña del usuario
- `role` (opcional): Nuevo rol del usuario
- `metadata` (opcional): Nuevos metadatos del usuario

**Validaciones:**
- El token JWT debe ser válido y pertenecer a un usuario con rol ADMIN
- El `email` debe ser un formato de correo electrónico válido
- La `password` debe cumplir con los requisitos de seguridad definidos
- El `role` debe ser uno de los roles predefinidos en el sistema
- Los campos de `metadata` deben cumplir con la estructura esperada

**Respuesta Exitosa (200 OK):**
```json
{
    "message": "USER_UPDATED_SUCCESSFULLY",
    "updatedUser": {
        "id": "id-usuario-1",
        "email": "nuevo-email@live.u-tad.com",
        "role": "STUDENT",
        "metadata": {
            "firstName": "Nombre Actualizado",
            "lastName": "Apellido Actualizado"
        }
    }
}
```

**Posibles Errores:**
- `401 Unauthorized`: Token JWT inválido o expirado
- `403 Forbidden`: El usuario no tiene permisos de administrador
- `404 Not Found`: El usuario con el ID especificado no existe
- `400 Bad Request`: Datos de actualización inválidos (formato de email incorrecto, contraseña débil, etc.)

**Notas:**
- Solo se actualizarán los campos proporcionados en la solicitud
- La contraseña se hashea antes de almacenarla
- Los metadatos se pueden actualizar parcial o totalmente