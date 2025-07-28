"""
Enhanced Authentication System
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.core.config import settings
from backend.database import get_db
import backend.models as models
import logging
import redis
from typing import Union

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Redis client for token blacklist (optional)
try:
    redis_client = redis.from_url(settings.REDIS_URL) if settings.REDIS_URL else None
except:
    redis_client = None
    logger.warning("Redis not available, using in-memory token storage")

# In-memory blacklist fallback
blacklisted_tokens = set()

class AuthManager:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def create_access_token(data: Dict[str, Any]) -> str:
        """Create access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({
            "exp": expire,
            "type": "access",
            "iat": datetime.utcnow()
        })
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    @staticmethod
    def create_refresh_token(data: Dict[str, Any]) -> str:
        """Create refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({
            "exp": expire,
            "type": "refresh",
            "iat": datetime.utcnow()
        })
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode token"""
        try:
            # Check if token is blacklisted
            if AuthManager.is_token_blacklisted(token):
                return None
            
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except JWTError as e:
            logger.error(f"Token verification failed: {str(e)}")
            return None
    
    @staticmethod
    def is_token_expired(token: str) -> bool:
        """Check if token is expired"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            exp = payload.get("exp")
            if exp:
                return datetime.utcfromtimestamp(exp) < datetime.utcnow()
        except JWTError:
            pass
        return True
    
    @staticmethod
    def blacklist_token(token: str):
        """Add token to blacklist"""
        try:
            if redis_client:
                # Use Redis with expiration
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                exp = payload.get("exp", 0)
                ttl = max(0, exp - int(datetime.utcnow().timestamp()))
                redis_client.setex(f"blacklist:{token}", ttl, "1")
            else:
                # Fallback to in-memory
                blacklisted_tokens.add(token)
        except Exception as e:
            logger.error(f"Error blacklisting token: {str(e)}")
    
    @staticmethod
    def is_token_blacklisted(token: str) -> bool:
        """Check if token is blacklisted"""
        try:
            if redis_client:
                return redis_client.exists(f"blacklist:{token}")
            else:
                return token in blacklisted_tokens
        except Exception as e:
            logger.error(f"Error checking blacklist: {str(e)}")
            return False
    
    @staticmethod
    def refresh_access_token(refresh_token: str) -> Optional[Dict[str, str]]:
        """Refresh access token using refresh token"""
        payload = AuthManager.verify_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            return None
        
        username = payload.get("sub")
        if not username:
            return None
        
        # Create new tokens
        new_access_token = AuthManager.create_access_token({"sub": username})
        new_refresh_token = AuthManager.create_refresh_token({"sub": username})
        
        # Blacklist old refresh token
        AuthManager.blacklist_token(refresh_token)
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = AuthManager.verify_token(token)
        if not payload:
            raise credentials_exception
        
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    
    # Check if user is active
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user

def get_current_active_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Get current active user"""
    if current_user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

def require_roles(allowed_roles: list):
    """Decorator to require specific roles"""
    def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker

# Role-specific dependencies
def get_admin_user(current_user: models.User = Depends(require_roles(["admin"]))):
    return current_user

def get_manager_user(current_user: models.User = Depends(require_roles(["manager"]))):
    return current_user

def get_teacher_user(current_user: models.User = Depends(require_roles(["teacher"]))):
    return current_user

def get_student_user(current_user: models.User = Depends(require_roles(["student"]))):
    return current_user

def get_admin_or_manager(current_user: models.User = Depends(require_roles(["admin", "manager"]))):
    return current_user
