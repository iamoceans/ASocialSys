from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


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