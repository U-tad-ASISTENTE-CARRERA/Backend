// tests/teacher/users.test.js
const request = require('supertest');
const app = require('../../app');
const { db } = require('../../config/firebase');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// Mocks
jest.mock('../../config/firebase');
jest.mock('../../models/User');
jest.mock('bcryptjs');

// Mock de autenticación para profesor
jest.mock('../../middlewares/auth', () => ({
  authUserMiddleware: (req, res, next) => {
    req.user = { id: 'teacher-id', email: 'teacher@u-tad.com', role: 'TEACHER' };
    next();
  },
  checkRole: () => (req, res, next) => next()
}));

// Datos de prueba
const mockStudents = [
  {
    id: 'student-1',
    email: 'student1@live.u-tad.com',
    role: 'STUDENT',
    metadata: {
      firstName: 'Test',
      lastName: 'Student1',
      degree: 'INSO_DATA',
      teacherList: ['teacher-id']
    }
  },
  {
    id: 'student-2',
    email: 'student2@live.u-tad.com',
    role: 'STUDENT',
    metadata: {
      firstName: 'Test',
      lastName: 'Student2',
      degree: 'INSO_GAME',
      teacherList: ['teacher-id']
    }
  }
];

const mockTeacher = {
  id: 'teacher-id',
  email: 'teacher@u-tad.com',
  role: 'TEACHER',
  metadata: {
    firstName: 'Test',
    lastName: 'Teacher',
    specialization: 'Frontend Developer',
    notifications: []
  }
};

describe('CRUD de Usuarios (Profesor)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Registro y Login de Profesor', () => {
    test('debería registrar un nuevo profesor', async () => {
      // Mock para simular que el usuario no existe
      User.findByEmail.mockRejectedValue(new Error('User not found'));
      
      // Mock para la creación del usuario
      User.prototype.save = jest.fn().mockResolvedValue({
        id: 'new-teacher-id',
        email: 'newteacher@u-tad.com',
        role: 'TEACHER'
      });
      
      // Mock para hash de contraseña
      bcrypt.hash.mockResolvedValue('hashedPassword');
      
      const response = await request(app)
        .post('/register')
        .send({
          email: 'newteacher@u-tad.com',
          password: 'SecurePass123!',
          seedWord: 'test-seed'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'newteacher@u-tad.com');
      expect(response.body.user).toHaveProperty('role', 'TEACHER');
      expect(bcrypt.hash).toHaveBeenCalled();
    });

    test('debería iniciar sesión correctamente', async () => {
      // Mock para encontrar el profesor por email
      User.findByEmail.mockResolvedValue({
        id: 'teacher-id',
        email: 'teacher@u-tad.com',
        password: 'hashedPassword',
        role: 'TEACHER'
      });
      
      // Mock para validación de contraseña
      bcrypt.compare.mockResolvedValue(true);
      
      // Mock para actualizar fecha de último acceso
      User.update.mockResolvedValue({});
      
      const response = await request(app)
        .post('/login')
        .send({
          email: 'teacher@u-tad.com',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'teacher@u-tad.com');
      expect(response.body.user).toHaveProperty('role', 'TEACHER');
      expect(User.update).toHaveBeenCalled();
    });
  });

  describe('Gestión de Perfil de Profesor', () => {
    test('debería obtener el perfil del profesor', async () => {
      // Mock para encontrar profesor por ID
      User.findById.mockResolvedValue(mockTeacher);
      
      const response = await request(app)
        .get('/')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'teacher@u-tad.com');
      expect(response.body.user).toHaveProperty('role', 'TEACHER');
      expect(response.body.user).toHaveProperty('metadata');
      expect(response.body.user.metadata).toHaveProperty('firstName', 'Test');
      expect(response.body.user.metadata).toHaveProperty('specialization', 'Frontend Developer');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('debería actualizar los metadatos del profesor', async () => {
      // Mock para encontrar profesor por ID
      User.findById.mockResolvedValue({
        id: 'teacher-id',
        email: 'teacher@u-tad.com',
        role: 'TEACHER',
        metadata: {
          firstName: 'Old',
          lastName: 'Name',
          specialization: 'Old Specialization'
        },
        updateHistory: []
      });
      
      // Mock para actualizar usuario
      User.update.mockResolvedValue({});
      
      const response = await request(app)
        .patch('/metadata')
        .set('Authorization', 'Bearer test-token')
        .send({
          firstName: 'New',
          lastName: 'Name',
          specialization: 'Frontend Developer'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'METADATA_UPDATED_SUCCESS');
      expect(response.body).toHaveProperty('updatedFields');
      expect(response.body.updatedFields).toHaveProperty('metadata.firstName', 'New');
      expect(response.body.updatedFields).toHaveProperty('metadata.specialization', 'Frontend Developer');
      expect(User.update).toHaveBeenCalled();
    });

    test('debería actualizar la contraseña del profesor', async () => {
      // Mock para encontrar usuario por email
      User.findByEmail.mockResolvedValue({
        id: 'teacher-id',
        email: 'teacher@u-tad.com',
        seedWord: 'correct-seed',
        role: 'TEACHER'
      });
      
      // Mock para hash de contraseña
      bcrypt.hash.mockResolvedValue('newHashedPassword');
      
      // Mock para actualizar usuario
      User.update.mockResolvedValue({});
      
      const response = await request(app)
        .put('/updatePassword')
        .send({
          email: 'teacher@u-tad.com',
          newPassword: 'NewSecurePass123!',
          seedWord: 'correct-seed'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'PASSWORD_UPDATED_SUCCESS');
      expect(bcrypt.hash).toHaveBeenCalledWith('NewSecurePass123!', 10);
      expect(User.update).toHaveBeenCalled();
    });
  });

  describe('Gestión de Estudiantes', () => {
    test('debería obtener todos los estudiantes asignados al profesor', async () => {
      // Mock para encontrar profesor por ID
      User.findById.mockResolvedValue(mockTeacher);
      
      // Mock para encontrar estudiantes por rol
      User.findByRole.mockResolvedValue(mockStudents);
      
      const response = await request(app)
        .get('/student/teacher/getAllStudents')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('email', 'student1@live.u-tad.com');
      expect(response.body[1]).toHaveProperty('email', 'student2@live.u-tad.com');
    });

    test('debería obtener un estudiante específico', async () => {
      // Mock para encontrar profesor por ID
      User.findById.mockResolvedValue(mockTeacher);
      
      // Mock para encontrar estudiante por ID
      User.findById.mockResolvedValueOnce(mockStudents[0]);
      
      const response = await request(app)
        .get('/student/teacher/getStudent')
        .set('Authorization', 'Bearer test-token')
        .send({
          studentId: 'student-1'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'student-1');
      expect(response.body).toHaveProperty('email', 'student1@live.u-tad.com');
      expect(response.body).toHaveProperty('role', 'STUDENT');
      expect(response.body.metadata).toHaveProperty('firstName', 'Test');
      expect(response.body.metadata).toHaveProperty('degree', 'INSO_DATA');
    });

    test('debería fallar si el estudiante no está asignado al profesor', async () => {
      // Mock para encontrar profesor por ID
      User.findById.mockResolvedValue(mockTeacher);
      
      // Mock para encontrar estudiante por ID (sin el profesor en su lista)
      User.findById.mockResolvedValueOnce({
        id: 'student-3',
        email: 'student3@live.u-tad.com',
        role: 'STUDENT',
        metadata: {
          teacherList: ['other-teacher-id'] // No incluye al profesor actual
        }
      });
      
      const response = await request(app)
        .get('/student/teacher/getStudent')
        .set('Authorization', 'Bearer test-token')
        .send({
          studentId: 'student-3'
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'STUDENT_NOT_ASSIGNED_TO_TEACHER');
    });
  });

  describe('Notificaciones', () => {
    test('debería obtener notificaciones del profesor', async () => {
      // Mock para encontrar profesor por ID con notificaciones
      User.findById.mockResolvedValue({
        ...mockTeacher,
        metadata: {
          ...mockTeacher.metadata,
          notifications: [
            {
              studentId: 'student-1',
              message: 'Consulta sobre programación',
              date: '2023-01-01T00:00:00.000Z',
              status: 'unread'
            },
            {
              studentId: 'student-2',
              message: 'Solicitud de tutoría',
              date: '2023-01-02T00:00:00.000Z',
              status: 'read'
            }
          ]
        }
      });
      
      const response = await request(app)
        .get('/student/teacher/notification')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('notifications');
      expect(response.body.notifications).toHaveLength(2);
      expect(response.body.notifications[0]).toHaveProperty('message', 'Consulta sobre programación');
      expect(response.body.notifications[0]).toHaveProperty('status', 'unread');
      expect(response.body.notifications[1]).toHaveProperty('message', 'Solicitud de tutoría');
    });
  });
});