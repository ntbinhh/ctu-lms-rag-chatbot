"""
Base Service Class
"""
from typing import TypeVar, Generic, List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import desc, asc, func
from pydantic import BaseModel
from backend.core.response_handler import CustomHTTPException
from backend.core.config import settings
import logging

logger = logging.getLogger(__name__)

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: ModelType, db: Session):
        self.model = model
        self.db = db
    
    def get_by_id(self, id: int) -> Optional[ModelType]:
        """Get a single record by ID"""
        return self.db.query(self.model).filter(self.model.id == id).first()
    
    def get_all(
        self,
        skip: int = 0,
        limit: int = settings.DEFAULT_PAGE_SIZE,
        order_by: str = "id",
        order_direction: str = "asc"
    ) -> List[ModelType]:
        """Get all records with pagination"""
        query = self.db.query(self.model)
        
        # Apply ordering
        if hasattr(self.model, order_by):
            order_field = getattr(self.model, order_by)
            if order_direction.lower() == "desc":
                query = query.order_by(desc(order_field))
            else:
                query = query.order_by(asc(order_field))
        
        return query.offset(skip).limit(limit).all()
    
    def get_count(self, filters: Optional[Dict] = None) -> int:
        """Get total count of records"""
        query = self.db.query(func.count(self.model.id))
        
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field):
                    query = query.filter(getattr(self.model, field) == value)
        
        return query.scalar()
    
    def create(self, obj_in: CreateSchemaType, **kwargs) -> ModelType:
        """Create a new record"""
        try:
            # Convert Pydantic model to dict
            if isinstance(obj_in, BaseModel):
                obj_data = obj_in.model_dump()
            else:
                obj_data = obj_in
            
            # Add any additional kwargs
            obj_data.update(kwargs)
            
            # Create database object
            db_obj = self.model(**obj_data)
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            
            logger.info(f"Created {self.model.__name__} with id: {db_obj.id}")
            return db_obj
            
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Integrity error creating {self.model.__name__}: {str(e)}")
            raise CustomHTTPException(
                status_code=400,
                message="Data integrity violation",
                details=str(e)
            )
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating {self.model.__name__}: {str(e)}")
            raise CustomHTTPException(
                status_code=500,
                message="Internal server error",
                details=str(e)
            )
    
    def update(self, id: int, obj_in: UpdateSchemaType) -> Optional[ModelType]:
        """Update an existing record"""
        try:
            db_obj = self.get_by_id(id)
            if not db_obj:
                raise CustomHTTPException(
                    status_code=404,
                    message=f"{self.model.__name__} not found"
                )
            
            # Convert Pydantic model to dict
            if isinstance(obj_in, BaseModel):
                update_data = obj_in.model_dump(exclude_unset=True)
            else:
                update_data = obj_in
            
            # Update fields
            for field, value in update_data.items():
                if hasattr(db_obj, field):
                    setattr(db_obj, field, value)
            
            self.db.commit()
            self.db.refresh(db_obj)
            
            logger.info(f"Updated {self.model.__name__} with id: {id}")
            return db_obj
            
        except CustomHTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating {self.model.__name__}: {str(e)}")
            raise CustomHTTPException(
                status_code=500,
                message="Internal server error",
                details=str(e)
            )
    
    def delete(self, id: int) -> bool:
        """Delete a record"""
        try:
            db_obj = self.get_by_id(id)
            if not db_obj:
                raise CustomHTTPException(
                    status_code=404,
                    message=f"{self.model.__name__} not found"
                )
            
            self.db.delete(db_obj)
            self.db.commit()
            
            logger.info(f"Deleted {self.model.__name__} with id: {id}")
            return True
            
        except CustomHTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting {self.model.__name__}: {str(e)}")
            raise CustomHTTPException(
                status_code=500,
                message="Internal server error",
                details=str(e)
            )
    
    def search(
        self,
        search_term: str,
        search_fields: List[str],
        skip: int = 0,
        limit: int = settings.DEFAULT_PAGE_SIZE
    ) -> List[ModelType]:
        """Search records by multiple fields"""
        query = self.db.query(self.model)
        
        # Build search conditions
        conditions = []
        for field in search_fields:
            if hasattr(self.model, field):
                field_attr = getattr(self.model, field)
                conditions.append(field_attr.ilike(f"%{search_term}%"))
        
        if conditions:
            from sqlalchemy import or_
            query = query.filter(or_(*conditions))
        
        return query.offset(skip).limit(limit).all()
    
    def bulk_create(self, objects: List[CreateSchemaType]) -> List[ModelType]:
        """Create multiple records in bulk"""
        try:
            db_objects = []
            for obj_in in objects:
                if isinstance(obj_in, BaseModel):
                    obj_data = obj_in.model_dump()
                else:
                    obj_data = obj_in
                
                db_obj = self.model(**obj_data)
                db_objects.append(db_obj)
            
            self.db.bulk_save_objects(db_objects)
            self.db.commit()
            
            logger.info(f"Bulk created {len(db_objects)} {self.model.__name__} records")
            return db_objects
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error bulk creating {self.model.__name__}: {str(e)}")
            raise CustomHTTPException(
                status_code=500,
                message="Internal server error",
                details=str(e)
            )
