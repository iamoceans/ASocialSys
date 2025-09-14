from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# 创建路由器
router = DefaultRouter()
router.register(r'conversations', views.ConversationViewSet, basename='conversation')
router.register(r'messages', views.MessageViewSet, basename='message')
router.register(r'reports', views.ReportViewSet, basename='report')

app_name = 'social'

urlpatterns = [
    # 路由器生成的URL
    path('', include(router.urls)),
    
    # 关注相关
    path('follow/', views.FollowUserView.as_view(), name='follow-user'),
    path('unfollow/<int:user_id>/', views.UnfollowUserView.as_view(), name='unfollow-user'),
    path('followers/<int:user_id>/', views.FollowersListView.as_view(), name='followers-list'),
    path('following/<int:user_id>/', views.FollowingListView.as_view(), name='following-list'),
    path('is-following/<int:user_id>/', views.IsFollowingView.as_view(), name='is-following'),
    
    # 屏蔽相关
    path('block/', views.BlockUserView.as_view(), name='block-user'),
    path('unblock/<int:user_id>/', views.UnblockUserView.as_view(), name='unblock-user'),
    path('blocked-users/', views.BlockedUsersListView.as_view(), name='blocked-users'),
    path('is-blocked/<int:user_id>/', views.IsBlockedView.as_view(), name='is-blocked'),
    
    # 消息相关
    path('conversations/<int:conversation_id>/messages/', 
         views.ConversationMessagesView.as_view(), name='conversation-messages'),
    path('conversations/<int:conversation_id>/mark-read/', 
         views.MarkConversationReadView.as_view(), name='mark-conversation-read'),
    path('messages/<int:message_id>/mark-read/', 
         views.MarkMessageReadView.as_view(), name='mark-message-read'),
    
    # 用户统计
    path('users/<int:user_id>/stats/', views.UserStatsView.as_view(), name='user-stats'),
    
    # 推荐用户
    path('recommended-users/', views.RecommendedUsersView.as_view(), name='recommended-users'),
    
    # 搜索用户
    path('search-users/', views.SearchUsersView.as_view(), name='search-users'),
]