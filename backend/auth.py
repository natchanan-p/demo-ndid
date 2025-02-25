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


KEY = 'secret'.ljust(32, '\0').encode('utf-8')  # Padding ให้ครบ 32 ไบต์
NONCE = 'sign'.ljust(12, '\0').encode('utf-8')  # Padding ให้ครบ 12 ไบต์
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ACCESS_TOKEN_EXPIRE_MINUTES = 30  
SECRET_KEY= 'a-string-secret-at-least-256-bits-long'
ALGORITHM = "HS256"

print(KEY)
print(NONCE)


fake_db = {
        "hashed_username": bcrypt.hashpw(b"test@gmail.com", bcrypt.gensalt()).decode('utf-8') , # เก็บค่า hash ของรหัสผ่าน
        "hashed_password": bcrypt.hashpw(b"P@ssw0rd", bcrypt.gensalt()).decode('utf-8')  # เก็บค่า hash ของรหัสผ่าน
}

class DecryptRequest(BaseModel):
    cipherU: str 
    tagU: str
    cipherP: str 
    tagP: str

def decrypt_aes_gcm(ciphertext: bytes, tag: bytes) -> str:
    try:
        #  cipher object
        cipher = Cipher(algorithms.AES(KEY), modes.GCM(NONCE, tag), backend=default_backend())
        decryptor = cipher.decryptor()


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

    to_encode = {"username": data}  
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})  


    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/sign-in")
async def decrypt(request: DecryptRequest):
    try:

        ciphertextU =  base64.b64decode(request.cipherU)
        tagU =  base64.b64decode(request.tagU)

        ciphertextP = base64.b64decode(request.cipherP)
        tagP = base64.b64decode(request.tagP)

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
            return {"errorCode": 200,"errorMsg": "success", "token": token, "username": "test@gmail.com"}
    except HTTPException as http_ex:
        raise http_ex  
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
