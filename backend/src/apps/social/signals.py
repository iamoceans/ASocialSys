from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Follow
from apps.notifications.models import Notification


@receiver(post_save, sender=Follow)
def create_follow_notification(sender, instance, created, **kwargs):
    """当用户关注其他用户时创建通知"""
    if created:
        Notification.objects.create(
            recipient=instance.following,
            sender=instance.follower,
            notification_type='follow',
            message=f'{instance.follower.username} 开始关注你',
            content_type=ContentType.objects.get_for_model(instance),
            object_id=instance.id
        )


@receiver(post_delete, sender=Follow)
def delete_follow_notification(sender, instance, **kwargs):
    """当用户取消关注时删除通知"""
    Notification.objects.filter(
        recipient=instance.following,
        sender=instance.follower,
        notification_type='follow',
        content_type=ContentType.objects.get_for_model(instance),
        object_id=instance.id
    ).delete()