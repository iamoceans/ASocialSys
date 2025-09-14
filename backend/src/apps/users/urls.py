from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from . import views

app_name = 'users'

urlpatterns = [
    # 认证相关
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # 邮箱验证
    path('email/send-verification/', views.send_verification_email_view, name='send_verification_email'),
    path('email/verify/', views.verify_email_view, name='verify_email'),
    path('email/resend-verification/', views.resend_verification_email_view, name='resend_verification_email'),
    
    # JWT令牌
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # 用户资料
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/settings/', views.UserProfileSettingsView.as_view(), name='profile_settings'),
    path('password/change/', views.PasswordChangeView.as_view(), name='password_change'),
    path('avatar/upload/', views.upload_avatar_view, name='avatar_upload'),
    
    # 用户信息
    path('list/', views.UserListView.as_view(), name='user_list'),
    path('<str:username>/', views.UserDetailView.as_view(), name='user_detail'),
    path('<str:username>/stats/', views.user_stats_view, name='user_stats'),
]