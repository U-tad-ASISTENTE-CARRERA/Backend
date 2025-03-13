# Proyecto GPS ACADEMICO - Backend - Node.js 

Este proyecto es una REST API construida con **Node.js - Express**. Utiliza **ORM** propia para interactuar con **Firebase Firestore**, una base de datos NoSQL.

## Estructura del Proyecto
El backend está diseñado con tres CRUD principales:

- **Users** (Usuarios) - Principal
- **Roadmaps** (Plan de estudios o rutas de aprendizaje)
- **Degrees** (Titulaciones o grados académicos)

### Tipos de Usuarios
1. Estudiantes
2. Profesores
3. Administradores

Cada usuario tiene distintos niveles de acceso y permisos dentro del sistema.

## Instalación y Ejecución
Para utilizar este backend, siga los siguientes pasos:

### 1. Clonar el Repositorio
```sh
git clone https://github.com/U-tad-ASISTENTE-CARRERA/Backend.git
cd backend
```

### 2. Instalar Dependencias

```sh
npm install
```

### 3. Configurar Variables de Entorno
Cree un archivo .env en la raíz del proyecto con el siguiente contenid:

```txt
PORT=3000
RESEND_API_KEY=tu_resend_api_key
RESEND_FROM_EMAIL=tu_email@dominio.com

JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=1d

LOG_LEVEL=info

FIREBASE_CREDENTIALS_JSON={"type":"service_account","project_id":"tu_project_id","private_key_id":"tu_private_key_id","private_key":"-----BEGIN PRIVATE KEY-----\\nTUS_CLAVES\\n-----END PRIVATE KEY-----\\n","client_email":"tu_email@tu_project.iam.gserviceaccount.com","client_id":"tu_client_id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/tu_email@tu_project.iam.gserviceaccount.com","universe_domain":"googleapis.com"}

SLACK_LOG=tu_url_webhook
```

### 4. Iniciar el Servidor

```sh
npm start
```

### 5. (opcional) Entorno de testing
Para ejecutar todos los tests **Jest** de la carpeta test/:

```sh
npm test
```

o, si necesita ver información detallada de cada test, puede ejecutar:

```sh
npm test -- --verbose
```










