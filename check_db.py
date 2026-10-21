import sqlite3
con = sqlite3.connect('dormfinder.db')
con.row_factory = sqlite3.Row

print("=== BOOKINGS ===")
rows = con.execute("""
    SELECT b.booking_id, b.student_id, b.dorm_id, b.notes, b.status,
           b.move_in_date, b.created_at, b.total_price,
           d.name as dorm_name,
           u.first_name || ' ' || u.last_name as student_name
    FROM bookings b
    JOIN dorms d ON d.dorm_id = b.dorm_id
    JOIN users u ON u.user_id = b.student_id
    ORDER BY b.created_at DESC
""").fetchall()
for r in rows:
    print(f"  id={r['booking_id']} student={r['student_name']} dorm={r['dorm_name']} move_in={r['move_in_date']} status={r['status']} notes={r['notes']}")

print("\n=== MESSAGES ===")
rows = con.execute("""
    SELECT m.message_id, m.sender_id, m.receiver_id, m.dorm_id,
           m.body, m.is_read, m.sent_at,
           s.first_name || ' ' || s.last_name as sender_name,
           r.first_name || ' ' || r.last_name as receiver_name,
           d.name as dorm_name
    FROM messages m
    JOIN users s ON s.user_id = m.sender_id
    JOIN users r ON r.user_id = m.receiver_id
    LEFT JOIN dorms d ON d.dorm_id = m.dorm_id
    ORDER BY m.sent_at DESC
""").fetchall()
for r in rows:
    print(f"  id={r['message_id']} from={r['sender_name']} to={r['receiver_name']} dorm={r['dorm_name']} read={r['is_read']} body={r['body'][:60]}")

con.close()
