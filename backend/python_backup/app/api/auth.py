from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, decode_token
from app.models.models import User, UserRole
from app.schemas.schemas import UserRegister, UserLogin, Token, UserOut, GoogleLoginRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login-form")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = decode_token(token)
        if payload is None:
            raise credentials_exception
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user is None:
            raise credentials_exception
        return user
    except HTTPException:
        raise
    except Exception:
        raise credentials_exception

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have administrative privileges"
        )
    return current_user

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        phone=user_in.phone,
        company_name=user_in.company_name,
        gstin=user_in.gstin,
        street_address=user_in.street_address,
        city=user_in.city,
        state=user_in.state,
        pincode=user_in.pincode,
        role=UserRole.CUSTOMER
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role.value)
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    role_val = user.role.value if hasattr(user.role, 'value') else str(user.role)
    token = create_access_token(subject=user.id, role=role_val)
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/google", response_model=Token)
def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    # Check if user already exists with this email
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Create a new user automatically for Google login
        full_name = payload.full_name or payload.email.split('@')[0].title()
        hashed_pwd = get_password_hash("google_auth_oauth_pass")
        user = User(
            email=payload.email,
            hashed_password=hashed_pwd,
            full_name=full_name,
            role=UserRole.CUSTOMER
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    token = create_access_token(subject=user.id, role=user.role.value)
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login-form", response_model=Token)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    token = create_access_token(subject=user.id, role=user.role.value)
    return {"access_token": token, "token_type": "bearer", "user": user}

from app.schemas.schemas import UserRegister, UserLogin, Token, UserOut, GoogleLoginRequest, UserUpdate

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.phone is not None:
        current_user.phone = user_in.phone
    if user_in.company_name is not None:
        current_user.company_name = user_in.company_name
    if user_in.gstin is not None:
        current_user.gstin = user_in.gstin
    if user_in.street_address is not None:
        current_user.street_address = user_in.street_address
    if user_in.city is not None:
        current_user.city = user_in.city
    if user_in.state is not None:
        current_user.state = user_in.state
    if user_in.pincode is not None:
        current_user.pincode = user_in.pincode

    db.commit()
    db.refresh(current_user)
    return current_user
