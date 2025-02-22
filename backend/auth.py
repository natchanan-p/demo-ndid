from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

import base64
import bcrypt

app = FastAPI()

# กำหนด KEY และ nonce
KEY = 'secret'.ljust(32, '\0').encode('utf-8')  # Padding ให้ครบ 32 ไบต์
NONCE = 'sign'.ljust(12, '\0').encode('utf-8')  # Padding ให้ครบ 12 ไบต์
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # กำหนดเวลาหมดอายุของ Token เป็น 30 นาที
SECRET_KEY= 'a-string-secret-at-least-256-bits-long'
ALGORITHM = "HS256"

print(KEY)
print(NONCE)

# ฐานข้อมูลจำลอง
fake_db = {
        "hashed_username": bcrypt.hashpw(b"test@gmail.com", bcrypt.gensalt()).decode('utf-8') , # เก็บค่า hash ของรหัสผ่าน
        "hashed_password": bcrypt.hashpw(b"P@ssw0rd", bcrypt.gensalt()).decode('utf-8')  # เก็บค่า hash ของรหัสผ่าน
}

class DecryptRequest(BaseModel):
    # username: str
    # ciphertext: str  # ข้อมูลที่ถูกเข้ารหัสในรูปแบบ Base64
    # tag: str         # tag ในรูปแบบ Base64
    cipherU: str
    tagU: str
    cipherP: str
    tagP: str

def decrypt_aes_gcm(ciphertext: bytes, tag: bytes) -> str:
    try:
        # สร้าง cipher object
        cipher = Cipher(algorithms.AES(KEY), modes.GCM(NONCE, tag), backend=default_backend())
        decryptor = cipher.decryptor()

        # ถอดรหัสข้อมูล
        decrypted_data = decryptor.update(ciphertext) + decryptor.finalize()
        return decrypted_data.decode('utf-8')
    except Exception as e:
        print(e)
        raise ValueError(f"decrypt fail: {str(e)}")

def verify_password(ciphertextP: str, tagP: str) -> bool:
    return bcrypt.checkpw(ciphertextP.encode('utf-8'), tagP.encode('utf-8'))

def verify_username(ciphertextU: str, tagU: str) -> bool:
    return bcrypt.checkpw(ciphertextU.encode('utf-8'), tagU.encode('utf-8'))

def create_access_token(data: str, expires_delta: timedelta = None):
    # สร้าง payload
    to_encode = {"username": data}  # เก็บข้อมูลที่ต้องการใน payload
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})  # เพิ่ม expiration time ใน payload

    # สร้าง JWT
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# def create_access_token(data: str, expires_delta: timedelta = None):
#     to_encode = {
#         "alg": "HS256",
#         "typ": "JWT"
#         } # สร้าง dictionary จากสตริง
#     if expires_delta:
#         expire = datetime.utcnow() + expires_delta
#     else:
#         expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#     to_encode.update({"exp": expire})
#     encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
#     return encoded_jwt

@app.post("/sign-in")
async def decrypt(request: DecryptRequest):
    try:
        print('sign-in')
        # แปลงข้อมูลจาก Base64 เป็น bytes
        ciphertextU =  base64.b64decode(request.cipherU)
        tagU =  base64.b64decode(request.tagU)

        ciphertextP = base64.b64decode(request.cipherP)
        tagP = base64.b64decode(request.tagP)

        # ถอดรหัส
        decrypted_data_username = decrypt_aes_gcm(ciphertextU, tagU)
        decrypted_data_password = decrypt_aes_gcm(ciphertextP, tagP)
        hashed_username = fake_db["hashed_username"]
        hashed_password = fake_db["hashed_password"]
        if not verify_password(decrypted_data_password, hashed_password):
            raise HTTPException(status_code=400, detail="password invalid")
        if not verify_username(decrypted_data_username, hashed_username):
            raise HTTPException(status_code=400, detail="username invalid")
        else:
            token = create_access_token("test@gmail.com")
            return {"message": "success", "token": token, "username": "test@gmail.com"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

# # ฟังก์ชันสำหรับถอดรหัส AES-GCM
# def decrypt_aes_gcm(encrypted_data: bytes, tag: bytes) -> str:
#     try:
#         # สร้าง cipher object
#         cipher = Cipher(algorithms.AES(KEY), modes.GCM(NONCE), backend=default_backend())
#         decryptor = cipher.decryptor()

#         # ถอดรหัสข้อมูล
#         decrypted_data = decryptor.update(encrypted_data) + decryptor.finalize_with_tag(tag)
#         return decrypted_data.decode('utf-8')
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=f"decrypt fail: {str(e)}")

# # โมเดลสำหรับรับข้อมูลจากผู้ใช้
# class DecryptRequest(BaseModel):
#     email: str          # อีเมลของผู้ใช้
#     encrypted_data: str  # ข้อมูลที่ถูกเข้ารหัสในรูปแบบ base64
#     tag: str              # tag ในรูปแบบ base64

# # สร้าง API endpoint
# @app.post("/verify-password")
# async def verify_password(request: DecryptRequest):
#     try:
#         # แปลงข้อมูลจาก base64 เป็น bytes
#         encrypted_data = base64.b64decode(request.encrypted_data)
#         tag = base64.b64decode(request.tag)

#         # ถอดรหัส
#         decrypted_password = decrypt_aes_gcm(encrypted_data, tag)

#         # ตรวจสอบอีเมลในฐานข้อมูล
#         if request.email not in fake_db:
#             raise HTTPException(status_code=404, detail="user no found")

#         # เปรียบเทียบรหัสผ่าน
#         hashed_password = fake_db[request.email]["hashed_password"]
#         if not bcrypt.checkpw(decrypted_password.encode('utf-8'), hashed_password.encode('utf-8')):
#             raise HTTPException(status_code=400, detail="invalid password")

#         return {"message": "success"}
#     except HTTPException as e:
#         raise e
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
