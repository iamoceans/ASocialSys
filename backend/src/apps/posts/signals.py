from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Post, Comment, Like
from apps.notifications.models import Notification


@receiver(post_save, sender=Like)
def create_like_notification(sender, instance, created, **kwargs):
    """当用户点赞时创建通知"""
    if created and instance.user != instance.content_object.author:
        # 获取被点赞内容的作者
        if hasattr(instance.content_object, 'author'):
            author = instance.content_object.author
            
            # 确定通知类型和消息
            if isinstance(instance.content_object, Post):
                notification_type = 'like_post'
                message = f'{instance.user.username} 点赞了你的帖子'
            elif isinstance(instance.content_object, Comment):
                notification_type = 'like_comment'
                message = f'{instance.user.username} 点赞了你的评论'
            else:
                return
            
            Notification.objects.create(
                recipient=author,
                sender=instance.user,
                notification_type=notification_type,
                message=message,
                content_type=ContentType.objects.get_for_model(instance.content_object),
                object_id=instance.content_object.id
            )


@receiver(post_delete, sender=Like)
def delete_like_notification(sender, instance, **kwargs):
    """当用户取消点赞时删除通知"""
    if hasattr(instance.content_object, 'author'):
        author = instance.content_object.author
        
        # 确定通知类型
        if isinstance(instance.content_object, Post):
            notification_type = 'like_post'
        elif isinstance(instance.content_object, Comment):
            notification_type = 'like_comment'
        else:
            return
        
        # 删除对应的通知
        Notification.objects.filter(
            recipient=author,
            sender=instance.user,
            notification_type=notification_type,
            content_type=ContentType.objects.get_for_model(instance.content_object),
            object_id=instance.content_object.id
        ).delete()


@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    """当用户评论时创建通知"""
    if created and instance.author != instance.post.author:
        Notification.objects.create(
            recipient=instance.post.author,
            sender=instance.author,
            notification_type='comment',
            message=f'{instance.author.username} 评论了你的帖子: {instance.content[:50]}...',
            content_type=ContentType.objects.get_for_model(instance),
            object_id=instance.id
        )


@receiver(post_save, sender=Post)
def create_post_notification(sender, instance, created, **kwargs):
    """当用户发布新帖子时，通知关注者"""
    if created:
        # 获取所有关注该用户的用户
        from apps.social.models import Follow
        followers = Follow.objects.filter(
            following=instance.author
        ).select_related('follower')
        
        # 为每个关注者创建通知
        notifications = []
        for follow in followers:
            notifications.append(
                Notification(
                    recipient=follow.follower,
                    sender=instance.author,
                    notification_type='new_post',
                    message=f'{instance.author.username} 发布了新帖子',
                    content_type=ContentType.objects.get_for_model(instance),
                    object_id=instance.id
                )
            )
        
        # 批量创建通知
        if notifications:
            Notification.objects.bulk_create(notifications)