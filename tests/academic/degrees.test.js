// tests/academic/degrees.test.js
const request = require('supertest');
const app = require('../../app');
const { db } = require('../../config/firebase');
const fs = require('fs/promises');
const path = require('path');
const Degree = require('../../models/Degree');

// Mocks
jest.mock('../../config/firebase');
jest.mock('fs/promises');
jest.mock('../../models/Degree');

// Mock de autenticación
jest.mock('../../middlewares/auth', () => ({
  authUserMiddleware: (req, res, next) => {
    req.user = { id: 'admin-id', role: 'ADMIN' };
    next();
  },
  checkRole: () => (req, res, next) => next()
}));

// testin data 
const mockDegreeData = {
  degree: {
    name: 'INSO',
    subjects: [
      {
        mention: '',
        name: 'Fundamentos de Desarrollo Web',
        credits: 6,
        label: 'frontend',
        type: 'B',
        skills: ['HTML', 'CSS', 'JavaScript'],
        year: 1
      },
      {
        mention: '',
        name: 'Introducción a la Programación I',
        credits: 6,
        label: 'software',
        type: 'B',
        skills: ['C'],
        year: 1
      }
    ]
  }
};

describe('CRUD de Degrees (Titulaciones)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Crear Degree', () => {
    beforeEach(() => {
      // Mock para leer el archivo
      fs.readFile.mockResolvedValue(JSON.stringify(mockDegreeData));
      
      // Mock para simular que el grado no existe
      Degree.findByName.mockRejectedValue(new Error('Degree not found'));
      
      // Mock para simular la creación exitosa del grado
      Degree.prototype.save = jest.fn().mockResolvedValue({
        id: 'degree-id',
        ...mockDegreeData.degree
      });
      
      // Mock para eliminar el archivo temporal
      fs.unlink.mockResolvedValue();
    });

    test('debería crear un nuevo degree correctamente', async () => {
      // Simular el archivo subido
      const req = {
        file: {
          path: path.join(__dirname, 'degree.json')
        }
      };
      
      const response = await request(app)
        .post('/degrees')
        .set('Authorization', 'Bearer test-token')
        .attach('file', Buffer.from(JSON.stringify(mockDegreeData)), 'degree.json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Degree saved successfully');
      expect(Degree.prototype.save).toHaveBeenCalled();
      expect(fs.unlink).toHaveBeenCalled();
    });

    test('debería fallar si el degree ya existe', async () => {
      // Mock para simular que el grado ya existe
      Degree.findByName.mockResolvedValue({
        name: 'INSO',
        subjects: []
      });
      
      const response = await request(app)
        .post('/degrees')
        .set('Authorization', 'Bearer test-token')
        .attach('file', Buffer.from(JSON.stringify(mockDegreeData)), 'degree.json');

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Degree already exists');
    });

    test('debería fallar si no se envía un archivo', async () => {
      const response = await request(app)
        .post('/degrees')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'No file uploaded');
    });

    test('debería fallar si el archivo no contiene JSON válido', async () => {
      // Mock para leer un archivo con JSON inválido
      fs.readFile.mockResolvedValue('invalid json');
      
      const response = await request(app)
        .post('/degrees')
        .set('Authorization', 'Bearer test-token')
        .attach('file', Buffer.from('invalid json'), 'degree.json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid JSON format');
    });
  });

  describe('Obtener Degrees', () => {
    test('debería obtener todos los degrees', async () => {
      // Mock para obtener todos los grados
      Degree.findAll.mockResolvedValue([
        {
          id: 'degree-1',
          name: 'INSO',
          subjects: []
        },
        {
          id: 'degree-2',
          name: 'INSO_GAME',
          subjects: []
        }
      ]);
      
      const response = await request(app)
        .get('/degrees')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', 'INSO');
      expect(response.body[1]).toHaveProperty('name', 'INSO_GAME');
    });

    test('debería obtener un degree por su nombre', async () => {
      // Mock para obtener un grado por nombre
      Degree.findByName.mockResolvedValue({
        id: 'degree-1',
        name: 'INSO',
        subjects: mockDegreeData.degree.subjects
      });
      
      const response = await request(app)
        .get('/degrees/INSO')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'INSO');
      expect(response.body).toHaveProperty('subjects');
      expect(response.body.subjects).toHaveLength(2);
    });

    test('debería fallar si el degree no existe', async () => {
      // Mock para simular que el grado no existe
      Degree.findByName.mockRejectedValue(new Error('Degree not found'));
      
      const response = await request(app)
        .get('/degrees/NONEXISTENT')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Degree not found');
    });
  });

  describe('Actualizar Degree', () => {
    test('debería actualizar un degree correctamente', async () => {
      // Mock para encontrar un grado
      Degree.findById.mockResolvedValue({
        id: 'degree-id',
        name: 'INSO',
        subjects: mockDegreeData.degree.subjects
      });
      
      // Mock para actualizar un grado
      Degree.update.mockResolvedValue({
        id: 'degree-id',
        name: 'INSO',
        subjects: mockDegreeData.degree.subjects,
        updatedAt: '2023-01-01T00:00:00.000Z'
      });
      
      const response = await request(app)
        .patch('/degrees/INSO')
        .set('Authorization', 'Bearer test-token')
        .send({
          name: 'INSO',
          subjects: [
            {
              mention: '',
              name: 'Fundamentos de Desarrollo Web',
              credits: 7, // Cambio en los créditos
              label: 'frontend',
              type: 'B',
              skills: ['HTML', 'CSS', 'JavaScript'],
              year: 1
            }
          ]
        });

      expect(response.status).toBe(200);
      expect(Degree.update).toHaveBeenCalled();
    });

    test('debería fallar si el degree no existe', async () => {
      // Mock para simular que el grado no existe
      Degree.findById.mockResolvedValue(null);
      
      const response = await request(app)
        .patch('/degrees/NONEXISTENT')
        .set('Authorization', 'Bearer test-token')
        .send({
          name: 'NONEXISTENT',
          subjects: []
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Degree not found');
    });
  });

  describe('Eliminar Degree', () => {
    test('debería eliminar un degree correctamente', async () => {
      // Mock para eliminar un grado
      Degree.delete.mockResolvedValue({
        message: 'Degree deleted',
        id: 'INSO'
      });
      
      const response = await request(app)
        .delete('/degrees/INSO')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Degree deleted');
      expect(Degree.delete).toHaveBeenCalledWith('INSO');
    });
  });

  describe('Actualizar asignaturas', () => {
    beforeEach(() => {
      // Mock para encontrar un grado por nombre
      Degree.findByName.mockResolvedValue({
        name: 'INSO',
        subjects: mockDegreeData.degree.subjects
      });
      
      // Mock para actualizar un grado
      Degree.update.mockResolvedValue({
        name: 'INSO',
        subjects: [
          {
            mention: '',
            name: 'Fundamentos de Desarrollo Web',
            credits: 7, // Valor actualizado
            label: 'frontend',
            type: 'B',
            skills: ['HTML', 'CSS', 'JavaScript'],
            year: 1
          },
          {
            mention: '',
            name: 'Introducción a la Programación I',
            credits: 6,
            label: 'software',
            type: 'B',
            skills: ['C'],
            year: 1
          }
        ]
      });
    });

    test('debería actualizar asignaturas específicas', async () => {
      const response = await request(app)
        .patch('/degrees/subjects/INSO')
        .set('Authorization', 'Bearer test-token')
        .send({
          subjects: [
            {
              name: 'Fundamentos de Desarrollo Web',
              credits: 7, // Cambio en los créditos
              label: 'frontend',
              type: 'B',
              skills: ['HTML', 'CSS', 'JavaScript'],
              year: 1
            }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Subjects updated successfully');
      expect(response.body).toHaveProperty('updatedSubjects');
      expect(response.body.updatedSubjects).toContain('Fundamentos de Desarrollo Web');
      expect(Degree.update).toHaveBeenCalled();
    });

    test('debería fallar si el array de asignaturas está vacío', async () => {
      const response = await request(app)
        .patch('/degrees/subjects/INSO')
        .set('Authorization', 'Bearer test-token')
        .send({
          subjects: []
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid subjects array');
    });

    test('debería fallar si el grado no existe', async () => {
      // Mock para simular que el grado no existe
      Degree.findByName.mockRejectedValue(new Error('Degree not found'));
      
      const response = await request(app)
        .patch('/degrees/subjects/NONEXISTENT')
        .set('Authorization', 'Bearer test-token')
        .send({
          subjects: [
            {
              name: 'Asignatura Nueva',
              credits: 6,
              label: 'frontend',
              type: 'B',
              skills: ['HTML'],
              year: 1
            }
          ]
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Degree not found');
    });
  });

  describe('Eliminar asignaturas', () => {
    beforeEach(() => {
      // Mock para encontrar un grado por nombre
      Degree.findByName.mockResolvedValue({
        name: 'INSO',
        subjects: mockDegreeData.degree.subjects
      });
      
      // Mock para actualizar un grado
      Degree.update.mockResolvedValue({
        name: 'INSO',
        subjects: [
          {
            mention: '',
            name: 'Introducción a la Programación I',
            credits: 6,
            label: 'software',
            type: 'B',
            skills: ['C'],
            year: 1
          }
        ]
      });
    });

    test('debería eliminar asignaturas específicas', async () => {
      const response = await request(app)
        .delete('/degrees/subjects/INSO')
        .set('Authorization', 'Bearer test-token')
        .send({
          subjects: ['Fundamentos de Desarrollo Web']
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Subjects deleted successfully');
      expect(response.body).toHaveProperty('deletedSubjects');
      expect(response.body.deletedSubjects).toContain('Fundamentos de Desarrollo Web');
      expect(Degree.update).toHaveBeenCalled();
    });

    test('debería fallar si el array de asignaturas está vacío', async () => {
      const response = await request(app)
        .delete('/degrees/subjects/INSO')
        .set('Authorization', 'Bearer test-token')
        .send({
          subjects: []
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid subjects array');
    });

    test('debería fallar si las asignaturas no existen', async () => {
      const response = await request(app)
        .delete('/degrees/subjects/INSO')
        .set('Authorization', 'Bearer test-token')
        .send({
          subjects: ['Asignatura Inexistente']
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'No matching subjects found for deletion');
    });
  });
});