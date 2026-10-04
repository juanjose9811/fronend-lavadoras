# 🧺 Sistema Web y Móvil para Tienda de Lavadoras

Proyecto de desarrollo de software completo (Backend, Frontend Web y App Móvil) para la gestión, catálogo y pedido de lavadoras. Desarrollado como parte del programa de formación **Análisis y Desarrollo de Software (ADSO)** del **SENA**.

---

## 👥 Roles del Sistema
- **Administrador (`ROLE_ADMIN`):** Gestión completa (CRUD) de inventario de lavadoras, visualización y control de todos los pedidos.
- **Cliente (`ROLE_CLIENTE`):** Registro, inicio de sesión, exploración de catálogo, realización de pedidos y seguimiento de compras.

---

## 🚀 Tecnologías Utilizadas

### ⚙️ Backend (API REST)
- **Lenguaje / Framework:** Java 17 & Spring Boot 3
- **Seguridad:** Spring Security con Tokens JWT
- **Persistencia de Datos:** Spring Data JPA / Hibernate
- **Pruebas Unitarias:** JUnit 5 & Mockito

### 🗄️ Base de Datos
- **SGBD:** MySQL (XAMPP)

### 💻 Frontend Web
- **Librería / Tooling:** React.js con Vite
- **Peticiones HTTP:** Fetch API / Axios
- **Estilos:** CSS3 / Flexbox & Grid

### 📱 Aplicación Móvil
- **Framework:** Flutter / Dart
- **Linter / Estilos:** Material Design 3

---

## 🛠️ Instrucciones de Despliegue Local

### 1. Base de Datos (XAMPP)
1. Abrir **XAMPP Control Panel** e iniciar **Apache** y **MySQL**.
2. Ir a phpMyAdmin (`http://localhost/phpmyadmin`).
3. Crear una base de datos nombrada `tienda_lavadoras`.

### 2. Backend (Spring Boot)
1. Abrir el proyecto `backend` en el IDE.
2. Verificar la base de datos en `application.properties`.
3. Ejecutar en consola:
   ```bash
   ./mvnw spring-boot:run