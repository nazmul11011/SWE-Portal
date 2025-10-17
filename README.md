# Student Portal | Department of Software Engineering - SUST

A centralized **Department Portal** for students of the **Department of Software Engineering**, **Shahjalal University of Science and Technology (SUST)**.  
This system allows students to view their academic information, course progress, grades, and departmental announcements in one unified interface.

## Features

- 🔐 **Secure Authentication** using NextAuth (Username/Password based)
- 🧑‍🎓 **Student Dashboard** for managing personal and academic information
- 🧾 **Course Enrollment and Grade Management** (including CSV upload)
- 🧠 **Skill and Profile Management** (GitHub, LinkedIn, Codeforces integration)
- 🧑‍💼 **Role-Based Access Control**
  - **Admin:** Full access to manage users, roles, and data
  - **Moderator:** Limited administrative privileges for academic data review and upload
  - **Collector:** Limited privileges for user data review and upload
  - **Student:** Personal dashboard access only
- 📤 **CSV Upload Functionality** for bulk student enrollment, marks and grade updates
- 🧾 **Activity Logging** — Tracks login sessions and device information
- ☁️ **Database Integration** with PostgreSQL using Prisma ORM
- 🧩 **Modern UI** built with Next.js 15, TypeScript, and Tailwind CSS
- ⚙️ **Deployed on Render** for production-grade hosting

## Tech Stack

| Category | Technology |
|-----------|-------------|
| **Frontend** | Next.js 15 (App Router), React, Tailwind CSS, TypeScript |
| **Backend** | Next.js Server Actions, Supabase Edge function,  Prisma ORM |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | NextAuth.js |
| **Hosting** | Render |
| **Version Control** | Git + GitHub |

## Screenshots

| Dashboard View | Search Page | Results Page |
|----------------|-------------|-----------|
| ![Dashboard Screenshot](https://i.postimg.cc/sfTV9L23/Screenshot-2025-10-16-224944.png) | ![Search Screenshot](https://i.postimg.cc/bYmzH5vj/Screenshot-2025-10-16-225040.png) | ![Result Screenshot](https://i.postimg.cc/tRBXtcgq/Screenshot-2025-10-16-225224.png) |


## Installation and Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/nazmul11011/SWE-Portal.git
cd SWE-Portal
```
### 2️⃣ Install Dependencies
```bash
npm install
```
### 3️⃣ Environment Variables

Create a .env.local file in the project root and add:

```bash
DATABASE_URL=""
NEXTAUTH_URL=""
NEXTAUTH_SECRET=""
CLOUDINARY_UPLOAD_PRESET=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
SMTP_USER=""
SMTP_PASS=""
SUPABASE_SERVICE_ROLE_KEY=""
SUPABASE_URL=""
```
> Keep these credentials private and never commit them to GitHub.

### 4️⃣ Prisma Database Setup
```bash
npx prisma db push
npx prisma generate
```
### 5️⃣ Run Development Server
```bash
npm run dev
```
## Access Levels

| Role | Description | Permissions |
|-----------|-------------|--------|
| **Admin** | Department authority or system maintainer | Full CRUD access on users, courses, enrollments, and grades |
| **Moderator** | Teacher or authorized staff | Can upload CSV, view results, and edit limited data |
| **Collector** | Class Representative | Can view/edit profile social link and image |
| **Student** | Department student | Can view profile, grades, and course data only |

## CSV Upload Functionality

Admins and Moderators can upload `.csv` files to:

- Enroll multiple students in a course

- Update grades in bulk

- Manage course-wise academic records efficiently

> The system automatically validates data integrity and prevents duplication using `upsert` operations.


## Project Structure
```pgsql
📦 student-dashboard
├── app/
│   ├── (routes)/
│   ├── actions.ts          # Server-side actions (e.g., position update)
│   ├── layout.tsx
│   ├── page.tsx
│
├── prisma/
│   ├── schema.prisma       # Database models
│
├── lib/
│   ├── db.ts               # PostgreSQL connection
│   ├── auth.ts
│   ├── roles.ts
│   ├── skills.ts
│   ├── utils.ts
│
├── public/
│   ├── favicon.ico
│
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── student/            # Student dashboard components
│   ├── auth/               # Login page components
│   ├── courses/            # Course data page components
│
├── .env.local
├── middleware              # Role access maintain
├── package.json
└── README.md
```
## Developer Notes

- Use Prisma Studio to inspect and manage database data:
```bash
npx prisma studio
```
- For production, ensure you have configured environment variables in Render settings.