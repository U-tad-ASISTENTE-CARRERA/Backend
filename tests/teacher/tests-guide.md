# Guía de Testing: CRUD de Usuarios (Profesor)

Esta guía explica cómo implementar y ejecutar pruebas unitarias para las operaciones relacionadas con usuarios de tipo Profesor. Los tests están diseñados para verificar las funcionalidades específicas disponibles para profesores en la aplicación.

## Estructura de Tests

Los tests están divididos en dos archivos principales:

1. `users.test.js` - Prueba los endpoints de la API para operaciones realizadas por profesores
2. `user-model-teacher.test.js` - Prueba las operaciones del modelo User específicas para profesores

## Funcionalidades probadas

### Controller (API)

- **Registro y Login de Profesor**: Prueba la creación de usuarios profesor y su autenticación
- **Gestión de Perfil**: Verifica la obtención y actualización de datos del profesor
- **Gestión de Estudiantes**: Prueba la obtención de estudiantes asignados al profesor
- **Notificaciones**: Verifica la gestión de notificaciones recibidas de estudiantes

### Modelo

- **Instanciación**: Prueba la creación de una instancia de User con rol profesor
- **Gestión de datos**: Verifica operaciones CRUD específicas para profesores
- **Gestión de notificaciones**: Prueba la actualización de notificaciones recibidas

## Cómo ejecutar los tests

Para ejecutar solo los tests relacionados con profesores:

```bash
npm run test:teacher
```

Para ejecutar solo las pruebas del modelo:

```bash
npx jest teacher/user-model-teacher.test.js
```

Para ejecutar solo las pruebas del controlador:

```bash
npx jest teacher/users.test.js
```

## Casos de prueba

### Registro y Login de Profesor
- ✓ Debe registrar correctamente un nuevo profesor con email de dominio u-tad.com
- ✓ Debe iniciar sesión correctamente y actualizar la fecha de último acceso

### Gestión de Perfil
- ✓ Debe obtener el perfil completo del profesor
- ✓ Debe actualizar los metadatos específicos de profesor (firstName, lastName, specialization, etc.)
- ✓ Debe actualizar la contraseña con el seed word correcto

### Gestión de Estudiantes
- ✓ Debe obtener todos los estudiantes asignados al profesor
- ✓ Debe obtener la información detallada de un estudiante específico
- ✓ Debe verificar que el estudiante esté asignado al profesor antes de mostrar su información

### Notificaciones
- ✓ Debe obtener todas las notificaciones recibidas de estudiantes
- ✓ Debe gestionar correctamente el estado de las notificaciones (leídas/no leídas)

## Metadatos específicos de profesores

Los profesores tienen metadatos específicos que son validados en estas pruebas:

1. **Información personal**:
   - firstName
   - lastName
   - gender

2. **Información profesional**:
   - specialization

3. **Notificaciones**:
   - Lista de mensajes recibidos de estudiantes
   - Cada notificación contiene: studentId, message, date, status

## Validaciones importantes

Los tests verifican que:

1. **Control de acceso**: Solo se pueda acceder a información de estudiantes asignados al profesor
2. **Límites de campos**: Solo se permitan actualizar campos específicos para profesores
3. **Formato de datos**: Los datos cumplan con las validaciones establecidas
4. **Seguridad**: Las contraseñas se almacenen de forma segura

## Mocks utilizados

### Datos de prueba
Los tests utilizan:

- Un objeto mockTeacher con datos completos de un profesor
- Varios objetos mockStudents para probar la interacción profesor-estudiante

### Autenticación
Se simula un profesor autenticado:

```javascript
jest.mock('../../middlewares/auth', () => ({
  authUserMiddleware: (req, res, next) => {
    req.user = { id: 'teacher-id', email: 'teacher@u-tad.com', role: 'TEACHER' };
    next();
  },
  checkRole: () => (req, res, next) => next()
}));
```

## Flujos clave probados

### Gestión de estudiantes asignados
1. El profesor obtiene la lista de estudiantes asignados
2. El profesor solicita información detallada de un estudiante específico
3. El sistema verifica que el estudiante esté asignado al profesor

### Gestión de notificaciones
1. El profesor recibe notificaciones de estudiantes
2. El sistema almacena estas notificaciones en el perfil del profesor
3. El profesor puede consultar todas sus notificaciones

## Mejores prácticas

1. **Probar límites de permisos**: Verificar que un profesor no pueda acceder a estudiantes que no le estén asignados.

2. **Validar el formato de respuesta**: Asegurar que las respuestas API contengan exactamente la información requerida (ni más ni menos).

3. **Probar escenarios negativos**: Verificar el comportamiento cuando ocurren errores como estudiantes no encontrados.

4. **Aislar las pruebas**: Asegurar que cada test sea independiente y no afecte a los demás.

Siguiendo estas pautas, mantendrás una cobertura completa para las funcionalidades específicas de profesores en la aplicación.
