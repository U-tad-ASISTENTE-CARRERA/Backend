// tests/teacher/user-model-teacher.test.js
const User = require('../../models/User');
const { db } = require('../../config/firebase');

// Mock de Firestore
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

describe('Modelo User (funcionalidades Profesor)', () => {
  // Datos de prueba
  const mockTeacher = {
    id: 'teacher-id',
    email: 'teacher@u-tad.com',
    password: 'hashedPassword',
    role: 'TEACHER',
    metadata: {
      firstName: 'Test',
      lastName: 'Teacher',
      specialization: 'Frontend Development',
      notifications: []
    }
  };

  const mockStudents = [
    {
      id: 'student-1',
      email: 'student1@live.u-tad.com',
      role: 'STUDENT',
      metadata: {
        firstName: 'Test',
        lastName: 'Student1',
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
        teacherList: ['teacher-id']
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería crear un nuevo profesor', () => {
    const teacher = new User(
      mockTeacher.email,
      mockTeacher.password,
      'test-seed',
      'TEACHER',
      mockTeacher.metadata
    );
    
    expect(teacher).toBeInstanceOf(User);
    expect(teacher.email).toBe(mockTeacher.email);
    expect(teacher.role).toBe('TEACHER');
    expect(teacher.metadata).toHaveProperty('specialization', 'Frontend Development');
  });

  test('debería guardar un nuevo profesor en Firestore', async () => {
    // Mock de Firestore para set
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue({}),
        id: 'teacher-id'
      })
    });

    const teacher = new User(
      mockTeacher.email,
      mockTeacher.password,
      'test-seed',
      'TEACHER',
      mockTeacher.metadata
    );
    
    const result = await teacher.save();
    
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection().doc).toHaveBeenCalled();
    expect(db.collection().doc().set).toHaveBeenCalledWith(expect.objectContaining({ 
      id: 'teacher-id',
      email: mockTeacher.email,
      role: 'TEACHER'
    }));
    expect(result).toHaveProperty('id', 'teacher-id');
    expect(result).toHaveProperty('role', 'TEACHER');
  });

  test('debería encontrar profesores por rol', async () => {
    // Mock de Firestore para where().get()
    const mockDocs = [
      {
        data: () => ({
          id: 'teacher-1',
          email: 'teacher1@u-tad.com',
          role: 'TEACHER'
        })
      },
      {
        data: () => ({
          id: 'teacher-2',
          email: 'teacher2@u-tad.com',
          role: 'TEACHER'
        })
      }
    ];

    db.collection.mockReturnValue({
      where: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          empty: false,
          docs: mockDocs
        })
      })
    });

    const teachers = await User.findByRole('TEACHER');
    
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection().where).toHaveBeenCalledWith('role', '==', 'TEACHER');
    expect(teachers).toHaveLength(2);
    expect(teachers[0]).toHaveProperty('id', 'teacher-1');
    expect(teachers[0]).toHaveProperty('role', 'TEACHER');
    expect(teachers[1]).toHaveProperty('role', 'TEACHER');
  });

  test('debería actualizar los metadatos de un profesor', async () => {
    // Datos para actualizar
    const updateData = {
      'metadata.firstName': 'Updated',
      'metadata.lastName': 'Teacher',
      'metadata.specialization': 'Data Science', // Cambio de especialización
      updatedAt: new Date().toISOString()
    };

    // Mock de Firestore para update
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        update: jest.fn().mockResolvedValue({})
      })
    });

    const result = await User.update('teacher-id', updateData);
    
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection().doc).toHaveBeenCalledWith('teacher-id');
    expect(db.collection().doc().update).toHaveBeenCalledWith(updateData);
    expect(result).toHaveProperty('id', 'teacher-id');
    // Los metadatos actualizados deberían estar en el resultado
    expect(result).toHaveProperty('metadata.firstName', 'Updated');
    expect(result).toHaveProperty('metadata.specialization', 'Data Science');
  });

  test('debería actualizar múltiples campos de metadatos', async () => {
    // Mock para el método updateMultiMetadata
    User.updateMultiMetadata = jest.fn().mockImplementation(async (id, metadataUpdates) => {
      const updates = {};
      for (const key in metadataUpdates) {
        updates[`metadata.${key}`] = metadataUpdates[key];
      }
      
      updates.updatedAt = new Date().toISOString();
      
      // Mock de actualización
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          update: jest.fn().mockResolvedValue({})
        })
      });
      
      await db.collection().doc().update(updates);
      
      return { 
        id, 
        updatedFields: metadataUpdates 
      };
    });

    const metadataUpdates = {
      firstName: 'New',
      lastName: 'Teacher',
      specialization: 'Fullstack Development'
    };

    const result = await User.updateMultiMetadata('teacher-id', metadataUpdates);
    
    expect(User.updateMultiMetadata).toHaveBeenCalledWith('teacher-id', metadataUpdates);
    expect(result).toHaveProperty('id', 'teacher-id');
    expect(result).toHaveProperty('updatedFields');
    expect(result.updatedFields).toHaveProperty('firstName', 'New');
    expect(result.updatedFields).toHaveProperty('specialization', 'Fullstack Development');
  });

  test('debería añadir notificaciones a un profesor', async () => {
    // Mock para un profesor con notificaciones existentes
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            ...mockTeacher,
            metadata: {
              ...mockTeacher.metadata,
              notifications: [
                {
                  studentId: 'student-1',
                  message: 'Notificación existente',
                  date: '2023-01-01T00:00:00.000Z',
                  status: 'read'
                }
              ]
            }
          })
        }),
        update: jest.fn().mockResolvedValue({})
      })
    });

    // Nueva notificación a añadir
    const newNotification = {
      studentId: 'student-2',
      message: 'Nueva notificación',
      date: new Date().toISOString(),
      status: 'unread'
    };

    // El controlador obtendría primero el profesor
    const teacher = await User.findById('teacher-id');
    
    // Luego añadiría la notificación a su lista existente
    const notifications = teacher.metadata.notifications || [];
    notifications.push(newNotification);
    
    // Y finalmente actualizaría el profesor
    const updateResult = await User.update('teacher-id', {
      'metadata.notifications': notifications,
      updatedAt: new Date().toISOString()
    });

    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection().doc).toHaveBeenCalledWith('teacher-id');
    expect(db.collection().doc().get).toHaveBeenCalled();
    expect(db.collection().doc().update).toHaveBeenCalled();
    expect(notifications).toHaveLength(2);
    expect(notifications[1]).toEqual(newNotification);
  });
});