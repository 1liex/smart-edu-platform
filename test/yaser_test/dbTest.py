import mysql.connector

try:
    db = mysql.connector.connect(
        host="localhost",
        port=3306,  # ← مهم للتأكد أنك تستخدم XAMPP
        user="root",
        password="",  # ← فاضي، إذا ما حطيت باسورد
        database="userdb"
    )
    print("✅ الاتصال ناجح بقاعدة البيانات!")
except mysql.connector.Error as err:
    print("❌ فشل الاتصال:", err)
finally:
    if 'db' in locals() and db.is_connected():
        db.close()
