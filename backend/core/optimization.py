# Database optimization and caching utilities
from sqlalchemy import event, text, inspect
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from functools import wraps, lru_cache
import time
import logging
import json
import hashlib
from typing import Any, Dict, List, Optional, Callable
from datetime import datetime, timedelta
import redis
import pickle

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseOptimizer:
    """Database optimization utilities"""
    
    def __init__(self):
        self.query_stats = {}
        self.slow_query_threshold = 0.5  # 500ms
        
    def setup_query_profiling(self, engine: Engine):
        """Setup query profiling and logging"""
        
        @event.listens_for(engine, "before_cursor_execute")
        def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            context._query_start_time = time.time()
            
        @event.listens_for(engine, "after_cursor_execute")
        def receive_after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            execution_time = time.time() - context._query_start_time
            
            # Log slow queries
            if execution_time > self.slow_query_threshold:
                logger.warning(f"🐌 Slow query detected ({execution_time:.3f}s): {statement[:100]}...")
                
            # Track query statistics
            query_hash = hashlib.md5(statement.encode()).hexdigest()[:8]
            if query_hash not in self.query_stats:
                self.query_stats[query_hash] = {
                    'statement': statement[:200],
                    'count': 0,
                    'total_time': 0,
                    'avg_time': 0,
                    'max_time': 0
                }
            
            stats = self.query_stats[query_hash]
            stats['count'] += 1
            stats['total_time'] += execution_time
            stats['avg_time'] = stats['total_time'] / stats['count']
            stats['max_time'] = max(stats['max_time'], execution_time)

    def get_query_stats(self) -> Dict[str, Any]:
        """Get query performance statistics"""
        return {
            'total_queries': sum(stat['count'] for stat in self.query_stats.values()),
            'slow_queries': len([s for s in self.query_stats.values() if s['max_time'] > self.slow_query_threshold]),
            'top_slow_queries': sorted(
                self.query_stats.values(),
                key=lambda x: x['max_time'],
                reverse=True
            )[:10],
            'most_frequent_queries': sorted(
                self.query_stats.values(),
                key=lambda x: x['count'],
                reverse=True
            )[:10]
        }

    def analyze_table_usage(self, db: Session) -> Dict[str, Any]:
        """Analyze table usage and suggest optimizations"""
        try:
            # Get table statistics (PostgreSQL specific)
            result = db.execute(text("""
                SELECT 
                    schemaname,
                    tablename,
                    n_tup_ins as inserts,
                    n_tup_upd as updates,
                    n_tup_del as deletes,
                    n_live_tup as live_tuples,
                    n_dead_tup as dead_tuples,
                    seq_scan as sequential_scans,
                    seq_tup_read as sequential_reads,
                    idx_scan as index_scans,
                    idx_tup_fetch as index_reads
                FROM pg_stat_user_tables 
                ORDER BY seq_scan DESC;
            """))
            
            tables = []
            for row in result:
                table_stats = {
                    'schema': row.schemaname,
                    'table': row.tablename,
                    'inserts': row.inserts,
                    'updates': row.updates,
                    'deletes': row.deletes,
                    'live_tuples': row.live_tuples,
                    'dead_tuples': row.dead_tuples,
                    'sequential_scans': row.sequential_scans,
                    'sequential_reads': row.sequential_reads,
                    'index_scans': row.index_scans or 0,
                    'index_reads': row.index_reads or 0
                }
                
                # Calculate metrics
                total_scans = table_stats['sequential_scans'] + table_stats['index_scans']
                if total_scans > 0:
                    table_stats['index_usage_ratio'] = table_stats['index_scans'] / total_scans
                else:
                    table_stats['index_usage_ratio'] = 0
                    
                # Suggestions
                suggestions = []
                if table_stats['index_usage_ratio'] < 0.7 and table_stats['sequential_scans'] > 1000:
                    suggestions.append("Consider adding indexes for frequently queried columns")
                if table_stats['dead_tuples'] > table_stats['live_tuples'] * 0.1:
                    suggestions.append("Table needs VACUUM to clean up dead tuples")
                if table_stats['sequential_reads'] > table_stats['live_tuples'] * 10:
                    suggestions.append("High sequential scan ratio - review queries and indexes")
                    
                table_stats['suggestions'] = suggestions
                tables.append(table_stats)
            
            return {
                'tables': tables,
                'summary': {
                    'total_tables': len(tables),
                    'tables_needing_vacuum': len([t for t in tables if 'VACUUM' in str(t['suggestions'])]),
                    'tables_needing_indexes': len([t for t in tables if 'indexes' in str(t['suggestions'])]),
                }
            }
            
        except Exception as e:
            logger.warning(f"Could not analyze table usage (might not be PostgreSQL): {e}")
            return {'error': 'Table analysis not available'}

    def suggest_indexes(self, db: Session) -> List[Dict[str, str]]:
        """Suggest missing indexes based on query patterns"""
        suggestions = []
        
        # Common patterns that benefit from indexes
        common_patterns = [
            {
                'table': 'students',
                'columns': ['email', 'student_id'],
                'reason': 'Frequently used for lookups and authentication'
            },
            {
                'table': 'schedules',
                'columns': ['date', 'teacher_id', 'room_id'],
                'reason': 'Common filters in schedule queries'
            },
            {
                'table': 'users',
                'columns': ['email', 'username', 'last_login'],
                'reason': 'Authentication and user management queries'
            },
            {
                'table': 'classes',
                'columns': ['course_id', 'teacher_id', 'start_date'],
                'reason': 'Course and teacher filtering'
            }
        ]
        
        try:
            # Check existing indexes
            result = db.execute(text("""
                SELECT 
                    t.relname as table_name,
                    i.relname as index_name,
                    array_to_string(array_agg(a.attname), ', ') as column_names
                FROM 
                    pg_class t,
                    pg_class i,
                    pg_index ix,
                    pg_attribute a
                WHERE 
                    t.oid = ix.indrelid
                    AND i.oid = ix.indexrelid
                    AND a.attrelid = t.oid
                    AND a.attnum = ANY(ix.indkey)
                    AND t.relkind = 'r'
                GROUP BY t.relname, i.relname
                ORDER BY t.relname, i.relname;
            """))
            
            existing_indexes = {}
            for row in result:
                table = row.table_name
                if table not in existing_indexes:
                    existing_indexes[table] = []
                existing_indexes[table].append(row.column_names)
            
            # Check which suggested indexes are missing
            for pattern in common_patterns:
                table = pattern['table']
                columns = ', '.join(pattern['columns'])
                
                if table not in existing_indexes or columns not in existing_indexes[table]:
                    suggestions.append({
                        'table': table,
                        'columns': columns,
                        'sql': f"CREATE INDEX idx_{table}_{'_'.join(pattern['columns'])} ON {table} ({columns});",
                        'reason': pattern['reason']
                    })
                    
        except Exception as e:
            logger.warning(f"Could not analyze indexes: {e}")
            
        return suggestions

class CacheManager:
    """Advanced caching system with Redis and in-memory fallback"""
    
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_client = None
        self.memory_cache = {}
        self.cache_stats = {
            'hits': 0,
            'misses': 0,
            'errors': 0
        }
        
        if redis_url:
            try:
                self.redis_client = redis.from_url(redis_url, decode_responses=False)
                self.redis_client.ping()
                logger.info("✅ Redis cache connected")
            except Exception as e:
                logger.warning(f"⚠️ Redis connection failed, using memory cache: {e}")
    
    def get(self, key: str) -> Any:
        """Get value from cache"""
        try:
            # Try Redis first
            if self.redis_client:
                try:
                    value = self.redis_client.get(key)
                    if value is not None:
                        self.cache_stats['hits'] += 1
                        return pickle.loads(value)
                except Exception as e:
                    logger.warning(f"Redis get error: {e}")
                    self.cache_stats['errors'] += 1
            
            # Fallback to memory cache
            if key in self.memory_cache:
                entry = self.memory_cache[key]
                if entry['expires'] > datetime.now():
                    self.cache_stats['hits'] += 1
                    return entry['value']
                else:
                    del self.memory_cache[key]
            
            self.cache_stats['misses'] += 1
            return None
            
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            self.cache_stats['errors'] += 1
            return None
    
    def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Set value in cache with TTL in seconds"""
        try:
            # Try Redis first
            if self.redis_client:
                try:
                    serialized = pickle.dumps(value)
                    self.redis_client.setex(key, ttl, serialized)
                    return True
                except Exception as e:
                    logger.warning(f"Redis set error: {e}")
                    self.cache_stats['errors'] += 1
            
            # Fallback to memory cache
            self.memory_cache[key] = {
                'value': value,
                'expires': datetime.now() + timedelta(seconds=ttl)
            }
            return True
            
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            self.cache_stats['errors'] += 1
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        try:
            deleted = False
            
            if self.redis_client:
                try:
                    deleted = bool(self.redis_client.delete(key))
                except Exception as e:
                    logger.warning(f"Redis delete error: {e}")
            
            if key in self.memory_cache:
                del self.memory_cache[key]
                deleted = True
                
            return deleted
            
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False
    
    def clear(self) -> bool:
        """Clear all cache"""
        try:
            if self.redis_client:
                try:
                    self.redis_client.flushdb()
                except Exception as e:
                    logger.warning(f"Redis clear error: {e}")
            
            self.memory_cache.clear()
            return True
            
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total_requests = self.cache_stats['hits'] + self.cache_stats['misses']
        hit_rate = (self.cache_stats['hits'] / total_requests * 100) if total_requests > 0 else 0
        
        stats = {
            'hits': self.cache_stats['hits'],
            'misses': self.cache_stats['misses'],
            'errors': self.cache_stats['errors'],
            'hit_rate': round(hit_rate, 2),
            'memory_cache_size': len(self.memory_cache)
        }
        
        if self.redis_client:
            try:
                redis_info = self.redis_client.info()
                stats.update({
                    'redis_connected': True,
                    'redis_memory_used': redis_info.get('used_memory_human', 'N/A'),
                    'redis_keys': self.redis_client.dbsize()
                })
            except Exception:
                stats['redis_connected'] = False
        else:
            stats['redis_connected'] = False
            
        return stats

# Global cache instance
cache_manager = CacheManager()

def cached(ttl: int = 300, key_prefix: str = ""):
    """Decorator for caching function results"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            key_parts = [key_prefix, func.__name__]
            if args:
                key_parts.append(str(hash(args)))
            if kwargs:
                key_parts.append(str(hash(tuple(sorted(kwargs.items())))))
            cache_key = ":".join(filter(None, key_parts))
            
            # Try to get from cache
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache_manager.set(cache_key, result, ttl)
            return result
            
        wrapper.cache_key = lambda *args, **kwargs: ":".join(filter(None, [
            key_prefix, func.__name__,
            str(hash(args)) if args else "",
            str(hash(tuple(sorted(kwargs.items())))) if kwargs else ""
        ]))
        wrapper.invalidate = lambda *args, **kwargs: cache_manager.delete(
            wrapper.cache_key(*args, **kwargs)
        )
        
        return wrapper
    return decorator

def invalidate_cache_pattern(pattern: str):
    """Invalidate cache keys matching pattern"""
    try:
        if cache_manager.redis_client:
            keys = cache_manager.redis_client.keys(pattern)
            if keys:
                cache_manager.redis_client.delete(*keys)
                logger.info(f"Invalidated {len(keys)} cache keys matching '{pattern}'")
        
        # Clear memory cache entries matching pattern
        keys_to_delete = [k for k in cache_manager.memory_cache.keys() if pattern in k]
        for key in keys_to_delete:
            del cache_manager.memory_cache[key]
            
    except Exception as e:
        logger.error(f"Error invalidating cache pattern: {e}")

# Database session caching
def cached_query(ttl: int = 300):
    """Decorator for caching database queries"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(db: Session, *args, **kwargs):
            # Generate cache key based on query
            key_parts = ["query", func.__name__]
            if args:
                key_parts.append(str(hash(args)))
            if kwargs:
                key_parts.append(str(hash(tuple(sorted(kwargs.items())))))
            cache_key = ":".join(key_parts)
            
            # Try cache first
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute query and cache
            result = func(db, *args, **kwargs)
            cache_manager.set(cache_key, result, ttl)
            return result
            
        return wrapper
    return decorator

# Initialize database optimizer
db_optimizer = DatabaseOptimizer()

# Export utilities
__all__ = [
    'DatabaseOptimizer',
    'CacheManager', 
    'cache_manager',
    'cached',
    'cached_query',
    'invalidate_cache_pattern',
    'db_optimizer'
]
