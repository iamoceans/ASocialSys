from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification, NotificationSettings, PushDevice
from apps.users.serializers import UserSerializer

User = get_user_model()


class NotificationSerializer(serializers.ModelSerializer):
    """通知序列化器"""
    
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    content_object_data = serializers.SerializerMethodField()
    time_since = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'sender', 'notification_type',
            'title', 'message', 'content_object_data',
            'is_read', 'is_deleted', 'extra_data',
            'created_at', 'read_at', 'time_since'
        ]
        read_only_fields = [
            'id', 'recipient', 'sender', 'created_at', 'read_at'
        ]
    
    def get_content_object_data(self, obj):
        """获取关联对象的数据"""
        if obj.content_object:
            content_obj = obj.content_object
            
            # 根据不同的对象类型返回不同的数据
            if hasattr(content_obj, '__class__'):
                model_name = content_obj.__class__.__name__.lower()
                
                if model_name == 'post':
                    return {
                        'type': 'post',
                        'id': content_obj.id,
                        'content': content_obj.content[:100] + '...' if len(content_obj.content) > 100 else content_obj.content,
                        'author': content_obj.author.username,
                        'created_at': content_obj.created_at
                    }
                elif model_name == 'comment':
                    return {
                        'type': 'comment',
                        'id': content_obj.id,
                        'content': content_obj.content[:100] + '...' if len(content_obj.content) > 100 else content_obj.content,
                        'author': content_obj.author.username,
                        'post_id': content_obj.post.id,
                        'created_at': content_obj.created_at
                    }
                elif model_name == 'user':
                    return {
                        'type': 'user',
                        'id': content_obj.id,
                        'username': content_obj.username,
                        'avatar': content_obj.avatar.url if content_obj.avatar else None
                    }
        
        return None
    
    def get_time_since(self, obj):
        """获取时间差"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return '刚刚'
        elif diff < timedelta(hours=1):
            return f'{diff.seconds // 60}分钟前'
        elif diff < timedelta(days=1):
            return f'{diff.seconds // 3600}小时前'
        elif diff < timedelta(days=7):
            return f'{diff.days}天前'
        else:
            return obj.created_at.strftime('%Y-%m-%d')


class NotificationListSerializer(serializers.ModelSerializer):
    """通知列表序列化器（简化版）"""
    
    sender = serializers.SerializerMethodField()
    time_since = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'sender', 'notification_type', 'title',
            'message', 'is_read', 'created_at', 'time_since'
        ]
    
    def get_sender(self, obj):
        """获取发送者信息"""
        if obj.sender:
            return {
                'id': obj.sender.id,
                'username': obj.sender.username,
                'avatar': obj.sender.avatar.url if obj.sender.avatar else None
            }
        return None
    
    def get_time_since(self, obj):
        """获取时间差"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return '刚刚'
        elif diff < timedelta(hours=1):
            return f'{diff.seconds // 60}分钟前'
        elif diff < timedelta(days=1):
            return f'{diff.seconds // 3600}小时前'
        elif diff < timedelta(days=7):
            return f'{diff.days}天前'
        else:
            return obj.created_at.strftime('%Y-%m-%d')


class NotificationCreateSerializer(serializers.ModelSerializer):
    """创建通知序列化器"""
    
    class Meta:
        model = Notification
        fields = [
            'recipient', 'notification_type', 'title',
            'message', 'extra_data'
        ]
    
    def create(self, validated_data):
        """创建通知"""
        request = self.context.get('request')
        if request and request.user:
            validated_data['sender'] = request.user
        
        return super().create(validated_data)


class NotificationSettingsSerializer(serializers.ModelSerializer):
    """通知设置序列化器"""
    
    class Meta:
        model = NotificationSettings
        fields = [
            'id', 'user',
            'email_likes', 'email_comments', 'email_follows',
            'email_mentions', 'email_messages', 'email_system',
            'push_likes', 'push_comments', 'push_follows',
            'push_mentions', 'push_messages', 'push_system',
            'web_likes', 'web_comments', 'web_follows',
            'web_mentions', 'web_messages', 'web_system',
            'quiet_hours_start', 'quiet_hours_end',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class NotificationSettingsUpdateSerializer(serializers.ModelSerializer):
    """更新通知设置序列化器"""
    
    class Meta:
        model = NotificationSettings
        fields = [
            'email_likes', 'email_comments', 'email_follows',
            'email_mentions', 'email_messages', 'email_system',
            'push_likes', 'push_comments', 'push_follows',
            'push_mentions', 'push_messages', 'push_system',
            'web_likes', 'web_comments', 'web_follows',
            'web_mentions', 'web_messages', 'web_system',
            'quiet_hours_start', 'quiet_hours_end'
        ]


class PushDeviceSerializer(serializers.ModelSerializer):
    """推送设备序列化器"""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = PushDevice
        fields = [
            'id', 'user', 'device_type', 'device_token',
            'device_id', 'user_agent', 'app_version',
            'os_version', 'is_active', 'created_at',
            'updated_at', 'last_used'
        ]
        read_only_fields = [
            'id', 'user', 'created_at', 'updated_at', 'last_used'
        ]


class PushDeviceCreateSerializer(serializers.ModelSerializer):
    """创建推送设备序列化器"""
    
    class Meta:
        model = PushDevice
        fields = [
            'device_type', 'device_token', 'device_id',
            'user_agent', 'app_version', 'os_version'
        ]
    
    def create(self, validated_data):
        """创建推送设备"""
        request = self.context.get('request')
        if request and request.user:
            validated_data['user'] = request.user
        
        # 如果设备已存在，则更新
        device_id = validated_data.get('device_id')
        user = validated_data.get('user')
        
        if device_id and user:
            device, created = PushDevice.objects.update_or_create(
                user=user,
                device_id=device_id,
                defaults=validated_data
            )
            return device
        
        return super().create(validated_data)


class NotificationStatsSerializer(serializers.Serializer):
    """通知统计序列化器"""
    
    total_count = serializers.IntegerField()
    unread_count = serializers.IntegerField()
    read_count = serializers.IntegerField()
    
    # 按类型统计
    like_count = serializers.IntegerField()
    comment_count = serializers.IntegerField()
    follow_count = serializers.IntegerField()
    mention_count = serializers.IntegerField()
    repost_count = serializers.IntegerField()
    message_count = serializers.IntegerField()
    system_count = serializers.IntegerField()
    
    # 最近7天的统计
    recent_count = serializers.IntegerField()


class BulkNotificationActionSerializer(serializers.Serializer):
    """批量通知操作序列化器"""
    
    ACTION_CHOICES = [
        ('mark_read', '标记为已读'),
        ('mark_unread', '标记为未读'),
        ('delete', '删除'),
    ]
    
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    action = serializers.ChoiceField(choices=ACTION_CHOICES)
    
    def validate_notification_ids(self, value):
        """验证通知ID列表"""
        if len(value) > 100:  # 限制批量操作的数量
            raise serializers.ValidationError('一次最多只能操作100条通知')
        
        request = self.context.get('request')
        if request and request.user:
            # 验证所有通知都属于当前用户
            user_notifications = Notification.objects.filter(
                id__in=value,
                recipient=request.user
            ).values_list('id', flat=True)
            
            if len(user_notifications) != len(value):
                raise serializers.ValidationError('包含不属于您的通知')
        
        return value