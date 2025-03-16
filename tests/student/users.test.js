// tests/student/users.test.js
const request = require('supertest');
const app = require('../../app');
const { db } = require('../../config/firebase');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// Mocks
jest.mock('../../config/firebase');
jest.mock('../../models/User');
jest.mock('bcryptjs');
jest.mock('../../utils/handleJwt', () => ({
  generateToken: jest.fn().mockReturnValue('test-token'),
  verifyToken: jest.fn().mockReturnValue({ id: 'student-id', email: 'student@live.u-tad.com', role: 'STUDENT' })
}));

// Mock de autenticación para estudiante
jest.mock('../../middlewares/auth', () => ({
  authUserMiddleware: (req, res, next) => {
    req.user = { id: 'student-id', email: 'student@live.u-tad.com', role: 'STUDENT' };
    next();
  },
  checkRole: () => (req, res, next) => next()
}));

// Datos de prueba
const mockStudent = {
  id: 'student-id',
  email: 'student@live.u-tad.com',
  role: 'STUDENT',
  metadata: {
    firstName: 'Test',
    lastName: 'Student',
    degree: 'INSO_DATA',
    specialization: 'Frontend Developer',
    teacherList: ['teacher-id']
  }
};

const mockTeachers = [
  {
    id: 'teacher-id',
    email: 'teacher@u-tad.com',
    role: 'TEACHER',
    metadata: {
      firstName: 'Test',
      lastName: 'Teacher',
      specialization: 'Frontend Developer'
    }
  },
  {
    id: 'teacher-id-2',
    email: 'teacher2@u-tad.com',
    role: 'TEACHER',
    metadata: {
      firstName: 'Test2',
      lastName: 'Teacher2',
      specialization: 'Data Science'
    }
  }
];

describe('CRUD de Usuarios (Estudiante)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Registro y Login de Estudiante', () => {
    test('debería registrar un nuevo estudiante', async () => {
      // Mock para simular que el usuario no existe
      User.findByEmail.mockRejectedValue(new Error('User not found'));
      
      // Mock para la creación del usuario
      User.prototype.save = jest.fn().mockResolvedValue({
        id: 'new-student-id',
        email: 'newstudent@live.u-tad.com',
        role: 'STUDENT'
      });
      
      // Mock para hash de contraseña
      bcrypt.hash.mockResolvedValue('hashedPassword');
      
      const response = await request(app)
        .post('/register')
        .send({
          email: 'newstudent@live.u-tad.com',
          password: 'SecurePass123!',
          seedWord: 'test-seed'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'newstudent@live.u-tad.com');
      expect(response.body.user).toHaveProperty('role', 'STUDENT');
      expect(bcrypt.hash).toHaveBeenCalled();
    });

    test('debería iniciar sesión correctamente', async () => {
      // Mock para encontrar el estudiante por email
      User.findByEmail.mockResolvedValue({
        id: 'student-id',
        email: 'student@live.u-tad.com',
        password: 'hashedPassword',
        role: 'STUDENT'
      });
      
      // Mock para validación de contraseña
      bcrypt.compare.mockResolvedValue(true);
      
      // Mock para actualizar fecha de último acceso
      User.update.mockResolvedValue({});
      
      const response = await request(app)
        .post('/login')
        .send({
          email: 'student@live.u-tad.com',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'student@live.u-tad.com');
      expect(response.body.user).toHaveProperty('role', 'STUDENT');
      expect(User.update).toHaveBeenCalled();
    });
  });

  describe('Gestión de Perfil de Estudiante', () => {
    test('debería obtener el perfil del estudiante', async () => {
      // Mock para encontrar estudiante por ID
      User.findById.mockResolvedValue(mockStudent);
      
      const response = await request(app)
        .get('/')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'student@live.u-tad.com');
      expect(response.body.user).toHaveProperty('role', 'STUDENT');
      expect(response.body.user).toHaveProperty('metadata');
      expect(response.body.user.metadata).toHaveProperty('firstName', 'Test');
      expect(response.body.user.metadata).toHaveProperty('degree', 'INSO_DATA');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('debería actualizar los metadatos del estudiante', async () => {
      // Mock para encontrar estudiante por ID
      User.findById.mockResolvedValue({
        id: 'student-id',
        email: 'student@live.u-tad.com',
        role: 'STUDENT',
        metadata: {
          firstName: 'Old',
          lastName: 'Name',
          degree: 'INSO_DATA'
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

    test('debería añadir habilidades al estudiante', async () => {
      // Mock para encontrar estudiante por ID
      User.findById.mockResolvedValue({
        id: 'student-id',
        email: 'student@live.u-tad.com',
        role: 'STUDENT',
        metadata: {
          skills: ['HTML', 'CSS']
        },
        updateHistory: []
      });
      
      // Mock para actualizar usuario
      User.update.mockResolvedValue({});
      
      const response = await request(app)
        .patch('/metadata')
        .set('Authorization', 'Bearer test-token')
        .send({
          skills: [
            { skill: 'JavaScript' },
            { skill: 'React' }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'METADATA_UPDATED_SUCCESS');
      expect(response.body).toHaveProperty('updatedFields');
      
      // Verificar que se hayan añadido las nuevas habilidades manteniendo las existentes
      const updatedSkills = response.body.updatedFields['metadata.skills'];
      expect(updatedSkills).toContainEqual({ skill: 'JavaScript' });
      expect(updatedSkills).toContainEqual({ skill: 'React' });
      expect(updatedSkills).toContainEqual('HTML');
      expect(updatedSkills).toContainEqual('CSS');
    });

    test('debería añadir certificaciones al estudiante', async () => {
      // Mock para encontrar estudiante por ID
      User.findById.mockResolvedValue({
        id: 'student-id',
        email: 'student@live.u-tad.com',
        role: 'STUDENT',
        metadata: {
          certifications: []
        },
        updateHistory: []
      });
      
      // Mock para actualizar usuario
      User.update.mockResolvedValue({});
      
      const response = await request(app)
        .patch('/metadata')
        .set('Authorization', 'Bearer test-token')
        .send({
          certifications: [
            { name: 'AWS Certified Developer', date: '2024-01-15', institution: 'Amazon' },
            { name: 'Microsoft Certified: Azure Developer', date: '2024-02-15', institution: 'Microsoft' }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'METADATA_UPDATED_SUCCESS');
      expect(response.body).toHaveProperty('updatedFields');
      expect(response.body.updatedFields['metadata.certifications']).toHaveLength(2);
    });

    test('debería eliminar metadatos del estudiante', async () => {
      // Mock para simular admin.firestore.FieldValue.delete()
      const admin = require('firebase-admin');
      admin.firestore.FieldValue = {
        delete: jest.fn().mockReturnValue('field-deleted')
      };
      
      // Mock para encontrar estudiante por ID
      User.findById.mockResolvedValue({
        id: 'student-id',
        email: 'student@live.u-tad.com',
        role: 'STUDENT',
        metadata: {
          workExperience: [
            { 
              jobType: 'Intern', 
              startDate: '2023-06-01', 
              endDate: '2023-12-31', 
              company: 'Nvidia', 
              description: 'AI Developer', 
              responsibilities: 'AI development tasks' 
            }
          ]
        },
        updateHistory: []
      });
      
      // Mock para actualizar usuario
      User.update.mockResolvedValue({});
      
      const response = await request(app)
        .delete('/metadata')
        .set('Authorization', 'Bearer test-token')
        .send({
          workExperience: [
            { 
              jobType: 'Intern', 
              startDate: '2023-06-01', 
              endDate: '2023-12-31', 
              company: 'Nvidia', 
              description: 'AI Developer', 
              responsibilities: 'AI development tasks' 
            }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'METADATA_DELETED_SUCCESS');
      expect(response.body).toHaveProperty('deletedFields');
      expect(response.body.deletedFields).toContain('metadata.workExperience');
    });
  });

  describe('Historial Académico', () => {
    test('debería obtener el historial académico del estudiante', async () => {
      // Mock para encontrar estudiante por ID con historial académico
      User.findById.mockResolvedValue({
        id: 'student-id',
        email: 'student@live.u-tad.com',
        role: 'STUDENT',
        metadata: {
          degree: 'INSO_DATA',
          AH: {
            subjects: [
              { name: 'Fundamentos de Desarrollo Web', grade: 8.5 },
              { name: 'Introducción a la Programación I', grade: 7.0 }
            ],
            lastUpdatedAt: '2023-01-01T00:00:00.000Z'
          }
        }
      });
      
      const response = await request(app)
        .get('/AH')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('subjects');
      expect(response.body.subjects).toHaveLength(2);
      expect(response.body.subjects[0]).toHaveProperty('name', 'Fundamentos de Desarrollo Web');
      expect(response.body.subjects[0]).toHaveProperty('grade', 8.5);
    });

    test('debería actualizar las calificaciones del estudiante', async () => {
      // Mock para encontrar estudiante por ID
      User.findById.mockResolvedValue({
        id: 'student-id',
        email: 'student@live.u-tad.com',
        role: 'STUDENT',
        metadata: {
          degree: 'INSO_DATA',
          AH: {
            subjects: [
              { name: 'Fundamentos de Desarrollo Web', credits: 6, skills: ['HTML', 'CSS'], grade: 7.0 },
              { name: 'Introducción a la Programación I', credits: 6, skills: ['C'], grade: 6.0 }
            ]
          }
        },
        updateHistory: []
      });
      
      // Mock para actualizar usuario
      User.update.mockResolvedValue({});
      
      const response = await request(app)
        .patch('/AH')
        .set('Authorization', 'Bearer test-token')
        .send({
          grades: [
            { name: 'Fundamentos de Desarrollo Web', grade: 8.5 },
            { name: 'Introducción a la Programación I', grade: 7.5 }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'SUBJECTS_METADATA_UPDATED');
      expect(response.body).toHaveProperty('updatedSubjects');
      expect(response.body.updatedSubjects[0]).toHaveProperty('grade', 8.5);
      expect(response.body.updatedSubjects[1]).toHaveProperty('grade', 7.5);
    });
  });

  describe('Roadmap', () => {
    test('debería obtener el roadmap del estudiante', async () => {
      // Mock para encontrar estudiante por ID con roadmap
      User.findById.mockResolvedValue({
        id: 'student-id',
        email: 'student@live.u-tad.com',
        role: 'STUDENT',
        metadata: {
          specialization: 'Frontend Developer',
          roadmap: {
            name: 'Frontend Developer',
            body: {
              intro: {
                'intro a desarrollo frontend': {
                  status: 'doing',
                  description: 'Introducción al desarrollo frontend'
                }
              },
              fundamentos: {
                'HTML y CSS': {
                  status: 'done',
                  description: 'Fundamentos de HTML y CSS'
                }
              }
            }
          }
        }
      });
      
      const response = await request(app)
        .get('/userRoadmap')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('roadmap');
      expect(response.body.roadmap).toHaveProperty('name', 'Frontend Developer');
      expect(response.body.roadmap.body.fundamentos['HTML y CSS']).toHaveProperty('status', 'done');
    });

    test('debería actualizar el estado de un tema del roadmap', async () => {
      // Mock para encontrar estudiante por ID con roadmap
      User.findById.mockResolvedValue({
        id: 'student-id',
        email: 'student@live.u-tad.com',
        role: 'STUDENT',
        metadata: {
          specialization: 'Frontend Developer',
          roadmap: {
            name: 'Frontend Developer',
            body: {
              intro: {
                'intro a desarrollo frontend': {
                  status: 'doing',
                  description: 'Introducción al desarrollo frontend'
                }
              },
              fundamentos: {
                'HTML y CSS': {
                  status: 'doing',
                  description: 'Fundamentos de HTML y CSS',
                  skill: 'HTML'
                }
              }
            }
          },
          skills: []
        }
      });
      
      // Mock para actualizar usuario
      User.update.mockResolvedValue({});
      
      const response = await request(app)
        .patch('/userRoadmap')
        .set('Authorization', 'Bearer test-token')
        .send({
          sectionName: 'fundamentos',
          topicName: 'HTML y CSS',
          newStatus: 'done'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Roadmap actualizado correctamente');
    });

    test('debería eliminar el roadmap del estudiante', async () => {
      // Mock para simular admin.firestore.FieldValue.delete()
      const admin = require('firebase-admin');
      admin.firestore.FieldValue = {
        delete: jest.fn().mockReturnValue('field-deleted')
      };
      
      // Mock para encontrar estudiante por ID con roadmap
      User.findById.mockResolvedValue({
        id: 'student-id',
        email: 'student@live.u-tad.com',
        role: 'STUDENT',
        metadata: {
          roadmap: {
            name: 'Frontend Developer'
          }
        }
      });
      
      // Mock para actualizar usuario
      User.update.mockResolvedValue({});
      
      const response = await request(app)
        .delete('/userRoadmap')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Roadmap deleted successfully');
    });
  });

  describe('Interacción con Profesores', () => {
    test('debería obtener la lista de profesores disponibles', async () => {
      // Mock para obtener profesores por rol
      User.findByRole.mockResolvedValue(mockTeachers);
      
      const response = await request(app)
        .get('/teacher')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id', 'teacher-id');
      expect(response.body[0]).toHaveProperty('role', 'TEACHER');
      expect(response.body[0].metadata).toHaveProperty('specialization', 'Frontend Developer');
    });

    test('debería obtener profesores por especialización', async () => {
      // Mock para obtener profesores por rol
      User.findByRole.mockResolvedValue(mockTeachers);
      
      const response = await request(app)
        .get('/teacher/Frontend Developer')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('id', 'teacher-id');
      expect(response.body[0].metadata).toHaveProperty('specialization', 'Frontend Developer');
    });

    test('debería obtener la lista de profesores asignados al estudiante', async () => {
      // Mock para encontrar estudiante por ID
      User.findById.mockResolvedValue({
        id: 'student-id',
        email: 'student@live.u-tad.com',
        role: 'STUDENT',
        metadata: {
          teacherList: ['teacher-id']
        }
      });
      
      // Mock para encontrar profesor por ID
      User.findById.mockResolvedValueOnce({
        id: 'teacher-id',
        email: 'teacher@u-tad.com',
        role: 'TEACHER',
        metadata: {
          firstName: 'Test',
          lastName: 'Teacher',
          specialization: 'Frontend Developer'
        }
      });
      
      const response = await request(app)
        .get('/student/teacher')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('teachers');
      expect(response.body.teachers).toHaveLength(1);
      expect(response.body.teachers[0]).toHaveProperty('id', 'teacher-id');
      expect(response.body.teachers[0]).toHaveProperty('role', 'TEACHER');
    });

    test('debería añadir un profesor a la lista del estudiante', async () => {
      // Mock para encontrar estudiante por ID
      User.findById.mockResolvedValue({
        id: 'student-id',
        email: 'student@live.u-tad.com',
        role: 'STUDENT',
        metadata: {
          teacherList: []
        }
      });
      
      // Mock para encontrar profesor por ID
      User.findById.mockResolvedValueOnce({
        id: 'teacher-id',
        email: 'teacher@u-tad.com',
        role: 'TEACHER'
      });
      
      // Mock para actualizar usuario
      User.update.mockResolvedValue({});
      
      const response = await request(app)
        .post('/student/teacher')
        .set('Authorization', 'Bearer test-token')
        .send({
          teacherId: 'teacher-id'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'TEACHER_ADDED_TO_STUDENT');
      expect(response.body).toHaveProperty('teacherId', 'teacher-id');
    });

    test('debería enviar una notificación a un profesor', async () => {
      // Mock para encontrar estudiante por ID
      User.findById.mockResolvedValue({
        id: 'student-id',
        email: 'student@live.u-tad.com',
        role: 'STUDENT',
        metadata: {
          firstName: 'Test',
          lastName: 'Student',
          teacherList: ['teacher-id']
        }
      });
      
      // Mock para encontrar profesor por ID
      User.findById.mockResolvedValueOnce({
        id: 'teacher-id',
        email: 'teacher@u-tad.com',
        role: 'TEACHER',
        metadata: {
          notifications: []
        }
      });
      
      // Mock para actualizar usuario
      User.update.mockResolvedValue({});
      
      const response = await request(app)
        .post('/student/teacher/notification')
        .set('Authorization', 'Bearer test-token')
        .send({
          teacherId: 'teacher-id',
          message: 'Consulta sobre programación'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'NOTIFICATION_SENT');
      expect(response.body).toHaveProperty('notification');
      expect(response.body.notification).toHaveProperty('studentId', 'student-id');
      expect(response.body.notification).toHaveProperty('message', 'Consulta sobre programación');
      expect(response.body.notification).toHaveProperty('status', 'unread');
    });
  });
});