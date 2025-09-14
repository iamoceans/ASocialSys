from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# 创建路由器
router = DefaultRouter()
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'push-devices', views.PushDeviceViewSet, basename='push-device')

app_name = 'notifications'

urlpatterns = [
    # 路由器生成的URL
    path('', include(router.urls)),
    
    # 通知相关
    path('unread-count/', views.UnreadCountView.as_view(), name='unread-count'),
    path('mark-all-read/', views.MarkAllReadView.as_view(), name='mark-all-read'),
    path('bulk-action/', views.BulkNotificationActionView.as_view(), name='bulk-action'),
    path('stats/', views.NotificationStatsView.as_view(), name='notification-stats'),
    
    # 通知设置
    path('settings/', views.NotificationSettingsView.as_view(), name='notification-settings'),
    path('settings/update/', views.NotificationSettingsUpdateView.as_view(), name='update-settings'),
    
    # 实时通知（WebSocket相关）
    path('subscribe/', views.NotificationSubscribeView.as_view(), name='subscribe'),
    path('unsubscribe/', views.NotificationUnsubscribeView.as_view(), name='unsubscribe'),
    
    # 推送设备管理
    path('devices/register/', views.RegisterPushDeviceView.as_view(), name='register-device'),
    path('devices/<str:device_id>/deactivate/', views.DeactivatePushDeviceView.as_view(), name='deactivate-device'),
    
    # 测试通知（仅开发环境）
    path('test/', views.TestNotificationView.as_view(), name='test-notification'),
]