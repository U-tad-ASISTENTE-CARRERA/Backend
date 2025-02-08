/* METADATA STUDENT
  nombre (string)
  apellido (string)
  fecha de nacimiento (date)
  dni (string)
  titulación (string)
  especializacion (string)
  institución (string)
  fecha de fin (date)

  idiomas (lista objeto)
    idioma (string)
    nivel enum(bajo,alto,medio)

  lenguajes de programación (lista objeto)
    lenguaje (string)
    nivel enum(bajo,alto,medio)

  historial académico (lista objetos)
    asignatura (objeto)
      nombre (string)
      nota float(0.0 al 10.0)
      label (string)
      creditos (integer)
      fecha de actualización (date)

  hitos (lista objetos)
    hito (objeto)
      id_Hito (string)
      fecha de desbloqueo (date)
  
  certificaciones (lista objetos)
    certificacion (objeto)
      nombre (string)
      fecha (date)
      institución (string)

  experiencia laboral (lista de objetos)
    experiencia (objeto)
      tipo de trabajo (string)
      fecha de inicio (date)
      fecha de fin (date)
      empresa (string)
      descripcion (string)
      responsabilidades (string)

  RoadMaps (historial) (lista de objetos)
    roadmap (objeto)
      id_roadmap

  fecha de actualización (date)
*/

/* METADATA TEACHER
  nombre (string)
  apellido (string)
  fecha de nacimiento (date)
  dni (string)
  titulación (string)
  especializacion (string)
  institución (string)
  fecha de fin (date)
*/

/*
titulacion
  plan estudios
    asignatura
      creditos
      nombre
      label
      curso
*/

/*
  certificaciones (lista objetos)
    certificacion (objeto)
      nombre (string)
      fecha (date)
      institución (string)
*/

/*
Empresas
  nombre
  label
  link
*/

hitos 
  hito (objeto)
    id 
    nombre (string)
    img (string)
    label (string)
    descripcion (string)

/*
Roadmaps
  id
  hitos lista de objetos
  fecha creación
*/