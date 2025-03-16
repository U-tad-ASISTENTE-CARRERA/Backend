// tests/student/user-model-student.test.js
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

describe('Modelo User (funcionalidades Estudiante)', () => {
  // Datos de prueba
  const mockStudent = {
    id: 'student-id',
    email: 'student@live.u-tad.com',
    password: 'hashedPassword',
    role: 'STUDENT',
    seedWord: 'test-seed',
    metadata: {
      firstName: 'Test',
      lastName: 'Student',
      degree: 'INSO_DATA',
      specialization: 'Frontend Developer',
      skills: ['HTML', 'CSS'],
      teacherList: ['teacher-id']
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería crear un nuevo estudiante', () => {
    const student = new User(
      mockStudent.email,
      mockStudent.password,
      mockStudent.seedWord,
      'STUDENT',
      mockStudent.metadata
    );
    
    expect(student).toBeInstanceOf(User);
    expect(student.email).toBe(mockStudent.email);
    expect(student.role).toBe('STUDENT');
    expect(student.metadata).toHaveProperty('degree', 'INSO_DATA');
    expect(student.metadata).toHaveProperty('skills');
    expect(student.createdAt).toBeDefined();
    expect(student.updatedAt).toBeDefined();
  });

  test('debería guardar un nuevo estudiante en Firestore', async () => {
    // Mock de Firestore para set
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue({}),
        id: 'student-id'
      })
    });

    const student = new User(
      mockStudent.email,
      mockStudent.password,
      mockStudent.seedWord,
      'STUDENT',
      mockStudent.metadata
    );
    
    const result = await student.save();
    
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection().doc).toHaveBeenCalled();
    expect(db.collection().doc().set).toHaveBeenCalledWith(expect.objectContaining({ 
      id: 'student-id',
      email: mockStudent.email,
      role: 'STUDENT'
    }));
    expect(result).toHaveProperty('id', 'student-id');
    expect(result).toHaveProperty('role', 'STUDENT');
  });

  test('debería actualizar metadatos del estudiante', async () => {
    // Datos para actualizar
    const updateData = {
      'metadata.firstName': 'Updated',
      'metadata.lastName': 'Student',
      'metadata.specialization': 'Data Science', // Cambio de especialización
      updatedAt: new Date().toISOString()
    };

    // Mock de Firestore para update
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        update: jest.fn().mockResolvedValue({})
      })
    });

    const result = await User.update('student-id', updateData);
    
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection().doc).toHaveBeenCalledWith('student-id');
    expect(db.collection().doc().update).toHaveBeenCalledWith(updateData);
    expect(result).toHaveProperty('id', 'student-id');
    // Los metadatos actualizados deberían estar en el resultado
    expect(result).toHaveProperty('metadata.firstName', 'Updated');
    expect(result).toHaveProperty('metadata.specialization', 'Data Science');
  });

  test('debería actualizar el historial académico del estudiante', async () => {
    // Mock para encontrar un estudiante por ID
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
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
          })
        }),
        update: jest.fn().mockResolvedValue({})
      })
    });

    // Datos para actualizar
    const updatedSubjects = [
      { name: 'Fundamentos de Desarrollo Web', credits: 6, skills: ['HTML', 'CSS'], grade: 8.5 },
      { name: 'Introducción a la Programación I', credits: 6, skills: ['C'], grade: 7.5 }
    ];

    // Operación directa sobre el estudiante
    const student = await User.findById('student-id');
    
    // Update del historial académico
    student.metadata.AH.subjects = updatedSubjects;
    student.metadata.AH.averageGrade = 8.0;
    student.metadata.AH.lastUpdatedAt = new Date().toISOString();
    
    // Actualizar en la base de datos
    const metadataUpdates = {
      'metadata.AH': student.metadata.AH,
      updatedAt: new Date().toISOString()
    };
    
    await User.update('student-id', metadataUpdates);
    
    expect(db.collection().doc().update).toHaveBeenCalledWith(expect.objectContaining({
      'metadata.AH': expect.any(Object),
      updatedAt: expect.any(String)
    }));
    expect(student.metadata.AH.subjects[0].grade).toBe(8.5);
    expect(student.metadata.AH.subjects[1].grade).toBe(7.5);
    expect(student.metadata.AH.averageGrade).toBe(8.0);
  });

  test('debería actualizar el roadmap del estudiante', async () => {
    // Mock para encontrar un estudiante por ID
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
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
          })
        }),
        update: jest.fn().mockResolvedValue({})
      })
    });

    // Simular actualización de un tema del roadmap
    const student = await User.findById('student-id');
    
    // Cambiar el estado de un tema
    student.metadata.roadmap.body.fundamentos['HTML y CSS'].status = 'done';
    
    // Si el tema tiene una habilidad y está completado, añadirla a las habilidades
    if (student.metadata.roadmap.body.fundamentos['HTML y CSS'].skill && 
        student.metadata.roadmap.body.fundamentos['HTML y CSS'].status === 'done') {
      if (!student.metadata.skills) {
        student.metadata.skills = [];
      }
      student.metadata.skills.push(student.metadata.roadmap.body.fundamentos['HTML y CSS'].skill);
    }
    
    // Actualizar en la base de datos
    const metadataUpdates = {
      'metadata.roadmap.body': student.metadata.roadmap.body,
      'metadata.skills': student.metadata.skills,
      'metadata.roadmap.lastUpdatedAt': new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await User.update('student-id', metadataUpdates);
    
    expect(db.collection().doc().update).toHaveBeenCalledWith(expect.objectContaining({
      'metadata.roadmap.body': expect.any(Object),
      'metadata.skills': expect.any(Array),
      'metadata.roadmap.lastUpdatedAt': expect.any(String),
      updatedAt: expect.any(String)
    }));
    expect(student.metadata.roadmap.body.fundamentos['HTML y CSS'].status).toBe('done');
    expect(student.metadata.skills).toContain('HTML');
  });

  test('debería añadir un profesor a la lista del estudiante', async () => {
    // Mock para encontrar un estudiante por ID
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            id: 'student-id',
            email: 'student@live.u-tad.com',
            role: 'STUDENT',
            metadata: {
              teacherList: ['teacher-id-1']
            }
          })
        }),
        update: jest.fn().mockResolvedValue({})
      })
    });

    // Operación directa sobre el estudiante
    const student = await User.findById('student-id');
    
    // Añadir un nuevo profesor a la lista
    const newTeacherId = 'teacher-id-2';
    const teacherList = student.metadata.teacherList || [];
    teacherList.push(newTeacherId);
    
    // Actualizar en la base de datos
    await User.update('student-id', { 
      'metadata.teacherList': teacherList,
      updatedAt: new Date().toISOString()
    });
    
    expect(db.collection().doc().update).toHaveBeenCalledWith(expect.objectContaining({
      'metadata.teacherList': expect.arrayContaining(['teacher-id-1', 'teacher-id-2']),
      updatedAt: expect.any(String)
    }));
    expect(teacherList).toContain('teacher-id-1');
    expect(teacherList).toContain('teacher-id-2');
  });

  test('debería añadir habilidades al estudiante', async () => {
    // Mock para encontrar un estudiante por ID
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            id: 'student-id',
            email: 'student@live.u-tad.com',
            role: 'STUDENT',
            metadata: {
              skills: ['HTML', 'CSS']
            }
          })
        }),
        update: jest.fn().mockResolvedValue({})
      })
    });

    // Operación directa sobre el estudiante
    const student = await User.findById('student-id');
    
    // Añadir nuevas habilidades
    const newSkills = [{ skill: 'JavaScript' }, { skill: 'React' }];
    const existingSkills = student.metadata.skills || [];
    
    // Convertir las nuevas habilidades al formato de las existentes si es necesario
    const formattedNewSkills = newSkills.map(s => s.skill || s);
    
    // Combinar las habilidades (eliminando duplicados)
    const combinedSkills = [...new Set([...existingSkills, ...formattedNewSkills])];
    
    // Actualizar en la base de datos
    await User.update('student-id', { 
      'metadata.skills': combinedSkills,
      updatedAt: new Date().toISOString()
    });
    
    expect(db.collection().doc().update).toHaveBeenCalledWith(expect.objectContaining({
      'metadata.skills': expect.arrayContaining(['HTML', 'CSS', 'JavaScript', 'React']),
      updatedAt: expect.any(String)
    }));
    expect(combinedSkills).toContain('HTML');
    expect(combinedSkills).toContain('CSS');
    expect(combinedSkills).toContain('JavaScript');
    expect(combinedSkills).toContain('React');
  });

  test('debería añadir certificaciones al estudiante', async () => {
    // Mock para encontrar un estudiante por ID
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            id: 'student-id',
            email: 'student@live.u-tad.com',
            role: 'STUDENT',
            metadata: {
              certifications: [
                { name: 'Certificación Existente', date: '2023-01-01', institution: 'Test' }
              ]
            }
          })
        }),
        update: jest.fn().mockResolvedValue({})
      })
    });

    // Operación directa sobre el estudiante
    const student = await User.findById('student-id');
    
    // Añadir nuevas certificaciones
    const newCertifications = [
      { name: 'AWS Certified Developer', date: '2024-01-15', institution: 'Amazon' }
    ];
    const existingCertifications = student.metadata.certifications || [];
    
    // Combinar las certificaciones
    const combinedCertifications = [...existingCertifications, ...newCertifications];
    
    // Actualizar en la base de datos
    await User.update('student-id', { 
      'metadata.certifications': combinedCertifications,
      updatedAt: new Date().toISOString()
    });
    
    expect(db.collection().doc().update).toHaveBeenCalledWith(expect.objectContaining({
      'metadata.certifications': expect.arrayContaining([
        expect.objectContaining({ name: 'Certificación Existente' }),
        expect.objectContaining({ name: 'AWS Certified Developer' })
      ]),
      updatedAt: expect.any(String)
    }));
    expect(combinedCertifications).toHaveLength(2);
    expect(combinedCertifications[1].name).toBe('AWS Certified Developer');
    expect(combinedCertifications[1].institution).toBe('Amazon');
  });

  test('debería eliminar metadatos del estudiante', async () => {
    // Mock para simular admin.firestore.FieldValue.delete()
    const admin = require('firebase-admin');
    admin.firestore.FieldValue = {
      delete: jest.fn().mockReturnValue('field-deleted')
    };
    
    // Mock para encontrar un estudiante por ID
    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            id: 'student-id',
            email: 'student@live.u-tad.com',
            role: 'STUDENT',
            metadata: {
              workExperience: [
                { 
                  jobType: 'Intern', 
                  startDate: '2023-06-01', 
                  endDate: '2023-12-31', 
                  company: 'Test', 
                  description: 'Test', 
                  responsibilities: 'Test' 
                }
              ]
            },
            updateHistory: []
          })
        }),
        update: jest.fn().mockResolvedValue({})
      })
    });

    // Eliminar campo de metadatos
    const metadataDeletes = {
      'metadata.workExperience': admin.firestore.FieldValue.delete(),
      'metadata.updatedAt': new Date().toISOString(),
      updateHistory: []
    };
    
    await User.update('student-id', metadataDeletes);
    
    expect(db.collection().doc().update).toHaveBeenCalledWith(expect.objectContaining({
      'metadata.workExperience': 'field-deleted',
      'metadata.updatedAt': expect.any(String),
      updateHistory: []
    }));
  });
});