# Guía de Testing: CRUD de Roadmaps

Esta guía explica cómo implementar y ejecutar pruebas unitarias para el CRUD de Roadmaps (Rutas de Aprendizaje) en tu aplicación. Los tests están organizados de forma modular para facilitar su mantenimiento y comprensión.

## Estructura de Tests

Los tests están divididos en dos archivos principales:

1. `roadmaps.test.js` - Prueba los endpoints de la API para el CRUD de roadmaps
2. `roadmap-model.test.js` - Prueba las operaciones del modelo Roadmap directamente

## Funcionalidades probadas

### Controller (API)

- **Crear Roadmap**: Prueba la creación mediante la carga de un archivo JSON
- **Obtener Roadmaps**: Verifica la obtención de todos los roadmaps y uno específico por nombre
- **Actualizar Roadmap**: Prueba la actualización completa de un roadmap
- **Actualizar contenido específico**: Verifica la actualización de secciones específicas del roadmap
- **Eliminar Roadmap**: Prueba la eliminación completa de un roadmap
- **Eliminar contenido específico**: Verifica la eliminación de secciones específicas del roadmap

### Modelo

- **Instanciación**: Prueba la creación de una instancia de Roadmap
- **Guardar roadmap**: Verifica el método `save()` para nuevos roadmaps
- **Encontrar roadmaps**: Prueba `findAll()` y `findByName()` 
- **Actualizar roadmap**: Verifica el método `updateByName()`
- **Eliminar roadmap**: Prueba el método `deleteByName()`

## Cómo ejecutar los tests

Para ejecutar solo los tests relacionados con Roadmaps:

```bash
npm run test:roadmap
```

Para ejecutar solo las pruebas del modelo:

```bash
npx jest academic/roadmap-model.test.js
```

Para ejecutar solo las pruebas del controlador:

```bash
npx jest academic/roadmaps.test.js
```

## Casos de prueba

### Creación de Roadmap
- ✓ Debe crear correctamente un nuevo roadmap desde un archivo
- ✓ Debe fallar si el roadmap ya existe
- ✓ Debe fallar si no se envía un archivo
- ✓ Debe fallar si el JSON es inválido
- ✓ Debe fallar si el objeto roadmap está ausente en el JSON

### Obtención de Roadmaps
- ✓ Debe listar todos los roadmaps
- ✓ Debe obtener un roadmap específico por nombre (admin)
- ✓ Debe obtener un roadmap específico por nombre (estudiante)
- ✓ Debe manejar el caso de un roadmap inexistente

### Actualización de Roadmap
- ✓ Debe actualizar el roadmap completo
- ✓ Debe actualizar campos específicos del roadmap
- ✓ Debe manejar errores cuando faltan campos requeridos
- ✓ Debe manejar errores cuando se intenta actualizar campos inexistentes

### Eliminación de Roadmap
- ✓ Debe eliminar un roadmap completo
- ✓ Debe eliminar secciones específicas del roadmap
- ✓ Debe manejar errores cuando faltan campos requeridos
- ✓ Debe manejar errores cuando se intenta eliminar campos inexistentes

## Mocks utilizados

### Datos de prueba
Los tests utilizan un objeto mockRoadmapData con la siguiente estructura:

```javascript
{
  roadmap: {
    name: 'Frontend Developer',
    body: {
      intro: {
        'intro a desarrollo frontend': {
          description: '...',
          status: 'doing',
          skill: '',
          subject: '',
          resources: [...]
        }
      },
      fundamentos: {
        'HTML y CSS': {
          description: '...',
          status: 'doing',
          skill: 'HTML',
          subject: 'Fundamentos de Desarrollo Web',
          resources: [...]
        }
      }
    }
  }
}
```

### Mocks de Firebase
Los tests utilizan mocks para las operaciones de Firestore:

```javascript
jest.mock('../../config/firebase', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));
```

### Mocks de Autenticación
Los tests simulan la autenticación tanto de administradores como de estudiantes:

```javascript
jest.mock('../../middlewares/auth', () => ({
  authUserMiddleware: (req, res, next) => {
    req.user = { id: 'admin-id', role: 'ADMIN' };
    next();
  },
  checkRole: () => (req, res, next) => next()
}));
```

## Buenas prácticas para el testing de Roadmaps

1. **Simular diferentes roles de usuario**: Probar endpoints tanto como administrador y como estudiante.

2. **Probar operaciones anidadas**: Los roadmaps tienen una estructura anidada compleja, asegúrate de probar operaciones en diferentes niveles.

3. **Validar respuestas de error**: Asegúrate de que la API devuelve códigos de error apropiados con mensajes claros.

4. **Verificar actualizaciones parciales**: Comprueba que puedes actualizar secciones específicas del roadmap sin afectar al resto.

5. **Probar el historial de actualizaciones**: Si implementas un seguimiento de actualizaciones, asegúrate de que se registra correctamente.

6. **Aislar los tests**: Cada test debe comenzar con un estado limpio y no depender de otros tests.

## Mantenimiento de los tests

A medida que evolucione la aplicación, considera estas pautas para mantener los tests:

1. **Actualiza los mocks** cuando cambien las estructuras de datos.
2. **Añade nuevos casos de prueba** cuando se implementen nuevas funcionalidades.
3. **Revisa la cobertura** para asegurarte de que todas las rutas del código se prueban.
4. **Refactoriza los tests** cuando refactorices el código de la aplicación.

Al seguir estas pautas, mantendrás un conjunto de pruebas robusto que te dará confianza al hacer cambios en tu aplicación.
