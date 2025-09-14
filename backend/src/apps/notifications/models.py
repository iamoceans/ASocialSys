from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey


class Notification(models.Model):
    """通知模型"""
    
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('接收者')
    )
    
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_notifications',
        verbose_name=_('发送者'),
        null=True,
        blank=True
    )
    
    # 通知类型
    notification_type = models.CharField(
        _('通知类型'),
        max_length=50,
        choices=[
            ('like', _('点赞')),
            ('comment', _('评论')),
            ('follow', _('关注')),
            ('mention', _('提及')),
            ('repost', _('转发')),
            ('message', _('私信')),
            ('system', _('系统通知')),
        ]
    )
    
    title = models.CharField(_('标题'), max_length=200)
    message = models.TextField(_('消息内容'))
    
    # 关联对象 (使用GenericForeignKey)
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # 通知状态
    is_read = models.BooleanField(_('已读'), default=False)
    is_deleted = models.BooleanField(_('已删除'), default=False)
    
    # 额外数据
    extra_data = models.JSONField(_('额外数据'), default=dict, blank=True)
    
    # 时间戳
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    read_at = models.DateTimeField(_('阅读时间'), null=True, blank=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = _('通知')
        verbose_name_plural = _('通知')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['recipient', 'is_read', '-created_at']),
            models.Index(fields=['notification_type', '-created_at']),
        ]
    
    def __str__(self):
        return f'{self.recipient.username}: {self.title}'
    
    def mark_as_read(self):
        """标记为已读"""
        if not self.is_read:
            self.is_read = True
            self.read_at = models.timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def mark_as_unread(self):
        """标记为未读"""
        if self.is_read:
            self.is_read = False
            self.read_at = None
            self.save(update_fields=['is_read', 'read_at'])


class NotificationSettings(models.Model):
    """通知设置模型"""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_settings',
        verbose_name=_('用户')
    )
    
    # 邮件通知设置
    email_likes = models.BooleanField(_('邮件通知-点赞'), default=True)
    email_comments = models.BooleanField(_('邮件通知-评论'), default=True)
    email_follows = models.BooleanField(_('邮件通知-关注'), default=True)
    email_mentions = models.BooleanField(_('邮件通知-提及'), default=True)
    email_messages = models.BooleanField(_('邮件通知-私信'), default=True)
    email_system = models.BooleanField(_('邮件通知-系统'), default=True)
    
    # 推送通知设置
    push_likes = models.BooleanField(_('推送通知-点赞'), default=True)
    push_comments = models.BooleanField(_('推送通知-评论'), default=True)
    push_follows = models.BooleanField(_('推送通知-关注'), default=True)
    push_mentions = models.BooleanField(_('推送通知-提及'), default=True)
    push_messages = models.BooleanField(_('推送通知-私信'), default=True)
    push_system = models.BooleanField(_('推送通知-系统'), default=True)
    
    # 站内通知设置
    web_likes = models.BooleanField(_('站内通知-点赞'), default=True)
    web_comments = models.BooleanField(_('站内通知-评论'), default=True)
    web_follows = models.BooleanField(_('站内通知-关注'), default=True)
    web_mentions = models.BooleanField(_('站内通知-提及'), default=True)
    web_messages = models.BooleanField(_('站内通知-私信'), default=True)
    web_system = models.BooleanField(_('站内通知-系统'), default=True)
    
    # 免打扰时间
    quiet_hours_start = models.TimeField(_('免打扰开始时间'), null=True, blank=True)
    quiet_hours_end = models.TimeField(_('免打扰结束时间'), null=True, blank=True)
    
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        db_table = 'notification_settings'
        verbose_name = _('通知设置')
        verbose_name_plural = _('通知设置')
    
    def __str__(self):
        return f'{self.user.username}的通知设置'
    
    def is_notification_enabled(self, notification_type, channel='web'):
        """检查特定类型的通知是否启用"""
        field_name = f'{channel}_{notification_type}'
        return getattr(self, field_name, True)


class PushDevice(models.Model):
    """推送设备模型"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='push_devices',
        verbose_name=_('用户')
    )
    
    device_type = models.CharField(
        _('设备类型'),
        max_length=20,
        choices=[
            ('web', _('网页')),
            ('ios', _('iOS')),
            ('android', _('Android')),
        ]
    )
    
    device_token = models.TextField(_('设备令牌'))
    device_id = models.CharField(_('设备ID'), max_length=200, unique=True)
    
    # 设备信息
    user_agent = models.TextField(_('用户代理'), blank=True)
    app_version = models.CharField(_('应用版本'), max_length=50, blank=True)
    os_version = models.CharField(_('系统版本'), max_length=50, blank=True)
    
    # 状态
    is_active = models.BooleanField(_('激活状态'), default=True)
    
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    last_used = models.DateTimeField(_('最后使用时间'), auto_now=True)
    
    class Meta:
        db_table = 'push_devices'
        verbose_name = _('推送设备')
        verbose_name_plural = _('推送设备')
        unique_together = ['user', 'device_id']
    
    def __str__(self):
        return f'{self.user.username} - {self.device_type} - {self.device_id[:20]}'