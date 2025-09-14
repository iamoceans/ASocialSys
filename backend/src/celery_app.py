import os
from celery import Celery
from django.conf import settings

# 设置Django设置模块
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# 创建Celery应用
app = Celery('social_system')

# 使用Django设置配置Celery
app.config_from_object('django.conf:settings', namespace='CELERY')

# 自动发现任务
app.autodiscover_tasks()

# Celery配置
app.conf.update(
    # 任务序列化
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Shanghai',
    enable_utc=True,
    
    # 任务路由
    task_routes={
        'apps.notifications.tasks.*': {'queue': 'notifications'},
        'apps.posts.tasks.*': {'queue': 'posts'},
        'apps.users.tasks.*': {'queue': 'users'},
        'apps.social.tasks.*': {'queue': 'social'},
    },
    
    # 任务优先级
    task_default_priority=5,
    worker_prefetch_multiplier=1,
    
    # 结果后端
    result_expires=3600,
    
    # 任务重试
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    
    # 监控
    worker_send_task_events=True,
    task_send_sent_event=True,
)

# 调试模式下的配置
if settings.DEBUG:
    app.conf.update(
        task_always_eager=False,  # 设置为True可以同步执行任务（用于测试）
        task_eager_propagates=True,
    )

@app.task(bind=True)
def debug_task(self):
    """调试任务"""
    print(f'Request: {self.request!r}')