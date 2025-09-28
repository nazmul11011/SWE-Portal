import psycopg2

# Direct DB URL
DB_URL = ""

# Connect to new DB
conn = psycopg2.connect(DB_URL)
cursor = conn.cursor()

def update_student_cgpa_and_credits():
    # Update CGPA and creditCompleted (your existing logic)
    cursor.execute("""
        SELECT u.id, u."regNo"
        FROM "User" u
        WHERE u."regNo" LIKE '2023831%'
    """)
    students = cursor.fetchall()

    for user_id, reg_no in students:
        cursor.execute("""
            SELECT c.credit, CAST(e.grade AS FLOAT)
            FROM "Enrollment" e
            JOIN "Course" c ON e."courseId" = c.id
            WHERE e."userId" = %s AND e.grade IS NOT NULL
        """, (user_id,))
        records = cursor.fetchall()
        if not records:
            continue

        filtered_records = [(credit, grade) for credit, grade in records if grade and grade != 0]
        if not filtered_records:
            continue

        total_credits = sum(float(credit) for credit, _ in filtered_records)
        weighted_sum = sum(float(credit) * float(grade) for credit, grade in filtered_records)
        if total_credits == 0:
            continue

        cgpa = round(weighted_sum / total_credits, 2)

        # Insert or update Student
        cursor.execute('SELECT 1 FROM "Student" WHERE "userId" = %s', (user_id,))
        exists = cursor.fetchone()
        if exists:
            cursor.execute("""
                UPDATE "Student"
                SET cgpa = %s, "creditCompleted" = %s
                WHERE "userId" = %s
            """, (cgpa, int(total_credits), user_id))
        else:
            cursor.execute("""
                INSERT INTO "Student" ("userId", cgpa, "creditCompleted")
                VALUES (%s, %s, %s)
            """, (user_id, cgpa, int(total_credits)))

    conn.commit()

def update_student_positions():
    # 1. Get all students in session 2023-2024 with CGPA
    cursor.execute("""
        SELECT s.id, s.cgpa
        FROM "Student" s
        JOIN "User" u ON s."userId" = u.id
        WHERE u.session = '2023-2024'
        ORDER BY s.cgpa DESC, s."creditCompleted" DESC
    """)
    students = cursor.fetchall()

    # 2. Assign positions (handle ties)
    position = 0
    last_cgpa = None
    same_rank_count = 0

    for idx, (student_id, cgpa) in enumerate(students, start=1):
        if cgpa == last_cgpa:
            same_rank_count += 1
        else:
            position = idx
            same_rank_count = 1
        last_cgpa = cgpa

        # Update position in Student table
        cursor.execute("""
            UPDATE "Student"
            SET position = %s
            WHERE id = %s
        """, (position, student_id))
        print(f"Updated Student ID {student_id} -> Position {position}")

    conn.commit()

# Run updates
update_student_cgpa_and_credits()
update_student_positions()

cursor.close()
conn.close()