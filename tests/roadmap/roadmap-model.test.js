// tests/roadmap/roadmap-model.test.js
const Roadmap = require('../../models/Roadmap');
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

describe('Modelo Roadmap', () => {
  // Datos de prueba
  const mockRoadmapData = {
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería crear una nueva instancia de Roadmap', () => {
    const roadmap = new Roadmap(mockRoadmapData.name, mockRoadmapData.body);
    
    expect(roadmap).toBeInstanceOf(Roadmap);
    expect(roadmap.name).toBe(mockRoadmapData.name);
    expect(roadmap.body).toEqual(mockRoadmapData.body);
    expect(roadmap.createdAt).toBeDefined();
    expect(roadmap.updatedAt).toBeDefined();
  });

  test('debería guardar un nuevo roadmap en Firestore', async () => {
    // Mock de Firestore para set
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue({}),
        id: mockRoadmapData.name
      })
    });

    const roadmap = new Roadmap(mockRoadmapData.name, mockRoadmapData.body);
    const result = await roadmap.save();
    
    expect(db.collection).toHaveBeenCalledWith('roadmaps');
    expect(db.collection().doc).toHaveBeenCalledWith(mockRoadmapData.name);
    expect(db.collection().doc().set).toHaveBeenCalledWith(expect.objectContaining({ 
      name: mockRoadmapData.name,
      body: mockRoadmapData.body
    }));
    expect(result).toHaveProperty('name', mockRoadmapData.name);
    expect(result).toHaveProperty('body', mockRoadmapData.body);
  });

  test('debería encontrar todos los roadmaps', async () => {
    // Mock de Firestore para get
    const mockDocs = [
      {
        data: () => ({
          name: 'Frontend Developer',
          body: {}
        })
      },
      {
        data: () => ({
          name: 'Backend Developer',
          body: {}
        })
      }
    ];

    db.collection.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        docs: mockDocs
      })
    });

    const roadmaps = await Roadmap.findAll();
    
    expect(db.collection).toHaveBeenCalledWith('roadmaps');
    expect(db.collection().get).toHaveBeenCalled();
    expect(roadmaps).toHaveLength(2);
    expect(roadmaps[0]).toHaveProperty('name', 'Frontend Developer');
    expect(roadmaps[1]).toHaveProperty('name', 'Backend Developer');
  });

  test('debería encontrar un roadmap por nombre', async () => {
    // Mock de Firestore para doc().get()
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            name: 'Frontend Developer',
            body: mockRoadmapData.body
          })
        })
      })
    });

    const roadmap = await Roadmap.findByName('Frontend Developer');
    
    expect(db.collection).toHaveBeenCalledWith('roadmaps');
    expect(db.collection().doc).toHaveBeenCalledWith('Frontend Developer');
    expect(db.collection().doc().get).toHaveBeenCalled();
    expect(roadmap).toHaveProperty('name', 'Frontend Developer');
    expect(roadmap).toHaveProperty('body');
    expect(roadmap.body).toEqual(mockRoadmapData.body);
  });

  test('debería lanzar un error si el roadmap no existe', async () => {
    // Mock de Firestore para simular que no existe el documento
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: false
        })
      })
    });

    await expect(Roadmap.findByName('Nonexistent')).rejects.toThrow('Roadmap not found');
    
    expect(db.collection).toHaveBeenCalledWith('roadmaps');
    expect(db.collection().doc).toHaveBeenCalledWith('Nonexistent');
    expect(db.collection().doc().get).toHaveBeenCalled();
  });

  test('debería actualizar un roadmap por nombre', async () => {
    // Datos para actualizar
    const updateData = {
      body: {
        ...mockRoadmapData.body,
        avanzado: {
          'React': {
            description: 'Framework de JavaScript',
            status: 'doing'
          }
        }
      },
      updatedAt: new Date().toISOString()
    };

    // Mock de Firestore para actualizar
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true
        }),
        update: jest.fn().mockResolvedValue({})
      })
    });

    const result = await Roadmap.updateByName('Frontend Developer', updateData);
    
    expect(db.collection).toHaveBeenCalledWith('roadmaps');
    expect(db.collection().doc).toHaveBeenCalledWith('Frontend Developer');
    expect(db.collection().doc().get).toHaveBeenCalled();
    expect(db.collection().doc().update).toHaveBeenCalledWith(updateData);
    expect(result).toHaveProperty('name', 'Frontend Developer');
    expect(result.body).toHaveProperty('avanzado');
    expect(result.body.avanzado).toHaveProperty('React');
  });

  test('debería fallar al actualizar si el roadmap no existe', async () => {
    // Mock de Firestore para simular que no existe el documento
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: false
        })
      })
    });

    await expect(Roadmap.updateByName('Nonexistent', {})).rejects.toThrow('Roadmap not found');
    
    expect(db.collection).toHaveBeenCalledWith('roadmaps');
    expect(db.collection().doc).toHaveBeenCalledWith('Nonexistent');
    expect(db.collection().doc().get).toHaveBeenCalled();
    expect(db.collection().doc().update).not.toHaveBeenCalled();
  });

  test('debería eliminar un roadmap por nombre', async () => {
    // Mock de Firestore para eliminar
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true
        }),
        delete: jest.fn().mockResolvedValue({})
      })
    });

    const result = await Roadmap.deleteByName('Frontend Developer');
    
    expect(db.collection).toHaveBeenCalledWith('roadmaps');
    expect(db.collection().doc).toHaveBeenCalledWith('Frontend Developer');
    expect(db.collection().doc().get).toHaveBeenCalled();
    expect(db.collection().doc().delete).toHaveBeenCalled();
    expect(result).toHaveProperty('message', 'Roadmap deleted');
    expect(result).toHaveProperty('name', 'Frontend Developer');
  });

  test('debería fallar al eliminar si el roadmap no existe', async () => {
    // Mock de Firestore para simular que no existe el documento
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: false
        })
      })
    });

    await expect(Roadmap.deleteByName('Nonexistent')).rejects.toThrow('Roadmap not found');
    
    expect(db.collection).toHaveBeenCalledWith('roadmaps');
    expect(db.collection().doc).toHaveBeenCalledWith('Nonexistent');
    expect(db.collection().doc().get).toHaveBeenCalled();
    expect(db.collection().doc().delete).not.toHaveBeenCalled();
  });
});