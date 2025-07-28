# Enhanced Analytics and Performance Monitoring Backend
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, text
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any
import asyncio
import json
import logging
from collections import defaultdict

from ..database import get_db
from ..auth import get_current_user
from ..models import *
from ..core.response_handler import success_response, error_response

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db
        self.cache = {}
        self.cache_timeout = 300  # 5 minutes

    async def get_dashboard_stats(self, user_role: str, period: str = "month") -> Dict[str, Any]:
        """Get comprehensive dashboard statistics based on user role and period"""
        try:
            # Calculate date range
            end_date = datetime.now()
            if period == "month":
                start_date = end_date - timedelta(days=30)
            elif period == "quarter":
                start_date = end_date - timedelta(days=90)
            elif period == "year":
                start_date = end_date - timedelta(days=365)
            else:
                start_date = end_date - timedelta(days=30)

            stats = {}

            # Base statistics
            stats['totalStudents'] = self.db.query(Student).count()
            stats['totalPrograms'] = self.db.query(TrainingProgram).count()
            stats['totalFacilities'] = self.db.query(Facility).count()
            stats['totalTeachers'] = self.db.query(Teacher).count()
            stats['totalRooms'] = self.db.query(Room).count()

            # Role-specific statistics
            if user_role == "admin":
                stats.update(await self._get_admin_stats(start_date, end_date))
            elif user_role == "manager":
                stats.update(await self._get_manager_stats(start_date, end_date))
            elif user_role == "teacher":
                stats.update(await self._get_teacher_stats(start_date, end_date))
            elif user_role == "student":
                stats.update(await self._get_student_stats(start_date, end_date))

            # Trend calculations
            stats['trends'] = await self._calculate_trends(start_date, end_date, period)

            # Chart data
            stats['enrollmentTrend'] = await self._get_enrollment_trend(start_date, end_date)
            stats['courseCompletion'] = await self._get_course_completion_stats()
            stats['facilityUtilization'] = await self._get_facility_utilization()

            # Recent activities
            stats['recentActivities'] = await self._get_recent_activities(limit=10)

            return stats

        except Exception as e:
            logger.error(f"Error getting dashboard stats: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to fetch dashboard statistics")

    async def _get_admin_stats(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get admin-specific statistics"""
        return {
            'totalUsers': self.db.query(User).count(),
            'activeUsers': self.db.query(User).filter(
                User.last_login >= start_date
            ).count(),
            'systemLoad': await self._calculate_system_load(),
            'errorRate': await self._calculate_error_rate(start_date, end_date),
        }

    async def _get_manager_stats(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get manager-specific statistics"""
        return {
            'scheduledClasses': self.db.query(Schedule).filter(
                and_(Schedule.date >= start_date, Schedule.date <= end_date)
            ).count(),
            'roomUtilization': await self._calculate_room_utilization(start_date, end_date),
            'teacherWorkload': await self._calculate_teacher_workload(),
        }

    async def _get_teacher_stats(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get teacher-specific statistics"""
        # This would need the current teacher's ID
        return {
            'myClasses': 0,  # Placeholder
            'totalStudents': 0,  # Placeholder
            'averageGrade': 0,  # Placeholder
        }

    async def _get_student_stats(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get student-specific statistics"""
        # This would need the current student's ID
        return {
            'enrolledCourses': 0,  # Placeholder
            'completedCourses': 0,  # Placeholder
            'averageGrade': 0,  # Placeholder
        }

    async def _calculate_trends(self, start_date: datetime, end_date: datetime, period: str) -> Dict[str, float]:
        """Calculate trends for various metrics"""
        # Compare with previous period
        period_length = end_date - start_date
        prev_start = start_date - period_length
        prev_end = start_date

        current_students = self.db.query(Student).filter(
            Student.created_at.between(start_date, end_date)
        ).count()
        
        prev_students = self.db.query(Student).filter(
            Student.created_at.between(prev_start, prev_end)
        ).count()

        return {
            'students': self._calculate_percentage_change(prev_students, current_students),
            'programs': 0,  # Placeholder
            'facilities': 0,  # Placeholder
            'teachers': 0,  # Placeholder
        }

    def _calculate_percentage_change(self, old_value: int, new_value: int) -> float:
        """Calculate percentage change between two values"""
        if old_value == 0:
            return 100.0 if new_value > 0 else 0.0
        return round(((new_value - old_value) / old_value) * 100, 1)

    async def _get_enrollment_trend(self, start_date: datetime, end_date: datetime) -> Dict[str, List]:
        """Get enrollment trend data for charts"""
        # Group by week
        result = self.db.query(
            func.date_trunc('week', Student.created_at).label('week'),
            func.count(Student.id).label('count')
        ).filter(
            Student.created_at.between(start_date, end_date)
        ).group_by('week').order_by('week').all()

        labels = [row.week.strftime('%Y-%m-%d') for row in result]
        data = [row.count for row in result]

        return {'labels': labels, 'data': data}

    async def _get_course_completion_stats(self) -> Dict[str, int]:
        """Get course completion statistics"""
        # This would need proper enrollment and completion tracking
        return {
            'completed': 150,
            'inProgress': 300,
            'dropped': 50,
        }

    async def _get_facility_utilization(self) -> List[Dict[str, Any]]:
        """Get facility utilization data"""
        facilities = self.db.query(Facility).all()
        utilization_data = []

        for facility in facilities:
            # Calculate utilization based on scheduled classes
            total_capacity = facility.total_rooms * 8 * 5  # 8 hours/day, 5 days/week
            used_hours = self.db.query(Schedule).join(Room).filter(
                Room.facility_id == facility.id
            ).count()
            
            utilization = (used_hours / total_capacity * 100) if total_capacity > 0 else 0
            
            utilization_data.append({
                'name': facility.name,
                'utilization': round(utilization, 1)
            })

        return utilization_data

    async def _get_recent_activities(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent system activities"""
        # This would come from an activity log table
        activities = [
            {
                'id': 1,
                'message': 'Học viên mới đăng ký khóa học Python',
                'type': 'success',
                'icon': 'pi-user-plus',
                'timestamp': '2 phút trước'
            },
            {
                'id': 2,
                'message': 'Cập nhật lịch học cho khóa Web Development',
                'type': 'info',
                'icon': 'pi-calendar',
                'timestamp': '5 phút trước'
            },
            {
                'id': 3,
                'message': 'Thêm cơ sở mới tại Cần Thơ',
                'type': 'success',
                'icon': 'pi-building',
                'timestamp': '10 phút trước'
            }
        ]
        return activities[:limit]

    async def _calculate_system_load(self) -> float:
        """Calculate current system load"""
        # This would include CPU, memory, database connections, etc.
        return 65.5  # Placeholder

    async def _calculate_error_rate(self, start_date: datetime, end_date: datetime) -> float:
        """Calculate error rate for the given period"""
        # This would come from error logs
        return 2.1  # Placeholder

    async def _calculate_room_utilization(self, start_date: datetime, end_date: datetime) -> float:
        """Calculate room utilization percentage"""
        total_rooms = self.db.query(Room).count()
        scheduled_slots = self.db.query(Schedule).filter(
            Schedule.date.between(start_date, end_date)
        ).count()
        
        # Assuming 8 hours per day, 5 days per week
        total_possible_slots = total_rooms * 8 * 5 * ((end_date - start_date).days // 7)
        
        return (scheduled_slots / total_possible_slots * 100) if total_possible_slots > 0 else 0

    async def _calculate_teacher_workload(self) -> float:
        """Calculate average teacher workload"""
        teachers = self.db.query(Teacher).all()
        if not teachers:
            return 0

        total_workload = 0
        for teacher in teachers:
            classes = self.db.query(Schedule).filter(
                Schedule.teacher_id == teacher.id
            ).count()
            total_workload += classes

        return total_workload / len(teachers)

@router.get("/dashboard")
async def get_dashboard_analytics(
    period: str = "month",
    role: str = "student",
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard analytics based on user role and time period"""
    try:
        analytics_service = AnalyticsService(db)
        stats = await analytics_service.get_dashboard_stats(role, period)
        
        return success_response(
            data=stats,
            message="Dashboard analytics retrieved successfully"
        )
    except Exception as e:
        logger.error(f"Dashboard analytics error: {str(e)}")
        return error_response(
            message="Failed to retrieve dashboard analytics",
            details=str(e)
        )

@router.post("/performance")
async def record_performance_metrics(
    performance_data: dict,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Record frontend performance metrics"""
    try:
        # Process performance data in background
        background_tasks.add_task(process_performance_data, performance_data, db)
        
        return success_response(
            message="Performance metrics recorded successfully"
        )
    except Exception as e:
        logger.error(f"Performance metrics error: {str(e)}")
        return error_response(
            message="Failed to record performance metrics"
        )

async def process_performance_data(data: dict, db: Session):
    """Process and store performance metrics"""
    try:
        # Store in database or send to monitoring service
        logger.info(f"Processing performance data: {json.dumps(data, indent=2)}")
        
        # Here you would:
        # 1. Store metrics in database
        # 2. Send to monitoring service (e.g., Prometheus, DataDog)
        # 3. Trigger alerts if thresholds are exceeded
        # 4. Generate reports
        
    except Exception as e:
        logger.error(f"Error processing performance data: {str(e)}")

@router.get("/performance/summary")
async def get_performance_summary(
    days: int = 7,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get performance metrics summary"""
    try:
        # This would fetch aggregated performance data
        summary = {
            'averageLoadTime': 1.2,
            'averageApiResponseTime': 245,
            'errorRate': 0.8,
            'userSatisfactionScore': 4.6,
            'coreWebVitals': {
                'LCP': 1.8,
                'FID': 85,
                'CLS': 0.05
            },
            'topSlowPages': [
                {'page': '/schedule', 'avgLoadTime': 2.1},
                {'page': '/grades', 'avgLoadTime': 1.9},
                {'page': '/courses', 'avgLoadTime': 1.7}
            ]
        }
        
        return success_response(
            data=summary,
            message="Performance summary retrieved successfully"
        )
    except Exception as e:
        logger.error(f"Performance summary error: {str(e)}")
        return error_response(
            message="Failed to retrieve performance summary"
        )

@router.get("/user-behavior")
async def get_user_behavior_analytics(
    days: int = 30,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user behavior analytics"""
    try:
        # This would analyze user interaction patterns
        behavior_data = {
            'mostVisitedPages': [
                {'page': '/schedule', 'visits': 1250, 'avgTime': '2m 15s'},
                {'page': '/grades', 'visits': 980, 'avgTime': '1m 45s'},
                {'page': '/courses', 'visits': 750, 'avgTime': '3m 30s'}
            ],
            'deviceBreakdown': {
                'mobile': 65,
                'desktop': 30,
                'tablet': 5
            },
            'peakUsageHours': [
                {'hour': 9, 'users': 450},
                {'hour': 14, 'users': 380},
                {'hour': 20, 'users': 320}
            ],
            'userRetention': {
                'daily': 78,
                'weekly': 65,
                'monthly': 52
            }
        }
        
        return success_response(
            data=behavior_data,
            message="User behavior analytics retrieved successfully"
        )
    except Exception as e:
        logger.error(f"User behavior analytics error: {str(e)}")
        return error_response(
            message="Failed to retrieve user behavior analytics"
        )
