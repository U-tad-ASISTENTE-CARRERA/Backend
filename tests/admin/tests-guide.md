# Guía de Testing: CRUD de Usuarios (Admin)

Esta guía explica cómo implementar y ejecutar pruebas unitarias para las operaciones CRUD de usuarios desde la perspectiva de un administrador. Los tests están diseñados para verificar que las operaciones administrativas funcionen correctamente.

## Estructura de Tests

Los tests están divididos en dos archivos principales:

1. `users.test.js` - Prueba los endpoints de la API para operaciones CRUD de usuarios por un administrador
2. `user-model.test.js` - Prueba las operaciones del modelo User relevantes para la gestión de usuarios

## Funcionalidades probadas

### Controller (API)

- **Crear Admin**: Prueba la creación de un usuario administrador hardcodeado
- **Obtener Usuarios**: Verifica la obtención de todos los usuarios
- **Actualizar Usuario**: Prueba la actualización de datos de usuario
- **Eliminar Usuario**: Verifica la eliminación de usuarios por un administrador

### Modelo

- **Instanciación**: Prueba la creación de una instancia de User
- **Guardar usuario**: Verifica el método `save()` para nuevos usuarios
- **Buscar usuarios**: Prueba `findAll()`, `findById()`, `findByEmail()` y `findByRole()`
- **Actualizar usuario**: Verifica el método `update()`
- **Eliminar usuario**: Prueba los métodos `delete()` y `findByIdAndDelete()`

## Cómo ejecutar los tests

Para ejecutar solo los tests relacionados con administración de usuarios:

```bash
npm run test:admin
```

Para ejecutar solo las pruebas del modelo:

```bash
npx jest admin/user-model.test.js
```

Para ejecutar solo las pruebas del controlador:

```bash
npx jest admin/users.test.js
```

## Casos de prueba

### Crear Admin
- ✓ Debe crear correctamente un nuevo usuario administrador hardcodeado
- ✓ Debe fallar si el administrador ya existe

### Obtener Usuarios
- ✓ Debe obtener todos los usuarios registrados en el sistema
- ✓ Debe poder filtrar usuarios por rol

### Actualizar Usuario
- ✓ Debe actualizar correctamente los datos de un usuario
- ✓ Debe actualizar la contraseña de forma segura
- ✓ Debe fallar al intentar actualizar un administrador
- ✓ Debe fallar si el usuario no existe
- ✓ Debe fallar si no hay campos válidos para actualizar

### Eliminar Usuario
- ✓ Debe eliminar correctamente un usuario por su ID
- ✓ Debe fallar al intentar eliminar un administrador
- ✓ Debe fallar si el usuario no existe

## Validaciones importantes

El sistema de pruebas verifica que:

1. **Seguridad de administradores**: No se permita modificar o eliminar administradores
2. **Validación de campos**: Solo se puedan actualizar campos permitidos
3. **Protección de contraseñas**: Las contraseñas siempre se almacenen hasheadas
4. **Integridad de datos**: Los IDs y emails sean válidos
5. **Mensajes de error**: Los errores devuelvan códigos y mensajes apropiados

## Mocks utilizados

### Datos de prueba
Los tests utilizan objetos mock para simular:

- Usuarios estudiantes
- Usuarios profesores
- Administradores

### Firestore
Se simulan las operaciones básicas de Firestore:

```javascript
jest.mock('../../config/firebase', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    where: jest.fn().mockReturnThis()
  }
}));
```

### Autenticación
Se simula un administrador autenticado:

```javascript
jest.mock('../../middlewares/auth', () => ({
  authUserMiddleware: (req, res, next) => {
    req.user = { id: 'admin-id', email: 'admin@gmail.com', role: 'ADMIN' };
    next();
  },
  checkRole: () => (req, res, next) => next()
}));
```

## Mejores prácticas

1. **Aislar los tests**: Cada test debe ejecutarse independientemente.

2. **Probar casos de error**: Verificar que los endpoints fallen correctamente cuando:
   - No se encuentra un usuario
   - Se intenta modificar o eliminar un administrador
   - Se envían datos inválidos

3. **Verificar la seguridad**: Asegurarse de que solo los administradores pueden acceder a estas rutas.

4. **Comprobar mensajes de respuesta**: Validar tanto el código de estado como el contenido de la respuesta.

5. **Consistencia en mocks**: Mantener los datos de prueba realistas y consistentes.

## Mantenimiento

Para mantener las pruebas actualizadas:

1. **Añadir nuevos tests** cuando se implementen nuevas funcionalidades administrativas.
2. **Actualizar los tests existentes** cuando cambien los endpoints o la estructura de datos.
3. **Revisar con regularidad** para asegurar que el código de producción sigue pasando todas las pruebas.

Siguiendo estas pautas, mantendrás una cobertura completa para las funcionalidades administrativas de tu API.
