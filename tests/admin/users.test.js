// tests/admin/users.test.js
const request = require('supertest');
const app = require('../../app');
const { db } = require('../../config/firebase');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// Mocks
jest.mock('../../config/firebase');
jest.mock('../../models/User');
jest.mock('bcryptjs');

// Mock de autenticación para admin
jest.mock('../../middlewares/auth', () => ({
  authUserMiddleware: (req, res, next) => {
    req.user = { id: 'admin-id', email: 'admin@gmail.com', role: 'ADMIN' };
    next();
  },
  checkRole: () => (req, res, next) => next()
}));

// Datos de prueba
const mockUsers = [
  {
    id: 'user-1',
    email: 'student@live.u-tad.com',
    role: 'STUDENT',
    metadata: {
      firstName: 'Test',
      lastName: 'Student',
      degree: 'INSO_DATA'
    }
  },
  {
    id: 'user-2',
    email: 'teacher@u-tad.com',
    role: 'TEACHER',
    metadata: {
      firstName: 'Test',
      lastName: 'Teacher',
      specialization: 'Frontend Developer'
    }
  }
];

describe('CRUD de Usuarios (Admin)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock para hash de contraseña
    bcrypt.hash.mockResolvedValue('hashedPassword');
  });

  describe('Crear Admin', () => {
    test('debería crear un usuario admin hardcodeado', async () => {
      // Mock para simular que el usuario no existe
      User.findByEmail.mockRejectedValue(new Error('User not found'));
      
      // Mock para la creación del usuario
      User.prototype.save = jest.fn().mockResolvedValue({
        id: 'admin-id',
        email: 'alvaro.vazquez.1716@gmail.com',
        role: 'ADMIN'
      });
      
      const response = await request(app)
        .post('/admin');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'HARDCODED_ADMIN_CREATED');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'alvaro.vazquez.1716@gmail.com');
      expect(response.body.user).toHaveProperty('role', 'ADMIN');
      expect(bcrypt.hash).toHaveBeenCalled();
    });

    test('debería fallar si el admin ya existe', async () => {
      // Mock para simular que el usuario ya existe
      User.findByEmail.mockResolvedValue({
        id: 'admin-id',
        email: 'alvaro.vazquez.1716@gmail.com',
        role: 'ADMIN'
      });
      
      const response = await request(app)
        .post('/admin');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'USER_ALREADY_EXISTS');
    });
  });

  describe('Obtener Usuarios', () => {
    test('debería obtener todos los usuarios', async () => {
      // Mock para obtener todos los usuarios
      User.findAll.mockResolvedValue(mockUsers);
      
      const response = await request(app)
        .get('/admin')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id', 'user-1');
      expect(response.body[0]).toHaveProperty('email', 'student@live.u-tad.com');
      expect(response.body[0]).toHaveProperty('role', 'STUDENT');
      expect(response.body[1]).toHaveProperty('role', 'TEACHER');
    });
  });

  describe('Actualizar Usuario', () => {
    test('debería actualizar un usuario por ID', async () => {
      // Mock para encontrar un usuario
      User.findById.mockResolvedValue({
        id: 'user-1',
        email: 'student@live.u-tad.com',
        role: 'STUDENT',
        metadata: {
          firstName: 'Old',
          lastName: 'Name'
        }
      });
      
      // Mock para actualizar un usuario
      User.findByIdAndUpdate = jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'student@live.u-tad.com',
        role: 'STUDENT',
        metadata: {
          firstName: 'New',
          lastName: 'Name'
        }
      });
      
      const response = await request(app)
        .patch('/admin/user-1')
        .set('Authorization', 'Bearer test-token')
        .send({
          metadata: {
            firstName: 'New',
            lastName: 'Name'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'USER_UPDATED_SUCCESSFULLY');
      expect(response.body).toHaveProperty('updatedUser');
      expect(response.body.updatedUser).toHaveProperty('metadata');
      expect(response.body.updatedUser.metadata).toHaveProperty('firstName', 'New');
      expect(User.findByIdAndUpdate).toHaveBeenCalled();
    });

    test('debería actualizar la contraseña correctamente', async () => {
      // Mock para encontrar un usuario
      User.findById.mockResolvedValue({
        id: 'user-1',
        email: 'student@live.u-tad.com',
        role: 'STUDENT',
        password: 'oldHashedPassword'
      });
      
      // Mock para actualizar un usuario
      User.findByIdAndUpdate = jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'student@live.u-tad.com',
        role: 'STUDENT'
      });
      
      const response = await request(app)
        .patch('/admin/user-1')
        .set('Authorization', 'Bearer test-token')
        .send({
          password: 'NewSecurePass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'USER_UPDATED_SUCCESSFULLY');
      expect(bcrypt.hash).toHaveBeenCalledWith('NewSecurePass123!', 10);
      expect(User.findByIdAndUpdate).toHaveBeenCalled();
    });

    test('debería fallar al actualizar un admin', async () => {
      // Mock para encontrar un usuario admin
      User.findById.mockResolvedValue({
        id: 'admin-id',
        email: 'admin@gmail.com',
        role: 'ADMIN'
      });
      
      const response = await request(app)
        .patch('/admin/admin-id')
        .set('Authorization', 'Bearer test-token')
        .send({
          metadata: {
            firstName: 'New'
          }
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'CANNOT_UPDATE_ADMIN');
    });

    test('debería fallar si el usuario no existe', async () => {
      // Mock para simular que el usuario no existe
      User.findById.mockResolvedValue(null);
      
      const response = await request(app)
        .patch('/admin/nonexistent')
        .set('Authorization', 'Bearer test-token')
        .send({
          metadata: {
            firstName: 'New'
          }
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'USER_NOT_FOUND');
    });

    test('debería fallar si no hay campos válidos para actualizar', async () => {
      // Mock para encontrar un usuario
      User.findById.mockResolvedValue({
        id: 'user-1',
        email: 'student@live.u-tad.com',
        role: 'STUDENT'
      });
      
      const response = await request(app)
        .patch('/admin/user-1')
        .set('Authorization', 'Bearer test-token')
        .send({
          invalidField: 'value' // Campo no permitido
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'NO_VALID_FIELDS_TO_UPDATE');
    });
  });

  describe('Eliminar Usuario', () => {
    test('debería eliminar un usuario por ID', async () => {
      // Mock para encontrar un usuario
      User.findById.mockResolvedValue({
        id: 'user-1',
        email: 'student@live.u-tad.com',
        role: 'STUDENT'
      });
      
      // Mock para eliminar un usuario
      User.findByIdAndDelete = jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'student@live.u-tad.com',
        role: 'STUDENT'
      });
      
      const response = await request(app)
        .delete('/admin/user-1')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'USER_DELETED_SUCCESSFULLY');
      expect(User.findByIdAndDelete).toHaveBeenCalledWith('user-1');
    });

    test('debería fallar al eliminar un admin', async () => {
      // Mock para encontrar un usuario admin
      User.findById.mockResolvedValue({
        id: 'admin-id',
        email: 'admin@gmail.com',
        role: 'ADMIN'
      });
      
      const response = await request(app)
        .delete('/admin/admin-id')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'CANNOT_DELETE_ADMIN');
    });

    test('debería fallar si el usuario no existe', async () => {
      // Mock para simular que el usuario no existe
      User.findById.mockResolvedValue(null);
      
      const response = await request(app)
        .delete('/admin/nonexistent')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'USER_NOT_FOUND');
    });
  });
});