from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
from django.conf import settings

from .models import Notification, NotificationSettings, PushDevice
from .serializers import (
    NotificationSerializer,
    NotificationListSerializer,
    NotificationCreateSerializer,
    NotificationSettingsSerializer,
    NotificationSettingsUpdateSerializer,
    PushDeviceSerializer,
    PushDeviceCreateSerializer,
    NotificationStatsSerializer,
    BulkNotificationActionSerializer
)


class NotificationViewSet(viewsets.ModelViewSet):
    """通知视图集"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Notification.objects.filter(
            recipient=self.request.user,
            is_deleted=False
        ).select_related('sender').order_by('-created_at')
        
        # 筛选条件
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return NotificationListSerializer
        elif self.action == 'create':
            return NotificationCreateSerializer
        return NotificationSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """获取单个通知详情，自动标记为已读"""
        instance = self.get_object()
        
        # 标记为已读
        if not instance.is_read:
            instance.mark_as_read()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """标记单个通知为已读"""
        notification = self.get_object()
        notification.mark_as_read()
        return Response({'message': '标记为已读成功'})
    
    @action(detail=True, methods=['post'])
    def mark_unread(self, request, pk=None):
        """标记单个通知为未读"""
        notification = self.get_object()
        notification.mark_as_unread()
        return Response({'message': '标记为未读成功'})
    
    def destroy(self, request, *args, **kwargs):
        """软删除通知"""
        instance = self.get_object()
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UnreadCountView(generics.RetrieveAPIView):
    """获取未读通知数量"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        unread_count = Notification.objects.filter(
            recipient=request.user,
            is_read=False,
            is_deleted=False
        ).count()
        
        # 按类型统计未读数量
        type_counts = Notification.objects.filter(
            recipient=request.user,
            is_read=False,
            is_deleted=False
        ).values('notification_type').annotate(
            count=Count('id')
        )
        
        type_stats = {item['notification_type']: item['count'] for item in type_counts}
        
        return Response({
            'total_unread': unread_count,
            'by_type': type_stats
        })


class MarkAllReadView(generics.CreateAPIView):
    """标记所有通知为已读"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        updated_count = Notification.objects.filter(
            recipient=request.user,
            is_read=False,
            is_deleted=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({
            'message': f'成功标记{updated_count}条通知为已读',
            'updated_count': updated_count
        })


class BulkNotificationActionView(generics.CreateAPIView):
    """批量通知操作"""
    
    serializer_class = BulkNotificationActionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        notification_ids = serializer.validated_data['notification_ids']
        action = serializer.validated_data['action']
        
        notifications = Notification.objects.filter(
            id__in=notification_ids,
            recipient=request.user
        )
        
        if action == 'mark_read':
            updated_count = notifications.update(
                is_read=True,
                read_at=timezone.now()
            )
            message = f'成功标记{updated_count}条通知为已读'
        elif action == 'mark_unread':
            updated_count = notifications.update(
                is_read=False,
                read_at=None
            )
            message = f'成功标记{updated_count}条通知为未读'
        elif action == 'delete':
            updated_count = notifications.update(is_deleted=True)
            message = f'成功删除{updated_count}条通知'
        
        return Response({
            'message': message,
            'updated_count': updated_count
        })


class NotificationStatsView(generics.RetrieveAPIView):
    """通知统计信息"""
    
    serializer_class = NotificationStatsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        
        # 基础统计
        total_count = Notification.objects.filter(
            recipient=user,
            is_deleted=False
        ).count()
        
        unread_count = Notification.objects.filter(
            recipient=user,
            is_read=False,
            is_deleted=False
        ).count()
        
        read_count = total_count - unread_count
        
        # 按类型统计
        type_stats = Notification.objects.filter(
            recipient=user,
            is_deleted=False
        ).values('notification_type').annotate(
            count=Count('id')
        )
        
        type_counts = {item['notification_type']: item['count'] for item in type_stats}
        
        # 最近7天统计
        week_ago = timezone.now() - timedelta(days=7)
        recent_count = Notification.objects.filter(
            recipient=user,
            is_deleted=False,
            created_at__gte=week_ago
        ).count()
        
        return {
            'total_count': total_count,
            'unread_count': unread_count,
            'read_count': read_count,
            'like_count': type_counts.get('like', 0),
            'comment_count': type_counts.get('comment', 0),
            'follow_count': type_counts.get('follow', 0),
            'mention_count': type_counts.get('mention', 0),
            'repost_count': type_counts.get('repost', 0),
            'message_count': type_counts.get('message', 0),
            'system_count': type_counts.get('system', 0),
            'recent_count': recent_count
        }


class NotificationSettingsView(generics.RetrieveAPIView):
    """获取通知设置"""
    
    serializer_class = NotificationSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        settings, created = NotificationSettings.objects.get_or_create(
            user=self.request.user
        )
        return settings


class NotificationSettingsUpdateView(generics.UpdateAPIView):
    """更新通知设置"""
    
    serializer_class = NotificationSettingsUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        settings, created = NotificationSettings.objects.get_or_create(
            user=self.request.user
        )
        return settings


class PushDeviceViewSet(viewsets.ModelViewSet):
    """推送设备视图集"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PushDevice.objects.filter(
            user=self.request.user
        ).order_by('-last_used')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PushDeviceCreateSerializer
        return PushDeviceSerializer
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """停用设备"""
        device = self.get_object()
        device.is_active = False
        device.save()
        return Response({'message': '设备已停用'})
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """激活设备"""
        device = self.get_object()
        device.is_active = True
        device.save()
        return Response({'message': '设备已激活'})


class RegisterPushDeviceView(generics.CreateAPIView):
    """注册推送设备"""
    
    serializer_class = PushDeviceCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


class DeactivatePushDeviceView(generics.UpdateAPIView):
    """停用推送设备"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, device_id):
        try:
            device = PushDevice.objects.get(
                device_id=device_id,
                user=request.user
            )
            device.is_active = False
            device.save()
            return Response({'message': '设备已停用'})
        except PushDevice.DoesNotExist:
            return Response(
                {'message': '设备不存在'},
                status=status.HTTP_404_NOT_FOUND
            )


class NotificationSubscribeView(generics.CreateAPIView):
    """订阅实时通知"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # 这里可以实现WebSocket连接逻辑
        # 或者返回WebSocket连接信息
        return Response({
            'message': '订阅成功',
            'websocket_url': f'ws://localhost:8000/ws/notifications/{request.user.id}/'
        })


class NotificationUnsubscribeView(generics.CreateAPIView):
    """取消订阅实时通知"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # 这里可以实现取消WebSocket连接逻辑
        return Response({'message': '取消订阅成功'})


class TestNotificationView(generics.CreateAPIView):
    """测试通知（仅开发环境）"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        if not settings.DEBUG:
            return Response(
                {'message': '此功能仅在开发环境可用'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        notification_type = request.data.get('type', 'system')
        title = request.data.get('title', '测试通知')
        message = request.data.get('message', '这是一条测试通知')
        
        notification = Notification.objects.create(
            recipient=request.user,
            sender=request.user,
            notification_type=notification_type,
            title=title,
            message=message,
            extra_data={'test': True}
        )
        
        serializer = NotificationSerializer(
            notification,
            context={'request': request}
        )
        
        return Response({
            'message': '测试通知创建成功',
            'notification': serializer.data
        })