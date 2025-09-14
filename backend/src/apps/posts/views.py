from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, F
from django.utils import timezone
from datetime import timedelta

from .models import Post, Comment, Like, CommentLike, Hashtag
from .serializers import (
    PostSerializer,
    PostCreateSerializer,
    PostListSerializer,
    CommentSerializer,
    CommentCreateSerializer,
    HashtagSerializer
)
from apps.social.models import Follow


class PostViewSet(viewsets.ModelViewSet):
    """帖子视图集"""
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Post.objects.filter(is_deleted=False).select_related(
            'author', 'original_post__author'
        ).prefetch_related(
            'post_images', 'hashtags__hashtag', 'post_comments'
        )
        
        # 搜索功能
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(content__icontains=search) |
                Q(hashtags__hashtag__name__icontains=search)
            ).distinct()
        
        # 用户筛选
        username = self.request.query_params.get('username')
        if username:
            queryset = queryset.filter(author__username=username)
        
        # 话题筛选
        hashtag = self.request.query_params.get('hashtag')
        if hashtag:
            queryset = queryset.filter(hashtags__hashtag__name=hashtag)
        
        return queryset.order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PostCreateSerializer
        elif self.action == 'list':
            return PostListSerializer
        return PostSerializer
    
    def perform_create(self, serializer):
        """创建帖子时设置作者"""
        serializer.save(author=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """获取单个帖子详情，增加浏览量"""
        instance = self.get_object()
        # 增加浏览量
        Post.objects.filter(id=instance.id).update(
            views_count=F('views_count') + 1
        )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def repost(self, request, pk=None):
        """转发帖子"""
        original_post = self.get_object()
        content = request.data.get('content', '')
        
        # 创建转发帖子
        repost = Post.objects.create(
            author=request.user,
            content=content,
            original_post=original_post
        )
        
        # 增加原帖转发数
        Post.objects.filter(id=original_post.id).update(
            shares_count=F('shares_count') + 1
        )
        
        serializer = PostSerializer(repost, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CommentViewSet(viewsets.ModelViewSet):
    """评论视图集"""
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        post_id = self.kwargs.get('post_id')
        return Comment.objects.filter(
            post_id=post_id,
            is_deleted=False
        ).select_related('author').order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CommentCreateSerializer
        return CommentSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['post_id'] = self.kwargs.get('post_id')
        return context
    
    def perform_create(self, serializer):
        """创建评论时设置作者和帖子"""
        post_id = self.kwargs.get('post_id')
        post = get_object_or_404(Post, id=post_id)
        
        comment = serializer.save(
            author=self.request.user,
            post=post
        )
        
        # 增加帖子评论数
        Post.objects.filter(id=post_id).update(
            comments_count=F('comments_count') + 1
        )
        
        # 如果是回复评论，增加父评论回复数
        if comment.parent:
            Comment.objects.filter(id=comment.parent.id).update(
                replies_count=F('replies_count') + 1
            )


class LikePostView(generics.CreateAPIView):
    """点赞帖子"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        like, created = Like.objects.get_or_create(
            user=request.user,
            post=post
        )
        
        if created:
            # 增加帖子点赞数
            Post.objects.filter(id=post_id).update(
                likes_count=F('likes_count') + 1
            )
            return Response({'message': '点赞成功'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': '已经点赞过了'}, status=status.HTTP_400_BAD_REQUEST)


class UnlikePostView(generics.DestroyAPIView):
    """取消点赞帖子"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        try:
            like = Like.objects.get(user=request.user, post=post)
            like.delete()
            
            # 减少帖子点赞数
            Post.objects.filter(id=post_id).update(
                likes_count=F('likes_count') - 1
            )
            return Response({'message': '取消点赞成功'}, status=status.HTTP_204_NO_CONTENT)
        except Like.DoesNotExist:
            return Response({'message': '还没有点赞'}, status=status.HTTP_400_BAD_REQUEST)


class LikeCommentView(generics.CreateAPIView):
    """点赞评论"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id)
        like, created = CommentLike.objects.get_or_create(
            user=request.user,
            comment=comment
        )
        
        if created:
            # 增加评论点赞数
            Comment.objects.filter(id=comment_id).update(
                likes_count=F('likes_count') + 1
            )
            return Response({'message': '点赞成功'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': '已经点赞过了'}, status=status.HTTP_400_BAD_REQUEST)


class UnlikeCommentView(generics.DestroyAPIView):
    """取消点赞评论"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id)
        try:
            like = CommentLike.objects.get(user=request.user, comment=comment)
            like.delete()
            
            # 减少评论点赞数
            Comment.objects.filter(id=comment_id).update(
                likes_count=F('likes_count') - 1
            )
            return Response({'message': '取消点赞成功'}, status=status.HTTP_204_NO_CONTENT)
        except CommentLike.DoesNotExist:
            return Response({'message': '还没有点赞'}, status=status.HTTP_400_BAD_REQUEST)


class HashtagListView(generics.ListAPIView):
    """话题标签列表"""
    
    queryset = Hashtag.objects.all().order_by('-posts_count')
    serializer_class = HashtagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class HashtagDetailView(generics.RetrieveAPIView):
    """话题标签详情"""
    
    queryset = Hashtag.objects.all()
    serializer_class = HashtagSerializer
    lookup_field = 'name'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class TrendingPostsView(generics.ListAPIView):
    """热门帖子"""
    
    serializer_class = PostListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        # 获取最近24小时内的热门帖子
        yesterday = timezone.now() - timedelta(days=1)
        return Post.objects.filter(
            is_deleted=False,
            created_at__gte=yesterday
        ).select_related('author').prefetch_related(
            'post_images'
        ).order_by('-likes_count', '-comments_count', '-views_count')[:20]


class UserFeedView(generics.ListAPIView):
    """用户时间线"""
    
    serializer_class = PostListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # 获取用户关注的人的帖子
        following_users = Follow.objects.filter(
            follower=self.request.user
        ).values_list('following', flat=True)
        
        # 包括自己的帖子
        user_ids = list(following_users) + [self.request.user.id]
        
        return Post.objects.filter(
            author_id__in=user_ids,
            is_deleted=False
        ).select_related('author').prefetch_related(
            'post_images'
        ).order_by('-created_at')