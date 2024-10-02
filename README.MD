# Authsphere API
    Es una api para autentificación y gestión de usuarios, qué permite registrar, autentificar y ver listado de usuarios
## Requisitos

- Node.js
- PostgreSQL
- Express.js
- Json Web Token (JWT)

## Instalación

1. Clonar el repositorio.


    `git clone git@github.com:Franklin2193/authsphere.git`


2. Ejecutar `npm install` para instalar las dependencias.

3. Crear un archivo `.env` con las credenciales de la base de datos.

    DB_USER='tu_usuario'
    BD_HOST='localhost'
    DB_NAME='nombre_base_datos'
    DB_PASSWORD='tu_contraseña'
    DB_PORT='5432' // Este es el puerto por defecto para postgres, pero puede cambiar según tu versión de psql
    JWT_SECRET='secret_key'

4. Crear la base de datos `authsphere` y la tabla `users`.

    Para que la aplicación funciones correctamente, necesitas crear la base de datos y la tabla users de la siguiente manera:

    **Conectar a PostgresSQL**
    Abrir la termianl

    psql -U tu_usuario - localhost -p 5432

    Reemplazar `tu_usuario` el nombre de usuario PostgreSQL

    **Crear la base de datos**

    CREATE DATABASE authsphere;

    \c authsphere

    **Crear la tabla users**

    CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role INT NOT NULL
    );

5. Ejecutar `node server.js` para iniciar el servidor.

## Endpoints

- `POST /api/users/register`: Registra un nuevo usuario.
- `POST /api/users/login`: Inicia sesión y obtiene un token.
- `GET /api/users`: Obtiene la lista de usuarios (requiere autenticación).
- `GET /api/users/:id`: Obtiene los detalles de un usuario específico (requiere autenticación).

## Ejemplo de Uso

### Registro

```bash
curl -X POST http://localhost:3000/api/users/register -H "Content-Type: application/json" -d '{"username": "test", "password": "password"}'
```

    Si el nombre del usuario ya esta en uso saldra el siguiente mensaje:

    ```bash
    {"error":"El nombre de usuario ya está en uso"}
    ```

    Cuando la creación del usuario es exitosa saldra el siguiente mensaje:

    ```bash
    {"id":23,"username":"nuevoUsuario_readme","role":2}
    ```

Al momento de crear un usuario si no de expecifica el rol, siempre va ser role: 2, si se especifica como role: 1, el usuario va ser admin, de la siguiente manera

```bash
curl -X POST http://localhost:3000/api/users/register -H "Content-Type: application/json" -d '{"username": "test", "password": "password", "role": 1}'
```


### Iniciar session
```bash
curl -X POST http://localhost:3000/api/users/login -H "Content-Type: application/json" -d '{"username": "test", "password": "password"}'
```


Al iniciar sessión, usando usuario y contraseña correctos se obtiene un token JWT(Json Web Token), como en el siguiente ejemplo:
```bash
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwicm9sZSI6IjEiLCJleHBpcmF0aW9uIjoxNjEyMjA1OTU1fQ.MZs0jOG4S7hF8vTAW9UuyJgEa0ZyygHaMRSgWzE8pJg"
}
```

Cuando un usuario se registra o inicia sesión en la API Authsphere, el sistema genera y devuelve un token JWT. Este token contiene información codificada sobre el usuario, que incluye:

**Identificador de usuario (userId):** Un ID único para identificar al usuario.
**Rol de usuario (role):** El rol asignado al usuario de forma predeterminada es user, en la tabla users se emplea como integer role: 2, que determina sus permisos en el sistema.
**Fecha de expiración:** Un tiempo de expiración de 1 hora que indica cuándo el token ya no es válido.

### Obtener todos los usuarios
Solamente el `role: 1 o admin` puede obtener todos los usuarios:

```bash
curl -X GET http://localhost:3000/api/users \
-H "Authorization: Bearer tu_token_aqui"
```
El token que se obtuvo al momento de iniciar sessión se debe emplear para la authorization de la siguiente manera:

```Bash
curl -X GET http://localhost:3000/api/users \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjUsInJvbGUiOjEsImlhdCI6MTcyNzg0MDE3MiwiZXhwIjoxNzI3ODQzNzcyfQ.RIBxalUo0-37-0_7-Dx-d2HLU0qMiXU5IUgd35hDM4s"
```
Se obtendra la lista de users.

Si el token esta malo o expiró saldrá el siguiente mensaje:
```Bash
{"error":"Token inválido o expirado"}
```

Si el token no pertenece a un usuario role: 1 o admin saldrá el siguiente mensaje:
```Bash
{"error":"No tienes permiso para acceder a este recurso"}
```
Se implemento una páginación para saber la página actual, total de páginas y el total de usuarios, al momento de hacer la consulta de todos los users:

```Bash
"currentPage":1,"totalPages":2,"totalUsers":19
```


### Obtener la información por id
Se puede obtener la información de un usuario conociendo su id, el `role: 1` puede `ver todos` los usuarios, pero si el `role: 2` solo puede ver la información de su propio usuario. Se debe reemplazar `:id`por el id del usuario que se desea consultar.

Se debe emplear el token de authotization que se obtiene al iniciar session:

```Bash
curl -X GET http://localhost:3000/api/users/:id \
-H "Authorization: Bearer tu_token_aqui"
```
Si el usuario no existe saldrá el siguiente mensaje:
```Bash
{"error":"Usuario no encontrado"}
```

Si el usuario role: 2 trata de consultar un id diferente al propio saldrá el siguiente mensaje:
```Bash
{"error":"No tienes permiso para acceder a este recurso"}
```

Cuando se obtiene la información de forma correcta se va ver así:
```Bash
{"id":25,"username":"nuevoUsuario_readme_admin","role":1}
```
## Ejemplo
```Bash
curl -X GET http://localhost:3000/api/users/25 \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjUsInJvbGUiOjEsImlhdCI6MTcyNzg0MDE3MiwiZXhwIjoxNzI3ODQzNzcyfQ.RIBxalUo0-37-0_7-Dx-d2HLU0qMiXU5IUgd35hDM4s"

{"id":25,"username":"nuevoUsuario_readme_admin","role":1}
```

## Consumo de API por Postman

Esta api también se puede consumir por postman

Se debe tener corriendo el server `node server.js`

1. Registrar un usuario

    Metodo: POST
    URL: http://localhost:3000/api/users/register
    Body: raw
    Content-Type: application/json

    ```Bash
    {
    "username": "testuser",
    "password": "password"
    }
    ```
    En caso que de el usuario sea admin

      ```Bash
    {
    "username": "testuser",
    "password": "password",
    "role": 1
    }
    ```
2. Iniciar sesión

    Método POST
    URL: http://localhost:3000/api/users/login
    Body: raw
    content-Type: application/json
    ```Bash
    {
      "username": "testuser",
      "password": "password"
    }
    ```

    Si la solicitud de inicio de sessión es exitosa se recibe el token

    ```Bash
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

3. Obtener todos los usuarios (Requiere autentificación por token)

    Método: GET
    URL: http://localhost:3000/api/users
    Headers:
          Authorization: Bearer <token>

    Se obtiene la lista de todos los usuarios, pero solo los usuarios con el rol de administrador
    `role: 1`pueden acceder a este endpoint.

4.  Obtener usuario por ID (Requiere autentificación)

    Método: GET
    URL: http://localhost:3000/api/users/:id
    Headers:
          Authorization: Bearer <token>

    Se obtiene los detalles de un usuario especifico basado en su ID.Este endpoint esta protegido, por lo cual solo el usuario autentificado puede acceder, si es `role : 2` solo puede consultar su propio ID, si es `role: 1` puede consultar todos los ID.

5. Respuesta error

    Si se intenta acceder a un endpoint creando un usuario que ya existe el `status : 400`, la solicitud no se puede procesar.

    Si la creación del usuario es exitosa se recibe `status: 201`, que significa que la solicitud fue procesada correctamente y se ha creado el usuario en el servidor.

    Si al momento de iniciar sessión se ingresa mal las credenciales de `username` y `password` el `status: 401`, qué significa que no esta autorizado para ingresar o qué las credenciales son inválidas

    Si las credenciales se de inicio de sesión son válidas se recibe `status: 200`, significa que la solitud fue procesada de forma correcta y se obtiene el token.

    Si al momento que querer consultar la lista de user se obtiene un `status: 401`, el token esta inválido
