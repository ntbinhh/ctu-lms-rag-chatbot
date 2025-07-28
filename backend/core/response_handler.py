"""
Enhanced API Response Handler
"""
from typing import Any, Optional, Dict, List
from fastapi.responses import JSONResponse
from fastapi import status, HTTPException
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

class PaginationInfo(BaseModel):
    page: int
    size: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool

class APIResponse(BaseModel):
    success: bool = True
    message: str = "Success"
    data: Optional[Any] = None
    errors: Optional[Dict[str, Any]] = None
    pagination: Optional[PaginationInfo] = None
    timestamp: Optional[str] = None

class ResponseHandler:
    @staticmethod
    def success(
        data: Any = None,
        message: str = "Operation successful",
        pagination: Optional[PaginationInfo] = None,
        status_code: int = status.HTTP_200_OK
    ) -> JSONResponse:
        """Return success response"""
        from datetime import datetime
        
        response = APIResponse(
            success=True,
            message=message,
            data=data,
            pagination=pagination,
            timestamp=datetime.now().isoformat()
        )
        
        return JSONResponse(
            status_code=status_code,
            content=response.model_dump(exclude_none=True)
        )
    
    @staticmethod
    def error(
        message: str = "Operation failed",
        errors: Optional[Dict] = None,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        data: Any = None
    ) -> JSONResponse:
        """Return error response"""
        from datetime import datetime
        
        response = APIResponse(
            success=False,
            message=message,
            errors=errors,
            data=data,
            timestamp=datetime.now().isoformat()
        )
        
        logger.error(f"API Error: {message} - Status: {status_code}")
        
        return JSONResponse(
            status_code=status_code,
            content=response.model_dump(exclude_none=True)
        )
    
    @staticmethod
    def not_found(message: str = "Resource not found") -> JSONResponse:
        """Return 404 not found response"""
        return ResponseHandler.error(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    @staticmethod
    def unauthorized(message: str = "Unauthorized access") -> JSONResponse:
        """Return 401 unauthorized response"""
        return ResponseHandler.error(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED
        )
    
    @staticmethod
    def forbidden(message: str = "Access forbidden") -> JSONResponse:
        """Return 403 forbidden response"""
        return ResponseHandler.error(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN
        )
    
    @staticmethod
    def validation_error(errors: Dict[str, Any]) -> JSONResponse:
        """Return validation error response"""
        return ResponseHandler.error(
            message="Validation failed",
            errors=errors,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )
    
    @staticmethod
    def created(data: Any = None, message: str = "Resource created successfully") -> JSONResponse:
        """Return 201 created response"""
        return ResponseHandler.success(
            data=data,
            message=message,
            status_code=status.HTTP_201_CREATED
        )
    
    @staticmethod
    def no_content(message: str = "Operation completed successfully") -> JSONResponse:
        """Return 204 no content response"""
        return JSONResponse(
            status_code=status.HTTP_204_NO_CONTENT,
            content=None
        )

class CustomHTTPException(HTTPException):
    """Custom HTTP Exception with enhanced error details"""
    def __init__(
        self,
        status_code: int,
        message: str,
        errors: Optional[Dict] = None,
        details: Optional[str] = None
    ):
        self.message = message
        self.errors = errors
        self.details = details
        super().__init__(status_code=status_code, detail=message)
