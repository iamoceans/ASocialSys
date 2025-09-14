from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile


class UserRegistrationSerializer(serializers.ModelSerializer):
    """用户注册序列化器"""
    
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name'
        )
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("密码不匹配")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """用户登录序列化器"""
    
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'})
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError('邮箱或密码错误')
            
            if not user.is_active:
                raise serializers.ValidationError('账户已被禁用')
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('必须提供邮箱和密码')


class UserProfileSerializer(serializers.ModelSerializer):
    """用户资料序列化器"""
    
    class Meta:
        model = UserProfile
        fields = (
            'show_email', 'show_birth_date', 'allow_messages',
            'email_notifications', 'push_notifications',
            'theme', 'language'
        )


class UserSerializer(serializers.ModelSerializer):
    """用户信息序列化器"""
    
    profile = UserProfileSerializer(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'avatar', 'avatar_url', 'bio', 'location',
            'website', 'birth_date', 'followers_count', 'following_count',
            'posts_count', 'is_verified', 'is_private', 'date_joined',
            'profile'
        )
        read_only_fields = (
            'id', 'followers_count', 'following_count', 'posts_count',
            'is_verified', 'date_joined'
        )
    
    def get_avatar_url(self, obj):
        return obj.get_avatar_url()


class UserUpdateSerializer(serializers.ModelSerializer):
    """用户信息更新序列化器"""
    
    class Meta:
        model = User
        fields = (
            'first_name', 'last_name', 'bio', 'location',
            'website', 'birth_date', 'is_private'
        )
    
    def validate_website(self, value):
        if value and not value.startswith(('http://', 'https://')):
            value = 'https://' + value
        return value


class PasswordChangeSerializer(serializers.Serializer):
    """密码修改序列化器"""
    
    old_password = serializers.CharField(style={'input_type': 'password'})
    new_password = serializers.CharField(
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(style={'input_type': 'password'})
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('原密码错误')
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError('新密码不匹配')
        return attrs
    
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class UserListSerializer(serializers.ModelSerializer):
    """用户列表序列化器"""
    
    avatar_url = serializers.SerializerMethodField()
    full_name = serializers.ReadOnlyField()
    is_following = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'full_name', 'avatar_url', 'bio',
            'followers_count', 'following_count', 'posts_count',
            'is_verified', 'is_following'
        )
    
    def get_avatar_url(self, obj):
        return obj.get_avatar_url()
    
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user.following.filter(following=obj).exists()
        return False