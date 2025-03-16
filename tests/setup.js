/**
 * Mock de Firebase Firestore
 * Proporciona implementaciones simuladas para todos los métodos de Firestore utilizados en la aplicación
*/

jest.mock('../config/firebase', () => {
  return {
    db: {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      where: jest.fn().mockReturnThis(),
      delete: jest.fn()
    },
    deleteInactiveUsers: jest.fn()
  };
});

/**
 * Mock de bcryptjs
 * Simula las funciones de hash y comparación de contraseñas
 */
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

/**
 * Mock de Firebase Admin
 * Simula el objeto FieldValue para operaciones de eliminación de campos
 */
jest.mock('firebase-admin', () => ({
  firestore: {
    FieldValue: {
      delete: jest.fn().mockReturnValue('field-deleted'),
      merge: jest.fn().mockImplementation(data => data)
    }
  }
}));

/**
 * Mock de utilidades JWT
 * Simula la generación y verificación de tokens JWT
 */
jest.mock('../utils/handleJwt', () => ({
  generateToken: jest.fn().mockReturnValue('test-token'),
  verifyToken: jest.fn().mockReturnValue({ 
    id: 'test-id', 
    email: 'test@live.u-tad.com', 
    role: 'STUDENT' 
  })
}));

/**
 * Mock de Resend (servicio de email)
 * Simula el envío de emails
 */
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => {
      return {
        emails: {
          send: jest.fn().mockResolvedValue({ id: 'test-email-id' })
        }
      };
    })
  };
});

/**
 * Mock de fs/promises
 * Simula operaciones de archivos para tests que implican carga de archivos
 */
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  unlink: jest.fn().mockResolvedValue(undefined)
}));

/**
 * Mock de multer
 * Simula la carga de archivos en endpoints que utilizan multer
 */
jest.mock('multer', () => ({
  diskStorage: jest.fn().mockReturnValue({}),
  single: jest.fn().mockImplementation(() => {
    return (req, res, next) => {
      req.file = {
        path: 'test/file/path.json',
        originalname: 'test.json'
      };
      next();
    };
  })
}));

/**
 * Mock del middleware de autenticación
 * Proporciona diferentes implementaciones según el rol necesario para las pruebas
 */
jest.mock('../middlewares/auth', () => {
  // Función base que devuelve middleware de autenticación para un rol específico
  const createAuthMiddleware = (role = 'STUDENT', userId = 'test-id') => {
    return (req, res, next) => {
      req.user = {
        id: userId,
        email: role === 'STUDENT' ? 'test@live.u-tad.com' : 
               role === 'TEACHER' ? 'teacher@u-tad.com' : 
               'admin@gmail.com',
        role: role
      };
      next();
    };
  };

  return {
    // Middleware de autenticación predeterminado (estudiante)
    authUserMiddleware: jest.fn().mockImplementation(createAuthMiddleware('STUDENT')),
    
    // Comprobación de rol que devuelve un middleware diferente según el rol
    checkRole: jest.fn().mockImplementation((allowedRoles) => {
      return (req, res, next) => {
        // Si req.user ya está definido, utilizar ese rol
        if (req.user && req.user.role) {
          if (Array.isArray(allowedRoles) && allowedRoles.includes(req.user.role)) {
            next();
          } else if (allowedRoles === req.user.role) {
            next();
          } else {
            res.status(403).json({ error: 'ACCESS_DENIED' });
          }
        } else {
          // Si no está definido, establecer un usuario con el primer rol permitido
          const role = Array.isArray(allowedRoles) ? allowedRoles[0] : allowedRoles;
          req.user = {
            id: role === 'STUDENT' ? 'student-id' : 
                role === 'TEACHER' ? 'teacher-id' : 
                'admin-id',
            email: role === 'STUDENT' ? 'test@live.u-tad.com' : 
                  role === 'TEACHER' ? 'teacher@u-tad.com' : 
                  'admin@gmail.com',
            role: role
          };
          next();
        }
      };
    }),

    // Funciones auxiliares para cambiar dinámicamente el rol en las pruebas
    setRole: (role, userId) => {
      jest.spyOn(module.exports, 'authUserMiddleware').mockImplementation(createAuthMiddleware(role, userId));
    }
  };
});

/**
 * Mock de modelos
 * Proporcionan implementaciones simuladas para operaciones comunes
 */
jest.mock('../models/User', () => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByRole: jest.fn(),
  findAll: jest.fn(),
  findByIdAndDelete: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  prototype: {
    save: jest.fn()
  }
}));

jest.mock('../models/Degree', () => ({
  findByName: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  prototype: {
    save: jest.fn()
  }
}));

jest.mock('../models/Roadmap', () => ({
  findByName: jest.fn(),
  findAll: jest.fn(),
  updateByName: jest.fn(),
  deleteByName: jest.fn(),
  prototype: {
    save: jest.fn()
  }
}));

// Funciones para crear mocks comunes reutilizables
const createStudentMock = (overrides = {}) => ({
  id: overrides.id || 'student-id',
  email: overrides.email || 'student@live.u-tad.com',
  role: 'STUDENT',
  password: 'hashedPassword',
  seedWord: overrides.seedWord || 'test-seed',
  metadata: {
    firstName: 'Test',
    lastName: 'Student',
    degree: 'INSO_DATA',
    specialization: 'Frontend Developer',
    skills: ['HTML', 'CSS'],
    teacherList: ['teacher-id'],
    ...(overrides.metadata || {})
  },
  updateHistory: overrides.updateHistory || [],
  ...overrides
});

const createTeacherMock = (overrides = {}) => ({
  id: overrides.id || 'teacher-id',
  email: overrides.email || 'teacher@u-tad.com',
  role: 'TEACHER',
  password: 'hashedPassword',
  seedWord: overrides.seedWord || 'teacher-seed',
  metadata: {
    firstName: 'Test',
    lastName: 'Teacher',
    specialization: 'Frontend Developer',
    notifications: [],
    ...(overrides.metadata || {})
  },
  updateHistory: overrides.updateHistory || [],
  ...overrides
});

const createAdminMock = (overrides = {}) => ({
  id: overrides.id || 'admin-id',
  email: overrides.email || 'admin@gmail.com',
  role: 'ADMIN',
  password: 'hashedPassword',
  seedWord: overrides.seedWord || 'admin-seed',
  ...overrides
});

const createDegreeMock = (overrides = {}) => ({
  id: overrides.id || 'INSO_DATA',
  name: overrides.name || 'INSO_DATA',
  subjects: overrides.subjects || [
    {
      name: 'Fundamentos de Desarrollo Web',
      credits: 6,
      label: 'frontend',
      type: 'B',
      skills: ['HTML', 'CSS', 'JavaScript'],
      year: 1
    },
    {
      name: 'Introducción a la Programación I',
      credits: 6,
      label: 'software',
      type: 'B',
      skills: ['C'],
      year: 1
    }
  ],
  createdAt: overrides.createdAt || '2023-01-01T00:00:00.000Z',
  updatedAt: overrides.updatedAt || '2023-01-01T00:00:00.000Z',
  ...overrides
});

const createRoadmapMock = (overrides = {}) => ({
  name: overrides.name || 'Frontend Developer',
  body: overrides.body || {
    intro: {
      'intro a desarrollo frontend': {
        status: 'doing',
        description: 'Introducción al desarrollo frontend',
        skill: '',
        subject: ''
      }
    },
    fundamentos: {
      'HTML y CSS': {
        status: 'doing',
        description: 'Fundamentos de HTML y CSS',
        skill: 'HTML',
        subject: 'Fundamentos de Desarrollo Web'
      }
    }
  },
  createdAt: overrides.createdAt || '2023-01-01T00:00:00.000Z',
  updatedAt: overrides.updatedAt || '2023-01-01T00:00:00.000Z',
  ...overrides
});

const createDocumentMock = (data) => ({
  exists: data ? true : false,
  data: () => data || null,
  id: data?.id || 'mock-id'
});

const createCollectionMock = (docs) => ({
  empty: !docs || docs.length === 0,
  docs: (docs || []).map(doc => ({
    data: () => doc,
    id: doc.id || 'mock-id'
  }))
});

/**
 * Función para configurar simulaciones de Firestore para un test específico
 */
const mockFirestore = (responseData) => {
  const { db } = require('../config/firebase');
  
  // Resetear todos los mocks
  db.collection.mockReset();
  db.doc.mockReset();
  db.get.mockReset();
  db.set.mockReset();
  db.update.mockReset();
  db.where.mockReset();
  
  if (responseData.collection) {
    // Para consultas where
    db.collection.mockReturnValue({
      where: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(createCollectionMock(responseData.collection))
      }),
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(createDocumentMock(responseData.document || {})),
        set: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({})
      })
    });
  } else {
    // Para consultas por ID
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(createDocumentMock(responseData.document || {})),
        set: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({})
      })
    });
  }
};

/**
 * Función para configurar mocks de modelos para un test específico
 */
const mockModels = (options = {}) => {
  const User = require('../models/User');
  const Degree = require('../models/Degree');
  const Roadmap = require('../models/Roadmap');

  // Resetear todos los mocks
  User.findById.mockReset();
  User.findByEmail.mockReset();
  User.findByRole.mockReset();
  User.findAll.mockReset();
  User.findByIdAndDelete.mockReset();
  User.update.mockReset();
  User.delete.mockReset();
  User.prototype.save.mockReset();

  Degree.findByName.mockReset();
  Degree.findAll.mockReset();
  Degree.findById.mockReset();
  Degree.update.mockReset();
  Degree.delete.mockReset();
  Degree.prototype.save.mockReset();

  Roadmap.findByName.mockReset();
  Roadmap.findAll.mockReset();
  Roadmap.updateByName.mockReset();
  Roadmap.deleteByName.mockReset();
  Roadmap.prototype.save.mockReset();

  // Configurar mocks según opciones proporcionadas
  if (options.user) {
    if (options.user.findById) User.findById.mockResolvedValue(options.user.findById);
    if (options.user.findByEmail) User.findByEmail.mockResolvedValue(options.user.findByEmail);
    if (options.user.findByRole) User.findByRole.mockResolvedValue(options.user.findByRole);
    if (options.user.findAll) User.findAll.mockResolvedValue(options.user.findAll);
    if (options.user.findByIdAndDelete) User.findByIdAndDelete.mockResolvedValue(options.user.findByIdAndDelete);
    if (options.user.update) User.update.mockResolvedValue(options.user.update);
    if (options.user.delete) User.delete.mockResolvedValue(options.user.delete);
    if (options.user.save) User.prototype.save.mockResolvedValue(options.user.save);
  }

  if (options.degree) {
    if (options.degree.findByName) Degree.findByName.mockResolvedValue(options.degree.findByName);
    if (options.degree.findAll) Degree.findAll.mockResolvedValue(options.degree.findAll);
    if (options.degree.findById) Degree.findById.mockResolvedValue(options.degree.findById);
    if (options.degree.update) Degree.update.mockResolvedValue(options.degree.update);
    if (options.degree.delete) Degree.delete.mockResolvedValue(options.degree.delete);
    if (options.degree.save) Degree.prototype.save.mockResolvedValue(options.degree.save);
  }

  if (options.roadmap) {
    if (options.roadmap.findByName) Roadmap.findByName.mockResolvedValue(options.roadmap.findByName);
    if (options.roadmap.findAll) Roadmap.findAll.mockResolvedValue(options.roadmap.findAll);
    if (options.roadmap.updateByName) Roadmap.updateByName.mockResolvedValue(options.roadmap.updateByName);
    if (options.roadmap.deleteByName) Roadmap.deleteByName.mockResolvedValue(options.roadmap.deleteByName);
    if (options.roadmap.save) Roadmap.prototype.save.mockResolvedValue(options.roadmap.save);
  }
};

// Configuración global de Jest
beforeEach(() => {
  jest.clearAllMocks();
});

// Exportar funciones auxiliares
module.exports = {
  createStudentMock,
  createTeacherMock,
  createAdminMock,
  createDegreeMock,
  createRoadmapMock,
  createDocumentMock,
  createCollectionMock,
  mockFirestore,
  mockModels
};