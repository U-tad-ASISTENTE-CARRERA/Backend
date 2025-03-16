// tests/admin/user-model.test.js
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

describe('Modelo User (funcionalidades Admin)', () => {
  // Datos de prueba
  const mockUserData = {
    email: 'student@live.u-tad.com',
    password: 'hashedPassword',
    seedWord: 'test-seed',
    role: 'STUDENT',
    metadata: {
      firstName: 'Test',
      lastName: 'Student'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería crear una nueva instancia de User', () => {
    const user = new User(
      mockUserData.email,
      mockUserData.password,
      mockUserData.seedWord,
      mockUserData.role,
      mockUserData.metadata
    );
    
    expect(user).toBeInstanceOf(User);
    expect(user.email).toBe(mockUserData.email);
    expect(user.password).toBe(mockUserData.password);
    expect(user.role).toBe(mockUserData.role);
    expect(user.seedWord).toBe(mockUserData.seedWord);
    expect(user.metadata).toEqual(mockUserData.metadata);
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  test('debería guardar un nuevo usuario en Firestore', async () => {
    // Mock de Firestore para set
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue({}),
        id: 'test-id'
      })
    });

    const user = new User(
      mockUserData.email,
      mockUserData.password,
      mockUserData.seedWord,
      mockUserData.role,
      mockUserData.metadata
    );
    
    const result = await user.save();
    
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection().doc).toHaveBeenCalled();
    expect(db.collection().doc().set).toHaveBeenCalledWith(expect.objectContaining({ 
      id: 'test-id',
      email: mockUserData.email,
      role: mockUserData.role
    }));
    expect(result).toHaveProperty('id', 'test-id');
    expect(result).toHaveProperty('email', mockUserData.email);
  });

  test('debería encontrar todos los usuarios', async () => {
    // Mock de Firestore para get
    const mockDocs = [
      {
        data: () => ({
          id: 'user-1',
          email: 'student@live.u-tad.com',
          role: 'STUDENT'
        })
      },
      {
        data: () => ({
          id: 'user-2',
          email: 'teacher@u-tad.com',
          role: 'TEACHER'
        })
      }
    ];

    db.collection.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        docs: mockDocs
      })
    });

    const users = await User.findAll();
    
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection().get).toHaveBeenCalled();
    expect(users).toHaveLength(2);
    expect(users[0]).toHaveProperty('id', 'user-1');
    expect(users[0]).toHaveProperty('email', 'student@live.u-tad.com');
    expect(users[0]).toHaveProperty('role', 'STUDENT');
    expect(users[1]).toHaveProperty('role', 'TEACHER');
  });

  test('debería encontrar usuarios por rol', async () => {
    // Mock de Firestore para where().get()
    const mockDocs = [
      {
        data: () => ({
          id: 'user-1',
          email: 'student1@live.u-tad.com',
          role: 'STUDENT'
        })
      },
      {
        data: () => ({
          id: 'user-2',
          email: 'student2@live.u-tad.com',
          role: 'STUDENT'
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

    const users = await User.findByRole('STUDENT');
    
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection().where).toHaveBeenCalledWith('role', '==', 'STUDENT');
    expect(users).toHaveLength(2);
    expect(users[0]).toHaveProperty('id', 'user-1');
    expect(users[0]).toHaveProperty('role', 'STUDENT');
    expect(users[1]).toHaveProperty('role', 'STUDENT');
  });

  test('debería lanzar un error si no hay usuarios con el rol especificado', async () => {
    // Mock de Firestore para where().get() con resultado vacío
    db.collection.mockReturnValue({
      where: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          empty: true,
          docs: []
        })
      })
    });

    await expect(User.findByRole('NONEXISTENT')).rejects.toThrow('No users with this role found');
    
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection().where).toHaveBeenCalledWith('role', '==', 'NONEXISTENT');
  });

  test('debería encontrar un usuario por ID', async () => {
    // Mock de Firestore para doc().get()
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            id: 'user-1',
            email: 'student@live.u-tad.com',
            role: 'STUDENT',
            metadata: mockUserData.metadata
          })
        })
      })
    });

    const user = await User.findById('user-1');
    
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection().doc).toHaveBeenCalledWith('user-1');
    expect(db.collection().doc().get).toHaveBeenCalled();
    expect(user).toHaveProperty('id', 'user-1');
    expect(user).toHaveProperty('email', 'student@live.u-tad.com');
    expect(user).toHaveProperty('metadata');
    expect(user.metadata).toEqual(mockUserData.metadata);
  });

  test('debería lanzar un error si el usuario no existe', async () => {
    // Mock de Firestore para simular que no existe el documento
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: false
        })
      })
    });

    await expect(User.findById('nonexistent')).rejects.toThrow('User not found');
    
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection().doc).toHaveBeenCalledWith('nonexistent');
    expect(db.collection().doc().get).toHaveBeenCalled();
  });

  test('debería encontrar un usuario por email', async () => {
    // Mock de Firestore para where().get()
    db.collection.mockReturnValue({
      where: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          empty: false,
          docs: [{
            data: () => ({
              id: 'user-1',
              email: 'student@live.u-tad.com',
              role: 'STUDENT'
            })
          }]
        })
      })
    });

    const user = await User.findByEmail('student@live.u-tad.com');
    
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection().where).toHaveBeenCalledWith('email', '==', 'student@live.u-tad.com');
    expect(user).toHaveProperty('id', 'user-1');
    expect(user).toHaveProperty('email', 'student@live.u-tad.com');
  });

  test('debería lanzar un error si no existe un usuario con el email', async () => {
    // Mock de Firestore para where().get() con resultado vacío
    db.collection.mockReturnValue({
      where: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          empty: true,
          docs: []
        })
      })
    });

    await expect(User.findByEmail('nonexistent@live.u-tad.com')).rejects.toThrow('User with this email not found');
    
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection().where).toHaveBeenCalledWith('email', '==', 'nonexistent@live.u-tad.com');
  });

  test('debería actualizar un usuario', async () => {
    // Datos para actualizar
    const updateData = {
      metadata: {
        firstName: 'Updated',
        lastName: 'Student'
      },
      updatedAt: new Date().toISOString()
    };

    // Mock de Firestore para update
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        update: jest.fn().mockResolvedValue({})
      })
    });

    const result = await User.update('user-1', updateData);
    
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection().doc).toHaveBeenCalledWith('user-1');
    expect(db.collection().doc().update).toHaveBeenCalledWith(updateData);
    expect(result).toHaveProperty('id', 'user-1');
    expect(result).toHaveProperty('metadata');
    expect(result.metadata).toEqual(updateData.metadata);
  });

  test('debería eliminar un usuario por ID', async () => {
    // Mock de Firestore para delete
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        delete: jest.fn().mockResolvedValue({})
      })
    });

    const result = await User.delete('user-1');
    
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection().doc).toHaveBeenCalledWith('user-1');
    expect(db.collection().doc().delete).toHaveBeenCalled();
    expect(result).toHaveProperty('message', 'User deleted');
    expect(result).toHaveProperty('id', 'user-1');
  });

  test('debería encontrar y eliminar un usuario por ID', async () => {
    // Mock de Firestore para doc().get() y delete
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            id: 'user-1',
            email: 'student@live.u-tad.com',
            role: 'STUDENT'
          })
        }),
        delete: jest.fn().mockResolvedValue({})
      })
    });

    const result = await User.findByIdAndDelete('user-1');
    
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection().doc).toHaveBeenCalledWith('user-1');
    expect(db.collection().doc().get).toHaveBeenCalled();
    expect(db.collection().doc().delete).toHaveBeenCalled();
    expect(result).toHaveProperty('id', 'user-1');
    expect(result).toHaveProperty('email', 'student@live.u-tad.com');
  });
});