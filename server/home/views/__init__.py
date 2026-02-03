from .apis import *
from .htmx import *

from django.contrib import admin
from django.shortcuts import render
from django_redis import get_redis_connection
from django.contrib.admin.views.decorators import staff_member_required

@staff_member_required
def redis_status_view(request):
    # Get the raw connection to access .info()
    con = get_redis_connection("default")
    info = con.info() # Returns a huge dictionary of Redis stats
    
    context = {
        'title': 'Redis Cache Status',
        'redis_version': info.get('redis_version'),
        'uptime': info.get('uptime_in_days'),
        'used_memory': info.get('used_memory_human'),
        'peak_memory': info.get('used_memory_peak_human'),
        'connected_clients': info.get('connected_clients'),
        'keys': info.get('db1', {}).get('keys', 0), # Match the DB index in settings
        'hits': info.get('keyspace_hits'),
        'misses': info.get('keyspace_misses'),
    }
    return render(request, 'admin/redis_status.html', context)

@staff_member_required
def redis_status_view(request):
    con = get_redis_connection("default")
    info = con.info()

    # Logic to calculate Hit Rate percentage
    total_requests = info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0)
    hit_rate = (info.get('keyspace_hits', 0) / total_requests * 100) if total_requests > 0 else 0

    context = {
        'title': 'System Cache Health',
        'info': info,  # Raw info for debugging
        'hit_rate': round(hit_rate, 2),
        'memory': {
            'used': info.get('used_memory_human'),
            'peak': info.get('used_memory_peak_human'),
            'lua': info.get('used_memory_lua_human'),
            'fragmentation': info.get('mem_fragmentation_ratio'),
        },
        'stats': {
            'total_connections': info.get('total_connections_received'),
            'commands_per_sec': info.get('instantaneous_ops_per_sec'),
            'evicted_keys': info.get('evicted_keys'),
            'expired_keys': info.get('expired_keys'),
        },
        'persistence': {
            'loading': info.get('loading'),
            'rdb_changes': info.get('rdb_changes_since_last_save'),
            'last_save_status': info.get('rdb_last_bgsave_status'),
        }
    }
    return render(request, 'admin/redis_status.html', context)
