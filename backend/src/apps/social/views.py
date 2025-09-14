from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Exists, OuterRef
from django.db import transaction

from .models import Follow, Block, Conversation, Message, MessageRead, Report
from .serializers import (
    FollowSerializer,
    FollowCreateSerializer,
    BlockSerializer,
    BlockCreateSerializer,
    ConversationSerializer,
    ConversationCreateSerializer,
    MessageSerializer,
    MessageCreateSerializer,
    MessageReadSerializer,
    ReportSerializer,
    ReportCreateSerializer,
    UserStatsSerializer
)
from apps.users.serializers import UserSerializer

User = get_user_model()


class FollowUserView(generics.CreateAPIView):
    """关注用户"""
    
    serializer_class = FollowCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        following_user = serializer.validated_data['following']
        
        # 检查是否已经关注
        if Follow.objects.filter(
            follower=request.user,
            following=following_user
        ).exists():
            return Response(
                {'message': '已经关注过该用户'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 检查是否被屏蔽
        if Block.objects.filter(
            Q(blocker=request.user, blocked=following_user) |
            Q(blocker=following_user, blocked=request.user)
        ).exists():
            return Response(
                {'message': '无法关注该用户'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        follow = serializer.save()
        return Response(
            FollowSerializer(follow, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class UnfollowUserView(generics.DestroyAPIView):
    """取消关注用户"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, user_id):
        following_user = get_object_or_404(User, id=user_id)
        
        try:
            follow = Follow.objects.get(
                follower=request.user,
                following=following_user
            )
            follow.delete()
            return Response(
                {'message': '取消关注成功'},
                status=status.HTTP_204_NO_CONTENT
            )
        except Follow.DoesNotExist:
            return Response(
                {'message': '还没有关注该用户'},
                status=status.HTTP_400_BAD_REQUEST
            )


class FollowersListView(generics.ListAPIView):
    """粉丝列表"""
    
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Follow.objects.filter(
            following_id=user_id
        ).select_related('follower', 'following')


class FollowingListView(generics.ListAPIView):
    """关注列表"""
    
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Follow.objects.filter(
            follower_id=user_id
        ).select_related('follower', 'following')


class IsFollowingView(generics.RetrieveAPIView):
    """检查是否关注某用户"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        is_following = Follow.objects.filter(
            follower=request.user,
            following_id=user_id
        ).exists()
        
        return Response({'is_following': is_following})


class BlockUserView(generics.CreateAPIView):
    """屏蔽用户"""
    
    serializer_class = BlockCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        blocked_user = serializer.validated_data['blocked']
        
        # 检查是否已经屏蔽
        if Block.objects.filter(
            blocker=request.user,
            blocked=blocked_user
        ).exists():
            return Response(
                {'message': '已经屏蔽过该用户'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            # 创建屏蔽关系
            block = serializer.save()
            
            # 删除相互关注关系
            Follow.objects.filter(
                Q(follower=request.user, following=blocked_user) |
                Q(follower=blocked_user, following=request.user)
            ).delete()
        
        return Response(
            BlockSerializer(block, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class UnblockUserView(generics.DestroyAPIView):
    """取消屏蔽用户"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, user_id):
        blocked_user = get_object_or_404(User, id=user_id)
        
        try:
            block = Block.objects.get(
                blocker=request.user,
                blocked=blocked_user
            )
            block.delete()
            return Response(
                {'message': '取消屏蔽成功'},
                status=status.HTTP_204_NO_CONTENT
            )
        except Block.DoesNotExist:
            return Response(
                {'message': '还没有屏蔽该用户'},
                status=status.HTTP_400_BAD_REQUEST
            )


class BlockedUsersListView(generics.ListAPIView):
    """屏蔽用户列表"""
    
    serializer_class = BlockSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Block.objects.filter(
            blocker=self.request.user
        ).select_related('blocker', 'blocked')


class IsBlockedView(generics.RetrieveAPIView):
    """检查是否屏蔽某用户"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        is_blocked = Block.objects.filter(
            blocker=request.user,
            blocked_id=user_id
        ).exists()
        
        is_blocked_by = Block.objects.filter(
            blocker_id=user_id,
            blocked=request.user
        ).exists()
        
        return Response({
            'is_blocked': is_blocked,
            'is_blocked_by': is_blocked_by
        })


class ConversationViewSet(viewsets.ModelViewSet):
    """对话视图集"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants').order_by('-updated_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ConversationCreateSerializer
        return ConversationSerializer
    
    @action(detail=True, methods=['post'])
    def add_participant(self, request, pk=None):
        """添加参与者"""
        conversation = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'message': '用户ID不能为空'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = get_object_or_404(User, id=user_id)
        
        if user in conversation.participants.all():
            return Response(
                {'message': '用户已经在对话中'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        conversation.participants.add(user)
        return Response({'message': '添加成功'})
    
    @action(detail=True, methods=['post'])
    def remove_participant(self, request, pk=None):
        """移除参与者"""
        conversation = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'message': '用户ID不能为空'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = get_object_or_404(User, id=user_id)
        
        if user not in conversation.participants.all():
            return Response(
                {'message': '用户不在对话中'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        conversation.participants.remove(user)
        return Response({'message': '移除成功'})


class MessageViewSet(viewsets.ModelViewSet):
    """消息视图集"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Message.objects.filter(
            conversation__participants=self.request.user,
            is_deleted=False
        ).select_related('sender', 'conversation').order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MessageCreateSerializer
        return MessageSerializer
    
    def perform_create(self, serializer):
        """创建消息"""
        message = serializer.save()
        
        # 为其他参与者创建未读记录
        conversation = message.conversation
        other_participants = conversation.participants.exclude(
            id=self.request.user.id
        )
        
        # 这里可以添加实时通知逻辑
        # 例如：发送WebSocket消息、推送通知等


class ConversationMessagesView(generics.ListAPIView):
    """对话消息列表"""
    
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        conversation = get_object_or_404(
            Conversation,
            id=conversation_id,
            participants=self.request.user
        )
        
        return Message.objects.filter(
            conversation=conversation,
            is_deleted=False
        ).select_related('sender').order_by('created_at')


class MarkConversationReadView(generics.CreateAPIView):
    """标记对话为已读"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, conversation_id):
        conversation = get_object_or_404(
            Conversation,
            id=conversation_id,
            participants=request.user
        )
        
        # 获取所有未读消息
        unread_messages = Message.objects.filter(
            conversation=conversation,
            is_deleted=False
        ).exclude(
            message_reads__user=request.user
        )
        
        # 批量创建已读记录
        read_records = [
            MessageRead(message=message, user=request.user)
            for message in unread_messages
        ]
        MessageRead.objects.bulk_create(read_records, ignore_conflicts=True)
        
        return Response({'message': '标记为已读成功'})


class MarkMessageReadView(generics.CreateAPIView):
    """标记消息为已读"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, message_id):
        message = get_object_or_404(
            Message,
            id=message_id,
            conversation__participants=request.user
        )
        
        read_record, created = MessageRead.objects.get_or_create(
            message=message,
            user=request.user
        )
        
        if created:
            return Response({'message': '标记为已读成功'})
        else:
            return Response({'message': '消息已经是已读状态'})


class ReportViewSet(viewsets.ModelViewSet):
    """举报视图集"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Report.objects.filter(
            reporter=self.request.user
        ).select_related('reporter', 'reported_user')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReportCreateSerializer
        return ReportSerializer


class UserStatsView(generics.RetrieveAPIView):
    """用户统计信息"""
    
    serializer_class = UserStatsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_object(self):
        user_id = self.kwargs['user_id']
        user = get_object_or_404(User, id=user_id)
        
        # 统计数据
        followers_count = Follow.objects.filter(following=user).count()
        following_count = Follow.objects.filter(follower=user).count()
        posts_count = user.posts.filter(is_deleted=False).count()
        likes_received_count = user.posts.filter(
            is_deleted=False
        ).aggregate(
            total_likes=Count('post_likes')
        )['total_likes'] or 0
        
        return {
            'followers_count': followers_count,
            'following_count': following_count,
            'posts_count': posts_count,
            'likes_received_count': likes_received_count
        }


class RecommendedUsersView(generics.ListAPIView):
    """推荐用户"""
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # 获取用户已关注的人
        following_ids = Follow.objects.filter(
            follower=user
        ).values_list('following_id', flat=True)
        
        # 获取用户屏蔽的人
        blocked_ids = Block.objects.filter(
            Q(blocker=user) | Q(blocked=user)
        ).values_list('blocked_id', 'blocker_id')
        blocked_user_ids = set()
        for blocked_id, blocker_id in blocked_ids:
            blocked_user_ids.add(blocked_id)
            blocked_user_ids.add(blocker_id)
        
        # 排除自己、已关注的人、屏蔽的人
        exclude_ids = list(following_ids) + list(blocked_user_ids) + [user.id]
        
        # 推荐逻辑：按粉丝数排序
        return User.objects.exclude(
            id__in=exclude_ids
        ).annotate(
            followers_count=Count('followers')
        ).order_by('-followers_count')[:10]


class SearchUsersView(generics.ListAPIView):
    """搜索用户"""
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if not query:
            return User.objects.none()
        
        return User.objects.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(email__icontains=query)
        ).annotate(
            followers_count=Count('followers')
        ).order_by('-followers_count')