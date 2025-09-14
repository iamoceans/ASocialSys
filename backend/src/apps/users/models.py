from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    """自定义用户模型"""
    
    email = models.EmailField(_('邮箱'), unique=True)
    avatar = models.ImageField(_('头像'), upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(_('个人简介'), max_length=500, blank=True)
    location = models.CharField(_('位置'), max_length=100, blank=True)
    website = models.URLField(_('个人网站'), blank=True)
    birth_date = models.DateField(_('生日'), blank=True, null=True)
    
    # 社交统计
    followers_count = models.PositiveIntegerField(_('粉丝数'), default=0)
    following_count = models.PositiveIntegerField(_('关注数'), default=0)
    posts_count = models.PositiveIntegerField(_('帖子数'), default=0)
    
    # 账户状态
    is_verified = models.BooleanField(_('已验证'), default=False)
    is_private = models.BooleanField(_('私密账户'), default=False)
    email_verified = models.BooleanField(_('邮箱已验证'), default=False)
    
    # 时间戳
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        verbose_name = _('用户')
        verbose_name_plural = _('用户')
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.username} ({self.email})'
    
    @property
    def full_name(self):
        """获取用户全名"""
        return f'{self.first_name} {self.last_name}'.strip() or self.username
    
    def get_avatar_url(self):
        """获取头像URL"""
        if self.avatar:
            return self.avatar.url
        return '/static/images/default-avatar.png'
    
    def generate_verification_token(self):
        """生成邮箱验证令牌"""
        token = get_random_string(32)
        EmailVerification.objects.filter(user=self).delete()  # 删除旧的验证记录
        EmailVerification.objects.create(
            user=self,
            token=token,
            expires_at=timezone.now() + timedelta(hours=24)
        )
        return token


class UserProfile(models.Model):
    """用户扩展资料"""
    
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='profile',
        verbose_name=_('用户')
    )
    
    # 隐私设置
    show_email = models.BooleanField(_('显示邮箱'), default=False)
    show_birth_date = models.BooleanField(_('显示生日'), default=False)
    allow_messages = models.BooleanField(_('允许私信'), default=True)
    
    # 通知设置
    email_notifications = models.BooleanField(_('邮件通知'), default=True)
    push_notifications = models.BooleanField(_('推送通知'), default=True)
    
    # 主题设置
    theme = models.CharField(
        _('主题'),
        max_length=20,
        choices=[
            ('light', _('浅色')),
            ('dark', _('深色')),
            ('auto', _('自动')),
        ],
        default='light'
    )
    
    # 语言设置
    language = models.CharField(
        _('语言'),
        max_length=10,
        choices=[
            ('zh-hans', _('简体中文')),
            ('en', _('English')),
        ],
        default='zh-hans'
    )
    
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = _('用户资料')
        verbose_name_plural = _('用户资料')
    
    def __str__(self):
        return f'{self.user.username}的资料'


class EmailVerification(models.Model):
    """邮箱验证模型"""
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='email_verifications',
        verbose_name=_('用户')
    )
    token = models.CharField(_('验证令牌'), max_length=32, unique=True)
    expires_at = models.DateTimeField(_('过期时间'))
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    
    class Meta:
        db_table = 'email_verifications'
        verbose_name = _('邮箱验证')
        verbose_name_plural = _('邮箱验证')
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.user.email}的验证令牌'
    
    def is_expired(self):
        """检查令牌是否过期"""
        return timezone.now() > self.expires_at
    
    @classmethod
    def verify_token(cls, token):
        """验证令牌"""
        try:
            verification = cls.objects.get(token=token)
            if verification.is_expired():
                verification.delete()
                return None, '验证链接已过期'
            
            user = verification.user
            user.email_verified = True
            user.save()
            verification.delete()
            return user, '邮箱验证成功'
        except cls.DoesNotExist:
            return None, '无效的验证链接'