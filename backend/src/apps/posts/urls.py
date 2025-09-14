from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.PostViewSet, basename='post')
router.register(r'(?P<post_id>\d+)/comments', views.CommentViewSet, basename='comment')

urlpatterns = [
    # 帖子相关
    path('', include(router.urls)),
    
    # 点赞相关
    path('<int:post_id>/like/', views.LikePostView.as_view(), name='like-post'),
    path('<int:post_id>/unlike/', views.UnlikePostView.as_view(), name='unlike-post'),
    
    # 评论点赞
    path('comments/<int:comment_id>/like/', views.LikeCommentView.as_view(), name='like-comment'),
    path('comments/<int:comment_id>/unlike/', views.UnlikeCommentView.as_view(), name='unlike-comment'),
    
    # 话题标签
    path('hashtags/', views.HashtagListView.as_view(), name='hashtag-list'),
    path('hashtags/<str:name>/', views.HashtagDetailView.as_view(), name='hashtag-detail'),
    
    # 趋势和推荐
    path('trending/', views.TrendingPostsView.as_view(), name='trending-posts'),
    path('feed/', views.UserFeedView.as_view(), name='user-feed'),
]