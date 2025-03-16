// tests/academic/degree-model.test.js
const Degree = require('../../models/Degree');
const { db } = require('../../config/firebase');

// Mock de Firestore
jest.mock('../../config/firebase', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

describe('Modelo Degree', () => {
  // Datos de prueba
  const mockDegreeData = {
    name: 'INSO_DATA',
    subjects: [
      {
        name: 'Fundamentos de Desarrollo Web',
        credits: 6,
        label: 'frontend',
        type: 'B',
        skills: ['HTML', 'CSS', 'JavaScript'],
        year: 1
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería crear una nueva instancia de Degree', () => {
    const degree = new Degree(mockDegreeData.name, mockDegreeData.subjects);
    
    expect(degree).toBeInstanceOf(Degree);
    expect(degree.degree.name).toBe(mockDegreeData.name);
    expect(degree.degree.subjects).toEqual(mockDegreeData.subjects);
    expect(degree.degree.createdAt).toBeDefined();
    expect(degree.degree.updatedAt).toBeDefined();
  });

  test('debería guardar un nuevo degree en Firestore', async () => {
    // Mock de Firestore para set
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue({}),
        id: 'degree-id'
      })
    });

    const degree = new Degree(mockDegreeData.name, mockDegreeData.subjects);
    const result = await degree.save();
    
    expect(db.collection).toHaveBeenCalledWith('degrees');
    expect(db.collection().doc).toHaveBeenCalledWith(mockDegreeData.name);
    expect(db.collection().doc().set).toHaveBeenCalledWith(degree.degree);
    expect(result).toHaveProperty('id', 'degree-id');
    expect(result).toHaveProperty('name', mockDegreeData.name);
  });

  test('debería encontrar todos los degrees', async () => {
    // Mock de Firestore para get
    const mockDocs = [
      {
        id: 'degree-1',
        data: () => ({
          name: 'INSO_DATA',
          subjects: []
        })
      },
      {
        id: 'degree-2',
        data: () => ({
          name: 'INSO_GAME',
          subjects: []
        })
      }
    ];

    db.collection.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        docs: mockDocs
      })
    });

    const degrees = await Degree.findAll();
    
    expect(db.collection).toHaveBeenCalledWith('degrees');
    expect(db.collection().get).toHaveBeenCalled();
    expect(degrees).toHaveLength(2);
    expect(degrees[0]).toHaveProperty('id', 'degree-1');
    expect(degrees[0]).toHaveProperty('name', 'INSO_DATA');
    expect(degrees[1]).toHaveProperty('id', 'degree-2');
    expect(degrees[1]).toHaveProperty('name', 'INSO_GAME');
  });

  test('debería encontrar un degree por nombre', async () => {
    // Mock de Firestore para doc().get()
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          id: 'INSO_DATA',
          data: () => ({
            name: 'INSO_DATA',
            subjects: mockDegreeData.subjects
          })
        })
      })
    });

    const degree = await Degree.findByName('INSO_DATA');
    
    expect(db.collection).toHaveBeenCalledWith('degrees');
    expect(db.collection().doc).toHaveBeenCalledWith('INSO_DATA');
    expect(db.collection().doc().get).toHaveBeenCalled();
    expect(degree).toHaveProperty('id', 'INSO_DATA');
    expect(degree).toHaveProperty('name', 'INSO_DATA');
    expect(degree).toHaveProperty('subjects');
    expect(degree.subjects).toEqual(mockDegreeData.subjects);
  });

  test('debería lanzar un error si el degree no existe', async () => {
    // Mock de Firestore para simular que no existe el documento
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: false
        })
      })
    });

    await expect(Degree.findByName('NONEXISTENT')).rejects.toThrow('Degree not found');
    
    expect(db.collection).toHaveBeenCalledWith('degrees');
    expect(db.collection().doc).toHaveBeenCalledWith('NONEXISTENT');
    expect(db.collection().doc().get).toHaveBeenCalled();
  });

  test('debería actualizar un degree', async () => {
    // Datos para actualizar
    const updateData = {
      subjects: [
        {
          name: 'Fundamentos de Desarrollo Web',
          credits: 7, // Cambiado de 6 a 7
          label: 'frontend',
          type: 'B',
          skills: ['HTML', 'CSS', 'JavaScript', 'Bootstrap'], // Añadido Bootstrap
          year: 1
        }
      ],
      updatedAt: new Date().toISOString()
    };

    // Mock de Firestore para update
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        update: jest.fn().mockResolvedValue({})
      })
    });

    const result = await Degree.update('INSO_DATA', updateData);
    
    expect(db.collection).toHaveBeenCalledWith('degrees');
    expect(db.collection().doc).toHaveBeenCalledWith('INSO_DATA');
    expect(db.collection().doc().update).toHaveBeenCalledWith(updateData);
    expect(result).toHaveProperty('id', 'INSO_DATA');
    expect(result).toHaveProperty('subjects');
    expect(result.subjects[0]).toHaveProperty('credits', 7);
    expect(result.subjects[0].skills).toContain('Bootstrap');
  });

  test('debería eliminar un degree', async () => {
    // Mock de Firestore para delete
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        delete: jest.fn().mockResolvedValue({})
      })
    });

    const result = await Degree.delete('INSO_DATA');
    
    expect(db.collection).toHaveBeenCalledWith('degrees');
    expect(db.collection().doc).toHaveBeenCalledWith('INSO_DATA');
    expect(db.collection().doc().delete).toHaveBeenCalled();
    expect(result).toHaveProperty('message', 'Degree deleted');
    expect(result).toHaveProperty('id', 'INSO_DATA');
  });
});