from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.documentation import include_docs_urls
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

# 创建主路由器
router = DefaultRouter()

# API版本前缀
api_v1_patterns = [
    # 用户相关
    path('auth/', include('apps.users.urls')),
    
    # 帖子相关
    path('posts/', include('apps.posts.urls')),
    
    # 社交功能
    path('social/', include('apps.social.urls')),
    
    # 通知系统
    path('notifications/', include('apps.notifications.urls')),
]

# 主URL模式
urlpatterns = [
    # API文档
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API v1
    path('v1/', include(api_v1_patterns)),
    
    # 路由器生成的URL
    path('', include(router.urls)),
]