# Guía de Testing: CRUD de Degrees

Esta guía explica cómo implementar y ejecutar pruebas unitarias para el CRUD de Degrees (Titulaciones) en tu aplicación. Los tests están organizados de forma modular y se centran en probar cada funcionalidad por separado.

## Estructura de Tests

Los tests están divididos en dos archivos principales:

1. `degrees.test.js` - Prueba los endpoints de la API para el CRUD de degrees
2. `degree-model.test.js` - Prueba las operaciones del modelo Degree directamente

## Funcionalidades probadas

### Controller (API)

- **Crear Degree**: Verifica la creación mediante la carga de un archivo JSON
- **Obtener Degrees**: Prueba obtener todos los degrees y uno específico por nombre
- **Actualizar Degree**: Verifica la actualización de datos completos de un degree
- **Eliminar Degree**: Prueba la eliminación de un degree
- **Actualizar asignaturas**: Prueba actualizar solo asignaturas específicas
- **Eliminar asignaturas**: Verifica la eliminación de asignaturas específicas

### Modelo

- **Instanciación**: Verifica la creación de una instancia de Degree
- **Guardar degree**: Prueba el método `save()` para nuevos degrees
- **Encontrar degrees**: Verifica `findAll()` y `findByName()` 
- **Actualizar degree**: Prueba el método `update()`
- **Eliminar degree**: Verifica el método `delete()`

## Cómo ejecutar los tests

Para ejecutar solo los tests relacionados con Degrees:

```bash
npm run test:academic
```

Para ejecutar solo las pruebas del modelo:

```bash
npx jest academic/degree-model.test.js
```

Para ejecutar solo las pruebas del controlador:

```bash
npx jest academic/degrees.test.js
```

## Casos de prueba

### Creación de Degree
- ✓ Debe crear correctamente un nuevo degree desde un archivo
- ✓ Debe fallar si el degree ya existe
- ✓ Debe fallar si no se envía un archivo
- ✓ Debe fallar si el JSON es inválido

### Obtención de Degrees
- ✓ Debe listar todos los degrees
- ✓ Debe obtener un degree específico por nombre
- ✓ Debe manejar el caso de un degree inexistente

### Actualización de Degree
- ✓ Debe actualizar todos los campos
- ✓ Debe actualizar solo asignaturas específicas
- ✓ Debe manejar errores en los datos de entrada

### Eliminación de Degree
- ✓ Debe eliminar un degree completo
- ✓ Debe eliminar solo asignaturas específicas

## Tips para testing efectivo

1. **Usa mocks consistentes**: Los objetos de prueba deben reflejar la estructura real de datos.

2. **Prueba los casos límite**: No solo pruebes el camino feliz, también casos de error como:
   - Intentar crear un degree que ya existe
   - Actualizar un degree inexistente
   - Enviar datos inválidos

3. **Aísla las pruebas**: Cada test debe ser independiente y no afectar a otros.

4. **Prueba todas las respuestas**: Verifica no solo el código de estado HTTP sino también el contenido de la respuesta.

## Ejemplo de configuración adicional

Si deseas ajustar la configuración de tests para este módulo específico, puedes crear un archivo `jest.config.js` en la carpeta `tests/academic` con configuraciones específicas:

```javascript
module.exports = {
  testMatch: ['**/academic/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/degreeController.js',
    'models/Degree.js',
    'routes/degreeRoutes.js'
  ]
};
```

Esto te permitirá tener un informe de cobertura más preciso para este módulo específico.
