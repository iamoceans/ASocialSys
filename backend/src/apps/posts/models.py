from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MaxLengthValidator


class Post(models.Model):
    """帖子模型"""
    
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts',
        verbose_name=_('作者')
    )
    
    content = models.TextField(
        _('内容'),
        validators=[MaxLengthValidator(280)],
        help_text=_('最多280个字符')
    )
    
    # 媒体文件
    images = models.JSONField(_('图片'), default=list, blank=True)
    video = models.FileField(_('视频'), upload_to='videos/', blank=True, null=True)
    
    # 统计数据
    likes_count = models.PositiveIntegerField(_('点赞数'), default=0)
    comments_count = models.PositiveIntegerField(_('评论数'), default=0)
    shares_count = models.PositiveIntegerField(_('分享数'), default=0)
    views_count = models.PositiveIntegerField(_('浏览数'), default=0)
    
    # 帖子状态
    is_pinned = models.BooleanField(_('置顶'), default=False)
    is_deleted = models.BooleanField(_('已删除'), default=False)
    
    # 回复相关
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        verbose_name=_('父帖子')
    )
    
    # 转发相关
    original_post = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='reposts',
        verbose_name=_('原帖')
    )
    
    # 时间戳
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        db_table = 'posts'
        verbose_name = _('帖子')
        verbose_name_plural = _('帖子')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['author', '-created_at']),
            models.Index(fields=['is_deleted', '-created_at']),
        ]
    
    def __str__(self):
        return f'{self.author.username}: {self.content[:50]}...'
    
    @property
    def is_reply(self):
        """是否为回复"""
        return self.parent is not None
    
    @property
    def is_repost(self):
        """是否为转发"""
        return self.original_post is not None
    
    def get_display_content(self):
        """获取显示内容"""
        if self.is_deleted:
            return _('此帖子已被删除')
        return self.content


class PostImage(models.Model):
    """帖子图片模型"""
    
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='post_images',
        verbose_name=_('帖子')
    )
    
    image = models.ImageField(_('图片'), upload_to='posts/images/')
    alt_text = models.CharField(_('替代文本'), max_length=200, blank=True)
    order = models.PositiveSmallIntegerField(_('排序'), default=0)
    
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    
    class Meta:
        db_table = 'post_images'
        verbose_name = _('帖子图片')
        verbose_name_plural = _('帖子图片')
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f'{self.post.id} - 图片 {self.order}'


class Like(models.Model):
    """点赞模型"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='likes',
        verbose_name=_('用户')
    )
    
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='post_likes',
        verbose_name=_('帖子')
    )
    
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    
    class Meta:
        db_table = 'likes'
        verbose_name = _('点赞')
        verbose_name_plural = _('点赞')
        unique_together = ['user', 'post']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['post', '-created_at']),
        ]
    
    def __str__(self):
        return f'{self.user.username} 点赞了 {self.post.id}'


class Comment(models.Model):
    """评论模型"""
    
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name=_('作者')
    )
    
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='post_comments',
        verbose_name=_('帖子')
    )
    
    content = models.TextField(
        _('内容'),
        validators=[MaxLengthValidator(280)]
    )
    
    # 回复评论
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        verbose_name=_('父评论')
    )
    
    # 统计数据
    likes_count = models.PositiveIntegerField(_('点赞数'), default=0)
    replies_count = models.PositiveIntegerField(_('回复数'), default=0)
    
    # 状态
    is_deleted = models.BooleanField(_('已删除'), default=False)
    
    # 时间戳
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        db_table = 'comments'
        verbose_name = _('评论')
        verbose_name_plural = _('评论')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['post', '-created_at']),
            models.Index(fields=['author', '-created_at']),
        ]
    
    def __str__(self):
        return f'{self.author.username}: {self.content[:50]}...'
    
    @property
    def is_reply(self):
        """是否为回复评论"""
        return self.parent is not None


class CommentLike(models.Model):
    """评论点赞模型"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comment_likes',
        verbose_name=_('用户')
    )
    
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name='comment_likes',
        verbose_name=_('评论')
    )
    
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    
    class Meta:
        db_table = 'comment_likes'
        verbose_name = _('评论点赞')
        verbose_name_plural = _('评论点赞')
        unique_together = ['user', 'comment']
    
    def __str__(self):
        return f'{self.user.username} 点赞了评论 {self.comment.id}'


class Hashtag(models.Model):
    """话题标签模型"""
    
    name = models.CharField(_('标签名'), max_length=100, unique=True)
    posts_count = models.PositiveIntegerField(_('帖子数'), default=0)
    
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        db_table = 'hashtags'
        verbose_name = _('话题标签')
        verbose_name_plural = _('话题标签')
        ordering = ['-posts_count', 'name']
    
    def __str__(self):
        return f'#{self.name}'


class PostHashtag(models.Model):
    """帖子标签关联模型"""
    
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='hashtags',
        verbose_name=_('帖子')
    )
    
    hashtag = models.ForeignKey(
        Hashtag,
        on_delete=models.CASCADE,
        related_name='posts',
        verbose_name=_('标签')
    )
    
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    
    class Meta:
        db_table = 'post_hashtags'
        verbose_name = _('帖子标签')
        verbose_name_plural = _('帖子标签')
        unique_together = ['post', 'hashtag']
    
    def __str__(self):
        return f'{self.post.id} - {self.hashtag.name}'