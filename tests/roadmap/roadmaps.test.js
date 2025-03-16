// tests/roadmap/roadmaps.test.js
const request = require('supertest');
const app = require('../../app');
const { db } = require('../../config/firebase');
const fs = require('fs/promises');
const path = require('path');
const Roadmap = require('../../models/Roadmap');

// Mocks
jest.mock('../../config/firebase');
jest.mock('fs/promises');
jest.mock('../../models/Roadmap');

// Mock de autenticación
jest.mock('../../middlewares/auth', () => ({
  authUserMiddleware: (req, res, next) => {
    req.user = { id: 'admin-id', role: 'ADMIN' };
    next();
  },
  checkRole: () => (req, res, next) => next()
}));

// Datos de prueba
const mockRoadmapData = {
  roadmap: {
    name: 'Frontend Developer',
    body: {
      intro: {
        'intro a desarrollo frontend': {
          description: 'Este roadmap está diseñado para estudiantes que desean desarrollar habilidades en desarrollo frontend.',
          status: 'doing',
          skill: '',
          subject: '',
          resources: [
            {
              description: 'Frontend Developer Career Path en Scrimba',
              link: 'https://scrimba.com/learn/frontend'
            }
          ]
        }
      },
      fundamentos: {
        'HTML y CSS': {
          description: 'Aprende la estructura y el diseño de páginas web con HTML y CSS.',
          status: 'doing',
          skill: 'HTML',
          subject: 'Fundamentos de Desarrollo Web',
          resources: [
            {
              description: 'HTML & CSS Full Course - Beginner to Pro',
              link: 'https://www.youtube.com/watch?v=mU6anWqZJcc'
            }
          ]
        }
      }
    }
  }
};

describe('CRUD de Roadmaps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Crear Roadmap', () => {
    beforeEach(() => {
      // Mock para leer el archivo
      fs.readFile.mockResolvedValue(JSON.stringify(mockRoadmapData));
      
      // Mock para simular que el roadmap no existe
      Roadmap.findByName.mockRejectedValue(new Error('Roadmap not found'));
      
      // Mock para simular la creación exitosa del roadmap
      Roadmap.prototype.save = jest.fn().mockResolvedValue({
        name: 'Frontend Developer',
        ...mockRoadmapData.roadmap
      });
      
      // Mock para eliminar el archivo temporal
      fs.unlink.mockResolvedValue();
    });

    test('debería crear un nuevo roadmap correctamente', async () => {
      const response = await request(app)
        .post('/roadmaps')
        .set('Authorization', 'Bearer test-token')
        .attach('file', Buffer.from(JSON.stringify(mockRoadmapData)), 'roadmap.json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Roadmap saved successfully');
      expect(Roadmap.prototype.save).toHaveBeenCalled();
      expect(fs.unlink).toHaveBeenCalled();
    });

    test('debería fallar si el roadmap ya existe', async () => {
      // Mock para simular que el roadmap ya existe
      Roadmap.findByName.mockResolvedValue({
        name: 'Frontend Developer',
        body: {}
      });
      
      const response = await request(app)
        .post('/roadmaps')
        .set('Authorization', 'Bearer test-token')
        .attach('file', Buffer.from(JSON.stringify(mockRoadmapData)), 'roadmap.json');

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Roadmap already exists');
    });

    test('debería fallar si no se envía un archivo', async () => {
      const response = await request(app)
        .post('/roadmaps')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'No file uploaded');
    });

    test('debería fallar si el archivo no contiene JSON válido', async () => {
      // Mock para leer un archivo con JSON inválido
      fs.readFile.mockResolvedValue('invalid json');
      
      const response = await request(app)
        .post('/roadmaps')
        .set('Authorization', 'Bearer test-token')
        .attach('file', Buffer.from('invalid json'), 'roadmap.json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid JSON format');
    });

    test('debería fallar si falta el objeto roadmap en el JSON', async () => {
      // Mock para leer un archivo con JSON sin el campo roadmap
      fs.readFile.mockResolvedValue(JSON.stringify({ name: 'Invalid' }));
      
      const response = await request(app)
        .post('/roadmaps')
        .set('Authorization', 'Bearer test-token')
        .attach('file', Buffer.from(JSON.stringify({ name: 'Invalid' })), 'roadmap.json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Roadmap object is missing in JSON');
    });
  });

  describe('Obtener Roadmaps', () => {
    test('debería obtener todos los roadmaps', async () => {
      // Mock para obtener todos los roadmaps
      Roadmap.findAll.mockResolvedValue([
        {
          name: 'Frontend Developer',
          body: {}
        },
        {
          name: 'Backend Developer',
          body: {}
        }
      ]);
      
      const response = await request(app)
        .get('/roadmaps')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', 'Frontend Developer');
      expect(response.body[1]).toHaveProperty('name', 'Backend Developer');
    });

    test('debería obtener un roadmap por su nombre (admin)', async () => {
      // Mock para obtener un roadmap por nombre
      Roadmap.findByName.mockResolvedValue({
        name: 'Frontend Developer',
        body: mockRoadmapData.roadmap.body
      });
      
      const response = await request(app)
        .get('/roadmaps/Frontend Developer')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Frontend Developer');
      expect(response.body).toHaveProperty('body');
      expect(response.body.body).toHaveProperty('intro');
      expect(response.body.body).toHaveProperty('fundamentos');
    });

    test('debería obtener un roadmap por su nombre (estudiante)', async () => {
      // Cambiar el mock de autenticación para simular un estudiante
      jest.spyOn(require('../../middlewares/auth'), 'checkRole').mockImplementation(() => (req, res, next) => {
        req.user = { id: 'student-id', role: 'STUDENT' };
        next();
      });

      // Mock para obtener un roadmap por nombre
      Roadmap.findByName.mockResolvedValue({
        name: 'Frontend Developer',
        body: mockRoadmapData.roadmap.body
      });
      
      const response = await request(app)
        .get('/roadmaps/student/Frontend Developer')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Frontend Developer');
      expect(response.body).toHaveProperty('body');
    });

    test('debería fallar si el roadmap no existe', async () => {
      // Mock para simular que el roadmap no existe
      Roadmap.findByName.mockRejectedValue(new Error('Roadmap not found'));
      
      const response = await request(app)
        .get('/roadmaps/Nonexistent')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Roadmap not found');
    });
  });

  describe('Actualizar Roadmap', () => {
    test('debería actualizar un roadmap completo correctamente', async () => {
      // Mock para encontrar un roadmap
      Roadmap.findByName.mockResolvedValue({
        name: 'Frontend Developer',
        body: mockRoadmapData.roadmap.body
      });
      
      // Mock para actualizar un roadmap
      Roadmap.updateByName.mockResolvedValue({
        name: 'Frontend Developer Updated',
        body: {
          ...mockRoadmapData.roadmap.body,
          avanzado: {
            'React': {
              description: 'Framework de JavaScript',
              status: 'doing'
            }
          }
        },
        updatedAt: '2023-01-01T00:00:00.000Z'
      });
      
      const response = await request(app)
        .patch('/roadmaps/Frontend Developer')
        .set('Authorization', 'Bearer test-token')
        .send({
          name: 'Frontend Developer Updated',
          body: {
            ...mockRoadmapData.roadmap.body,
            avanzado: {
              'React': {
                description: 'Framework de JavaScript',
                status: 'doing'
              }
            }
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Roadmap updated successfully');
      expect(response.body).toHaveProperty('name', 'Frontend Developer Updated');
      expect(response.body.body).toHaveProperty('avanzado');
      expect(response.body.body.avanzado).toHaveProperty('React');
      expect(Roadmap.updateByName).toHaveBeenCalled();
    });

    test('debería fallar si el roadmap no existe', async () => {
      // Mock para simular que el roadmap no existe
      Roadmap.findByName.mockRejectedValue(new Error('Roadmap not found'));
      
      const response = await request(app)
        .patch('/roadmaps/Nonexistent')
        .set('Authorization', 'Bearer test-token')
        .send({
          name: 'Nonexistent',
          body: {}
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Roadmap not found');
    });
  });

  describe('Actualizar contenido específico del Roadmap', () => {
    test('debería actualizar un campo específico del body', async () => {
      // Mock para encontrar un roadmap
      Roadmap.findByName.mockResolvedValue({
        name: 'Frontend Developer',
        body: mockRoadmapData.roadmap.body
      });
      
      // Mock para actualizar un roadmap
      Roadmap.updateByName.mockResolvedValue({
        name: 'Frontend Developer',
        body: {
          ...mockRoadmapData.roadmap.body,
          intro: {
            'intro a desarrollo frontend': {
              description: 'Descripción actualizada',
              status: 'done',
              skill: '',
              subject: '',
              resources: [
                {
                  description: 'Frontend Developer Career Path en Scrimba',
                  link: 'https://scrimba.com/learn/frontend'
                }
              ]
            }
          }
        },
        updatedAt: '2023-01-01T00:00:00.000Z'
      });
      
      const response = await request(app)
        .patch('/roadmaps/Frontend Developer/body')
        .set('Authorization', 'Bearer test-token')
        .send({
          field: 'intro',
          updates: {
            'intro a desarrollo frontend': {
              description: 'Descripción actualizada',
              status: 'done'
            }
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Roadmap body updated successfully');
      expect(response.body.body.intro['intro a desarrollo frontend']).toHaveProperty('description', 'Descripción actualizada');
      expect(response.body.body.intro['intro a desarrollo frontend']).toHaveProperty('status', 'done');
      expect(Roadmap.updateByName).toHaveBeenCalled();
    });

    test('debería fallar si falta el campo o las actualizaciones', async () => {
      const response = await request(app)
        .patch('/roadmaps/Frontend Developer/body')
        .set('Authorization', 'Bearer test-token')
        .send({
          // Sin campo ni actualizaciones
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Field name and updates are required');
    });

    test('debería fallar si el campo no existe en el body', async () => {
      // Mock para encontrar un roadmap
      Roadmap.findByName.mockResolvedValue({
        name: 'Frontend Developer',
        body: mockRoadmapData.roadmap.body
      });
      
      const response = await request(app)
        .patch('/roadmaps/Frontend Developer/body')
        .set('Authorization', 'Bearer test-token')
        .send({
          field: 'nonexistent',
          updates: {
            'algo': {
              description: 'Test'
            }
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Field does not exist in roadmap body');
    });
  });

  describe('Eliminar Roadmap', () => {
    test('debería eliminar un roadmap correctamente', async () => {
      // Mock para eliminar un roadmap
      Roadmap.deleteByName.mockResolvedValue({
        message: 'Roadmap deleted',
        name: 'Frontend Developer'
      });
      
      const response = await request(app)
        .delete('/roadmaps/Frontend Developer')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Roadmap deleted');
      expect(Roadmap.deleteByName).toHaveBeenCalledWith('Frontend Developer');
    });

    test('debería fallar si el roadmap no existe', async () => {
      // Mock para simular que el roadmap no existe
      Roadmap.deleteByName.mockRejectedValue(new Error('Roadmap not found'));
      
      const response = await request(app)
        .delete('/roadmaps/Nonexistent')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Roadmap not found');
    });
  });

  describe('Eliminar contenido específico del Roadmap', () => {
    test('debería eliminar un campo específico del body', async () => {
      // Mock para encontrar un roadmap
      Roadmap.findByName.mockResolvedValue({
        name: 'Frontend Developer',
        body: {
          intro: mockRoadmapData.roadmap.body.intro,
          fundamentos: mockRoadmapData.roadmap.body.fundamentos,
          avanzado: {
            'React': {
              description: 'Framework de JavaScript',
              status: 'doing'
            }
          }
        }
      });
      
      // Mock para actualizar un roadmap después de eliminar
      Roadmap.updateByName.mockResolvedValue({
        name: 'Frontend Developer',
        body: {
          intro: mockRoadmapData.roadmap.body.intro,
          fundamentos: mockRoadmapData.roadmap.body.fundamentos
          // Campo avanzado eliminado
        },
        updatedAt: '2023-01-01T00:00:00.000Z'
      });
      
      const response = await request(app)
        .delete('/roadmaps/Frontend Developer/body')
        .set('Authorization', 'Bearer test-token')
        .send({
          field: 'avanzado'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Roadmap body content deleted successfully');
      expect(response.body.body).not.toHaveProperty('avanzado');
      expect(Roadmap.updateByName).toHaveBeenCalled();
    });

    test('debería fallar si falta el campo a eliminar', async () => {
      const response = await request(app)
        .delete('/roadmaps/Frontend Developer/body')
        .set('Authorization', 'Bearer test-token')
        .send({
          // Sin campo
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Field name is required for deletion');
    });

    test('debería fallar si el campo no existe en el body', async () => {
      // Mock para encontrar un roadmap
      Roadmap.findByName.mockResolvedValue({
        name: 'Frontend Developer',
        body: mockRoadmapData.roadmap.body
      });
      
      const response = await request(app)
        .delete('/roadmaps/Frontend Developer/body')
        .set('Authorization', 'Bearer test-token')
        .send({
          field: 'nonexistent'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Field does not exist in roadmap body');
    });
  });
});