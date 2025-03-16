# Guía de Testing: CRUD de Usuarios (Estudiante)

Esta guía explica cómo implementar y ejecutar pruebas unitarias para las operaciones relacionadas con usuarios de tipo Estudiante. Los tests están diseñados para verificar todas las funcionalidades específicas disponibles para estudiantes en la aplicación.

## Estructura de Tests

Los tests están divididos en dos archivos principales:

1. `users.test.js` - Prueba los endpoints de la API para operaciones realizadas por estudiantes
2. `user-model-student.test.js` - Prueba las operaciones del modelo User específicas para estudiantes

## Funcionalidades probadas

### Controller (API)

- **Registro y Login**: Prueba la creación de usuarios estudiante y su autenticación
- **Gestión de Perfil**: Verifica la obtención y actualización de datos del estudiante
- **Historial Académico**: Prueba la gestión del historial de calificaciones (AH)
- **Roadmap**: Verifica la obtención y actualización del plan de aprendizaje personalizado
- **Interacción con Profesores**: Prueba la asignación de profesores y envío de notificaciones

### Modelo

- **Instanciación**: Prueba la creación de una instancia de User con rol estudiante
- **Gestión de datos**: Verifica operaciones CRUD específicas para estudiantes
- **Historial académico**: Prueba la actualización de calificaciones y resultados
- **Roadmap**: Verifica la gestión del plan de aprendizaje
- **Interacción con profesores**: Prueba la gestión de la lista de profesores asignados

## Cómo ejecutar los tests

Para ejecutar solo los tests relacionados con estudiantes:

```bash
npm run test:student
```

Para ejecutar solo las pruebas del modelo:

```bash
npx jest student/user-model-student.test.js
```

Para ejecutar solo las pruebas del controlador:

```bash
npx jest student/users.test.js
```

## Casos de prueba

### Registro y Login de Estudiante
- ✓ Debe registrar correctamente un nuevo estudiante con email de dominio live.u-tad.com
- ✓ Debe iniciar sesión correctamente y actualizar la fecha de último acceso

### Gestión de Perfil
- ✓ Debe obtener el perfil completo del estudiante
- ✓ Debe actualizar los metadatos del estudiante (firstName, lastName, etc.)
- ✓ Debe añadir habilidades, certificaciones y experiencia laboral
- ✓ Debe eliminar metadatos específicos cuando sea necesario

### Historial Académico (AH)
- ✓ Debe obtener el historial académico completo
- ✓ Debe actualizar calificaciones de asignaturas
- ✓ Debe calcular métricas como promedio de calificaciones
- ✓ Debe actualizar habilidades basándose en asignaturas aprobadas

### Roadmap
- ✓ Debe obtener el roadmap asignado al estudiante
- ✓ Debe actualizar el estado de temas específicos (doing, done)
- ✓ Debe añadir habilidades automáticamente al completar temas
- ✓ Debe eliminar el roadmap si es necesario

### Interacción con Profesores
- ✓ Debe obtener todos los profesores disponibles
- ✓ Debe filtrar profesores por especialización
- ✓ Debe añadir profesores a la lista del estudiante
- ✓ Debe enviar notificaciones a profesores asignados

## Metadatos específicos de estudiantes

Los estudiantes tienen metadatos específicos que son validados en estas pruebas:

1. **Información personal**:
   - firstName, lastName, gender, birthDate, dni

2. **Información académica**:
   - degree, specialization, endDate, AH (historial académico)

3. **Habilidades y experiencia**:
   - skills, languages, programming_languages, certifications, workExperience

4. **Roadmap**:
   - Plan personalizado de aprendizaje con secciones y temas

5. **Interacción con profesores**:
   - teacherList (lista de IDs de profesores asignados)

## Validaciones importantes

Los tests verifican que:

1. **Consistencia de datos**: Las actualizaciones mantengan la integridad de los datos
2. **Historial de cambios**: Los cambios queden registrados en updateHistory
3. **Lógica de negocio**: Se actualicen skills cuando se aprueban asignaturas
4. **Gestión de arreglos**: Se manejen correctamente arrays en los metadatos

## Mocks utilizados

### Datos de prueba
Los tests utilizan:

- Un objeto mockStudent con datos completos de un estudiante
- Objetos mockTeachers para probar la interacción estudiante-profesor

### Autenticación
Se simula un estudiante autenticado:

```javascript
jest.mock('../../middlewares/auth', () => ({
  authUserMiddleware: (req, res, next) => {
    req.user = { id: 'student-id', email: 'student@live.u-tad.com', role: 'STUDENT' };
    next();
  },
  checkRole: () => (req, res, next) => next()
}));
```

## Flujos clave probados

### Gestión de historial académico
1. El estudiante actualiza sus calificaciones
2. El sistema calcula promedios y métricas
3. El sistema actualiza habilidades basado en asignaturas aprobadas

### Actualización de roadmap
1. El estudiante marca un tema como completado
2. El sistema verifica si el tema otorga una habilidad
3. El sistema actualiza las habilidades del estudiante

### Asignación de profesores
1. El estudiante obtiene la lista de profesores
2. El estudiante añade un profesor a su lista
3. El estudiante envía una notificación al profesor

## Mejores prácticas

1. **Probar metadatos complejos**: Verificar la correcta gestión de estructuras anidadas.

2. **Validar actualizaciones automáticas**: Asegurar que las actualizaciones automáticas de habilidades funcionen correctamente.

3. **Probar escenarios de carga completos**: Verificar que el sistema gestione correctamente muchas asignaturas o metadatos extensos.

4. **Verificar sincronización de datos**: Asegurar que los cambios en una parte de los metadatos (ej. AH) se reflejen en otra (ej. skills).

Siguiendo estas pautas, mantendrás una cobertura completa para las funcionalidades específicas de estudiantes en la aplicación.
