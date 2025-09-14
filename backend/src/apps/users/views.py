from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from django.shortcuts import get_object_or_404
from .models import User, UserProfile
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    UserUpdateSerializer,
    UserProfileSerializer,
    PasswordChangeSerializer,
    UserListSerializer,
    EmailVerificationSerializer,
    EmailVerificationConfirmSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """用户注册视图"""
    
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # 自动发送邮箱验证邮件
        try:
            email_serializer = EmailVerificationSerializer(data={'email': user.email})
            if email_serializer.is_valid():
                email_serializer.save()
        except Exception:
            pass  # 邮件发送失败不影响注册流程
        
        # 生成JWT令牌
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': '注册成功，验证邮件已发送到您的邮箱'
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """用户登录视图"""
    
    serializer = UserLoginSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    
    user = serializer.validated_data['user']
    login(request, user)
    
    # 生成JWT令牌
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        },
        'message': '登录成功'
    })


@api_view(['POST'])
def logout_view(request):
    """用户登出视图"""
    
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': '登出成功'})
    except Exception:
        return Response({'error': '登出失败'}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """用户资料视图"""
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = UserUpdateSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'user': UserSerializer(instance).data,
            'message': '资料更新成功'
        })


class UserDetailView(generics.RetrieveAPIView):
    """用户详情视图"""
    
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    lookup_field = 'username'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class UserListView(generics.ListAPIView):
    """用户列表视图"""
    
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search')
        
        if search:
            queryset = queryset.filter(
                username__icontains=search
            ) | queryset.filter(
                first_name__icontains=search
            ) | queryset.filter(
                last_name__icontains=search
            )
        
        return queryset.order_by('-date_joined')


class UserProfileSettingsView(generics.RetrieveUpdateAPIView):
    """用户设置视图"""
    
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile


class PasswordChangeView(generics.GenericAPIView):
    """密码修改视图"""
    
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': '密码修改成功，请重新登录'
        })


@api_view(['GET'])
def user_stats_view(request, username):
    """用户统计信息视图"""
    
    user = get_object_or_404(User, username=username, is_active=True)
    
    stats = {
        'posts_count': user.posts_count,
        'followers_count': user.followers_count,
        'following_count': user.following_count,
        'likes_received': user.posts.aggregate(
            total_likes=models.Sum('likes_count')
        )['total_likes'] or 0,
    }
    
    return Response(stats)


@api_view(['POST'])
def upload_avatar_view(request):
    """头像上传视图"""
    
    if 'avatar' not in request.FILES:
        return Response(
            {'error': '请选择头像文件'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = request.user
    user.avatar = request.FILES['avatar']
    user.save()
    
    return Response({
        'avatar_url': user.get_avatar_url(),
        'message': '头像上传成功'
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def send_verification_email_view(request):
    """发送邮箱验证邮件"""
    
    serializer = EmailVerificationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    
    return Response({
        'message': '验证邮件已发送，请检查您的邮箱'
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_email_view(request):
    """验证邮箱"""
    
    serializer = EmailVerificationConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    
    return Response({
        'message': '邮箱验证成功',
        'user': UserSerializer(user).data
    })


@api_view(['POST'])
def resend_verification_email_view(request):
    """重新发送验证邮件"""
    
    user = request.user
    if user.email_verified:
        return Response(
            {'error': '邮箱已经验证过了'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = EmailVerificationSerializer(data={'email': user.email})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    
    return Response({
        'message': '验证邮件已重新发送'
    })