# Soccer Store – Spring Boot

![Maven Central](https://img.shields.io/maven-central/v/com.example/soccerstore?label=Maven%20Central) ![Java Version](https://img.shields.io/badge/Java-17-blue) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1.0-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

> **Soccer Store** is a Spring Boot–based backend application that powers a simple e-commerce platform for soccer merchandise (jerseys, balls, accessories, etc.). It exposes RESTful endpoints for products, categories, users, carts, and orders, backed by a MySQL database.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Clone & Build](#clone--build)  
  - [Configuration](#configuration)  
  - [Run the Application](#run-the-application)  
- [API Endpoints](#api-endpoints)  
  - [Authentication & Authorization](#authentication--authorization)  
  - [Product Management](#product-management)  
  - [Category Management](#category-management)  
  - [Shopping Cart](#shopping-cart)  
  - [Order Processing](#order-processing)  
  - [User Management](#user-management)  
- [Database Schema](#database-schema)  
- [Project Structure](#project-structure)  
- [Testing](#testing)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)  

---

## Features

- **RESTful API** for all e-commerce operations  
- **CRUD** for Products & Categories  
- **User Registration & Authentication** (JWT-based)  
- **Shopping Cart**: add/remove items, view current cart  
- **Order Management**: place orders, view order history, update order status  
- **Role-based Access Control**: `ROLE_USER` vs `ROLE_ADMIN`  
- **Input Validation** & Error Handling  
- **API Documentation** via Swagger UI  
- **Persistence** using Spring Data JPA (Hibernate + MySQL)  

---

## Tech Stack

- **Language:** Java 17  
- **Framework:** Spring Boot 3.1.x  
  - Spring Web (REST controllers)  
  - Spring Data JPA (Hibernate)  
  - Spring Security (JWT auth)  
  - Spring Validation (JSR-380)  
  - Springdoc OpenAPI (Swagger)  
- **Build Tool:** Maven 3.8+  
- **Database:** MySQL (or MariaDB)  
- **Libraries & Utilities:**  
  - Lombok (boilerplate reduction)  
  - MapStruct (DTO ↔ Entity mapping)  
  - Flyway (DB migrations)  
  - ModelMapper (optional mapping)  
- **Testing:** JUnit 5, Spring Boot Test, Mockito  

---

## Getting Started

### Prerequisites

- **Java 17 JDK** installed & `JAVA_HOME` set  
- **Maven 3.8+** installed  
- **MySQL 8.x** (or compatible) running locally (default port `3306`)  
- (Optional) **Docker & Docker Compose** if you prefer containerized MySQL  

---

### Clone & Build

```bash
git clone https://github.com/tuananh2005889/SoccerStore_SpringBoot.git
cd Backend
./gradlew BootRun

cd FrontEnd
npm install
npm run dev
