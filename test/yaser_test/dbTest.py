# import mysql.connector

# try:
#     db = mysql.connector.connect(
#         host="localhost",
#         port=3306,  # ← مهم للتأكد أنك تستخدم XAMPP
#         user="root",
#         password="",  # ← فاضي، إذا ما حطيت باسورد
#         database="userdb"
#     )
#     print("✅ الاتصال ناجح بقاعدة البيانات!")
# except mysql.connector.Error as err:
#     print("❌ فشل الاتصال:", err)
# finally:
#     if 'db' in locals() and db.is_connected():
#         db.close()


# k = {1: "python"}

# for i in k:
#     print(i, k[i])



# import random

# pc_num = random.randint(1,10)

# while True:
#     user_input = int(input("ges the number (1, 10): "))
#     if user_input == pc_num:
#         print("you win!")
#         break

#     elif user_input < pc_num:
#         print("choose larg number")
#     elif user_input > pc_num:
#         print("choose less num")