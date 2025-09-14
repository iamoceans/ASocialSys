from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Follow, Block, Conversation, Message, MessageRead, Report
from apps.users.serializers import UserSerializer

User = get_user_model()


class FollowSerializer(serializers.ModelSerializer):
    """关注关系序列化器"""
    
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)
    
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']
        read_only_fields = ['id', 'created_at']


class FollowCreateSerializer(serializers.ModelSerializer):
    """创建关注关系序列化器"""
    
    class Meta:
        model = Follow
        fields = ['following']
    
    def validate_following(self, value):
        """验证关注对象"""
        request = self.context.get('request')
        if request and request.user == value:
            raise serializers.ValidationError("不能关注自己")
        return value
    
    def create(self, validated_data):
        """创建关注关系"""
        request = self.context.get('request')
        validated_data['follower'] = request.user
        return super().create(validated_data)


class BlockSerializer(serializers.ModelSerializer):
    """屏蔽关系序列化器"""
    
    blocker = UserSerializer(read_only=True)
    blocked = UserSerializer(read_only=True)
    
    class Meta:
        model = Block
        fields = ['id', 'blocker', 'blocked', 'reason', 'created_at']
        read_only_fields = ['id', 'created_at']


class BlockCreateSerializer(serializers.ModelSerializer):
    """创建屏蔽关系序列化器"""
    
    class Meta:
        model = Block
        fields = ['blocked', 'reason']
    
    def validate_blocked(self, value):
        """验证屏蔽对象"""
        request = self.context.get('request')
        if request and request.user == value:
            raise serializers.ValidationError("不能屏蔽自己")
        return value
    
    def create(self, validated_data):
        """创建屏蔽关系"""
        request = self.context.get('request')
        validated_data['blocker'] = request.user
        return super().create(validated_data)


class ConversationSerializer(serializers.ModelSerializer):
    """对话序列化器"""
    
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'is_group', 'group_name', 
            'group_avatar', 'created_at', 'updated_at',
            'last_message', 'unread_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_last_message(self, obj):
        """获取最后一条消息"""
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return {
                'id': last_message.id,
                'content': last_message.content,
                'sender': last_message.sender.username,
                'created_at': last_message.created_at
            }
        return None
    
    def get_unread_count(self, obj):
        """获取未读消息数"""
        request = self.context.get('request')
        if request and request.user:
            return obj.get_unread_count(request.user)
        return 0


class ConversationCreateSerializer(serializers.ModelSerializer):
    """创建对话序列化器"""
    
    participants = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True
    )
    
    class Meta:
        model = Conversation
        fields = ['participants', 'is_group', 'group_name', 'group_avatar']
    
    def validate_participants(self, value):
        """验证参与者"""
        if len(value) < 1:
            raise serializers.ValidationError("至少需要一个参与者")
        
        request = self.context.get('request')
        if request and request.user not in value:
            value.append(request.user)
        
        return value
    
    def create(self, validated_data):
        """创建对话"""
        participants = validated_data.pop('participants')
        conversation = Conversation.objects.create(**validated_data)
        conversation.participants.set(participants)
        return conversation


class MessageSerializer(serializers.ModelSerializer):
    """消息序列化器"""
    
    sender = UserSerializer(read_only=True)
    is_read = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'content', 'message_type',
            'file_url', 'reply_to', 'is_deleted', 'created_at', 'updated_at',
            'is_read'
        ]
        read_only_fields = ['id', 'sender', 'created_at', 'updated_at']
    
    def get_is_read(self, obj):
        """获取消息是否已读"""
        request = self.context.get('request')
        if request and request.user:
            return MessageRead.objects.filter(
                message=obj,
                user=request.user
            ).exists()
        return False


class MessageCreateSerializer(serializers.ModelSerializer):
    """创建消息序列化器"""
    
    class Meta:
        model = Message
        fields = ['conversation', 'content', 'message_type', 'file_url', 'reply_to']
    
    def validate_conversation(self, value):
        """验证对话"""
        request = self.context.get('request')
        if request and request.user not in value.participants.all():
            raise serializers.ValidationError("您不是此对话的参与者")
        return value
    
    def create(self, validated_data):
        """创建消息"""
        request = self.context.get('request')
        validated_data['sender'] = request.user
        message = super().create(validated_data)
        
        # 更新对话的最后更新时间
        conversation = message.conversation
        conversation.save(update_fields=['updated_at'])
        
        return message


class MessageReadSerializer(serializers.ModelSerializer):
    """消息已读状态序列化器"""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = MessageRead
        fields = ['id', 'message', 'user', 'read_at']
        read_only_fields = ['id', 'user', 'read_at']


class ReportSerializer(serializers.ModelSerializer):
    """举报序列化器"""
    
    reporter = UserSerializer(read_only=True)
    reported_user = UserSerializer(read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'reporter', 'reported_user', 'reported_post',
            'reported_comment', 'reason', 'description',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reporter', 'created_at', 'updated_at']


class ReportCreateSerializer(serializers.ModelSerializer):
    """创建举报序列化器"""
    
    class Meta:
        model = Report
        fields = [
            'reported_user', 'reported_post', 'reported_comment',
            'reason', 'description'
        ]
    
    def validate(self, data):
        """验证举报数据"""
        reported_user = data.get('reported_user')
        reported_post = data.get('reported_post')
        reported_comment = data.get('reported_comment')
        
        # 至少需要举报一个对象
        if not any([reported_user, reported_post, reported_comment]):
            raise serializers.ValidationError(
                "至少需要举报一个对象（用户、帖子或评论）"
            )
        
        # 不能举报自己
        request = self.context.get('request')
        if request and reported_user == request.user:
            raise serializers.ValidationError("不能举报自己")
        
        return data
    
    def create(self, validated_data):
        """创建举报"""
        request = self.context.get('request')
        validated_data['reporter'] = request.user
        return super().create(validated_data)


class UserStatsSerializer(serializers.Serializer):
    """用户统计信息序列化器"""
    
    followers_count = serializers.IntegerField()
    following_count = serializers.IntegerField()
    posts_count = serializers.IntegerField()
    likes_received_count = serializers.IntegerField()