from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MaxLengthValidator


class Follow(models.Model):
    """关注关系模型"""
    
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='following',
        verbose_name=_('关注者')
    )
    
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='followers',
        verbose_name=_('被关注者')
    )
    
    created_at = models.DateTimeField(_('关注时间'), auto_now_add=True)
    
    class Meta:
        db_table = 'follows'
        verbose_name = _('关注关系')
        verbose_name_plural = _('关注关系')
        unique_together = ['follower', 'following']
        indexes = [
            models.Index(fields=['follower', '-created_at']),
            models.Index(fields=['following', '-created_at']),
        ]
    
    def __str__(self):
        return f'{self.follower.username} 关注了 {self.following.username}'
    
    def save(self, *args, **kwargs):
        # 防止自己关注自己
        if self.follower == self.following:
            raise ValueError(_('不能关注自己'))
        super().save(*args, **kwargs)


class Block(models.Model):
    """屏蔽关系模型"""
    
    blocker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blocking',
        verbose_name=_('屏蔽者')
    )
    
    blocked = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blocked_by',
        verbose_name=_('被屏蔽者')
    )
    
    reason = models.CharField(
        _('屏蔽原因'),
        max_length=200,
        blank=True,
        choices=[
            ('spam', _('垃圾信息')),
            ('harassment', _('骚扰')),
            ('inappropriate', _('不当内容')),
            ('other', _('其他')),
        ]
    )
    
    created_at = models.DateTimeField(_('屏蔽时间'), auto_now_add=True)
    
    class Meta:
        db_table = 'blocks'
        verbose_name = _('屏蔽关系')
        verbose_name_plural = _('屏蔽关系')
        unique_together = ['blocker', 'blocked']
    
    def __str__(self):
        return f'{self.blocker.username} 屏蔽了 {self.blocked.username}'
    
    def save(self, *args, **kwargs):
        # 防止自己屏蔽自己
        if self.blocker == self.blocked:
            raise ValueError(_('不能屏蔽自己'))
        super().save(*args, **kwargs)


class Conversation(models.Model):
    """私信会话模型"""
    
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='conversations',
        verbose_name=_('参与者')
    )
    
    title = models.CharField(_('会话标题'), max_length=100, blank=True)
    
    # 最后一条消息
    last_message = models.ForeignKey(
        'Message',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
        verbose_name=_('最后一条消息')
    )
    
    last_activity = models.DateTimeField(_('最后活动时间'), auto_now=True)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    
    class Meta:
        db_table = 'conversations'
        verbose_name = _('私信会话')
        verbose_name_plural = _('私信会话')
        ordering = ['-last_activity']
    
    def __str__(self):
        participants_names = ', '.join([user.username for user in self.participants.all()[:3]])
        return f'会话: {participants_names}'
    
    @property
    def is_group_chat(self):
        """是否为群聊"""
        return self.participants.count() > 2


class Message(models.Model):
    """私信消息模型"""
    
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name=_('会话')
    )
    
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        verbose_name=_('发送者')
    )
    
    content = models.TextField(
        _('消息内容'),
        validators=[MaxLengthValidator(1000)]
    )
    
    # 消息类型
    message_type = models.CharField(
        _('消息类型'),
        max_length=20,
        choices=[
            ('text', _('文本')),
            ('image', _('图片')),
            ('file', _('文件')),
            ('system', _('系统消息')),
        ],
        default='text'
    )
    
    # 附件
    attachment = models.FileField(_('附件'), upload_to='messages/', blank=True, null=True)
    
    # 消息状态
    is_deleted = models.BooleanField(_('已删除'), default=False)
    is_edited = models.BooleanField(_('已编辑'), default=False)
    
    # 时间戳
    created_at = models.DateTimeField(_('发送时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        db_table = 'messages'
        verbose_name = _('私信消息')
        verbose_name_plural = _('私信消息')
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['sender', '-created_at']),
        ]
    
    def __str__(self):
        return f'{self.sender.username}: {self.content[:50]}...'
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # 更新会话的最后消息
        self.conversation.last_message = self
        self.conversation.save(update_fields=['last_message', 'last_activity'])


class MessageRead(models.Model):
    """消息已读状态模型"""
    
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='read_by',
        verbose_name=_('消息')
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='read_messages',
        verbose_name=_('用户')
    )
    
    read_at = models.DateTimeField(_('阅读时间'), auto_now_add=True)
    
    class Meta:
        db_table = 'message_reads'
        verbose_name = _('消息已读状态')
        verbose_name_plural = _('消息已读状态')
        unique_together = ['message', 'user']
    
    def __str__(self):
        return f'{self.user.username} 已读消息 {self.message.id}'


class Report(models.Model):
    """举报模型"""
    
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports_made',
        verbose_name=_('举报者')
    )
    
    # 举报对象 (可以是用户、帖子、评论等)
    content_type = models.CharField(
        _('举报类型'),
        max_length=20,
        choices=[
            ('user', _('用户')),
            ('post', _('帖子')),
            ('comment', _('评论')),
            ('message', _('私信')),
        ]
    )
    
    object_id = models.PositiveIntegerField(_('对象ID'))
    
    reason = models.CharField(
        _('举报原因'),
        max_length=50,
        choices=[
            ('spam', _('垃圾信息')),
            ('harassment', _('骚扰')),
            ('hate_speech', _('仇恨言论')),
            ('violence', _('暴力内容')),
            ('inappropriate', _('不当内容')),
            ('copyright', _('版权侵犯')),
            ('other', _('其他')),
        ]
    )
    
    description = models.TextField(_('详细描述'), blank=True)
    
    # 处理状态
    status = models.CharField(
        _('处理状态'),
        max_length=20,
        choices=[
            ('pending', _('待处理')),
            ('reviewing', _('审核中')),
            ('resolved', _('已解决')),
            ('rejected', _('已拒绝')),
        ],
        default='pending'
    )
    
    # 处理结果
    resolution = models.TextField(_('处理结果'), blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports_resolved',
        verbose_name=_('处理人')
    )
    resolved_at = models.DateTimeField(_('处理时间'), null=True, blank=True)
    
    created_at = models.DateTimeField(_('举报时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        db_table = 'reports'
        verbose_name = _('举报')
        verbose_name_plural = _('举报')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['content_type', 'object_id']),
        ]
    
    def __str__(self):
        return f'{self.reporter.username} 举报了 {self.content_type} {self.object_id}'