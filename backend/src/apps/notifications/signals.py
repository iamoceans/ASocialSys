from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from datetime import timedelta
import re
import logging

from apps.posts.models import Post, Comment, Like
from apps.social.models import Follow
from .tasks import (
    create_like_notification,
    create_comment_notification,
    create_follow_notification,
    create_mention_notification
)
from .models import Notification

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Like)
def handle_like_created(sender, instance, created, **kwargs):
    """处理点赞创建事件"""
    if created:
        # 异步创建点赞通知
        create_like_notification.delay(instance.id)


@receiver(post_delete, sender=Like)
def handle_like_deleted(sender, instance, **kwargs):
    """处理点赞删除事件"""
    try:
        # 删除相关的点赞通知
        content_type = ContentType.objects.get_for_model(instance.post)
        Notification.objects.filter(
            sender=instance.user,
            recipient=instance.post.author,
            notification_type='like',
            content_type=content_type,
            object_id=instance.post.id,
            created_at__gte=timezone.now() - timedelta(hours=24)  # 只删除24小时内的通知
        ).delete()
        
        logger.info(f'删除了用户 {instance.user.username} 对帖子 {instance.post.id} 的点赞通知')
        
    except Exception as e:
        logger.error(f'删除点赞通知失败: {e}')


@receiver(post_save, sender=Comment)
def handle_comment_created(sender, instance, created, **kwargs):
    """处理评论创建事件"""
    if created:
        # 异步创建评论通知
        create_comment_notification.delay(instance.id)
        
        # 检查评论中是否有提及其他用户
        mentioned_usernames = extract_mentions(instance.content)
        if mentioned_usernames:
            create_mention_notification.delay(instance.post.id, mentioned_usernames)


@receiver(post_save, sender=Post)
def handle_post_created(sender, instance, created, **kwargs):
    """处理帖子创建事件"""
    if created:
        # 检查帖子内容中是否有提及其他用户
        mentioned_usernames = extract_mentions(instance.content)
        if mentioned_usernames:
            create_mention_notification.delay(instance.id, mentioned_usernames)


@receiver(post_save, sender=Follow)
def handle_follow_created(sender, instance, created, **kwargs):
    """处理关注创建事件"""
    if created:
        # 异步创建关注通知
        create_follow_notification.delay(instance.id)


@receiver(post_delete, sender=Follow)
def handle_follow_deleted(sender, instance, **kwargs):
    """处理取消关注事件"""
    try:
        # 删除相关的关注通知
        content_type = ContentType.objects.get_for_model(instance.follower)
        Notification.objects.filter(
            sender=instance.follower,
            recipient=instance.following,
            notification_type='follow',
            content_type=content_type,
            object_id=instance.follower.id,
            created_at__gte=timezone.now() - timedelta(hours=24)  # 只删除24小时内的通知
        ).delete()
        
        logger.info(f'删除了用户 {instance.follower.username} 关注 {instance.following.username} 的通知')
        
    except Exception as e:
        logger.error(f'删除关注通知失败: {e}')


def extract_mentions(text):
    """从文本中提取@用户名"""
    if not text:
        return []
    
    # 匹配@用户名的正则表达式
    # 支持中文、英文、数字、下划线
    mention_pattern = r'@([\w\u4e00-\u9fa5]+)'
    matches = re.findall(mention_pattern, text)
    
    # 去重并返回
    return list(set(matches))


@receiver(post_save, sender=Notification)
def handle_notification_created(sender, instance, created, **kwargs):
    """处理通知创建事件"""
    if created:
        logger.info(
            f'创建通知: {instance.notification_type} - '
            f'发送者: {instance.sender.username if instance.sender else "系统"} - '
            f'接收者: {instance.recipient.username}'
        )
        
        # 可以在这里添加实时通知推送逻辑
        # 例如通过WebSocket推送给在线用户
        send_realtime_notification(instance)


def send_realtime_notification(notification):
    """发送实时通知"""
    try:
        # 这里可以集成WebSocket或Server-Sent Events
        # 向在线用户推送实时通知
        
        # 示例：使用Django Channels
        # from channels.layers import get_channel_layer
        # from asgiref.sync import async_to_sync
        # 
        # channel_layer = get_channel_layer()
        # group_name = f'user_{notification.recipient.id}'
        # 
        # async_to_sync(channel_layer.group_send)(
        #     group_name,
        #     {
        #         'type': 'notification_message',
        #         'notification': {
        #             'id': notification.id,
        #             'type': notification.notification_type,
        #             'title': notification.title,
        #             'message': notification.message,
        #             'created_at': notification.created_at.isoformat(),
        #             'sender': {
        #                 'id': notification.sender.id if notification.sender else None,
        #                 'username': notification.sender.username if notification.sender else None,
        #                 'avatar': notification.sender.profile.avatar.url if notification.sender and notification.sender.profile.avatar else None,
        #             } if notification.sender else None
        #         }
        #     }
        # )
        
        logger.info(f'实时通知已推送给用户 {notification.recipient.username}')
        
    except Exception as e:
        logger.error(f'发送实时通知失败: {e}')


# 批量操作的信号处理
@receiver(post_save, sender=Post)
def handle_post_updated(sender, instance, created, **kwargs):
    """处理帖子更新事件"""
    if not created:
        # 如果帖子被编辑，检查是否有新的提及
        mentioned_usernames = extract_mentions(instance.content)
        if mentioned_usernames:
            # 检查是否已经为这些用户创建过提及通知
            existing_mentions = Notification.objects.filter(
                notification_type='mention',
                content_type=ContentType.objects.get_for_model(Post),
                object_id=instance.id,
                sender=instance.author
            ).values_list('recipient__username', flat=True)
            
            # 只为新提及的用户创建通知
            new_mentions = [username for username in mentioned_usernames 
                          if username not in existing_mentions]
            
            if new_mentions:
                create_mention_notification.delay(instance.id, new_mentions)


# 系统通知相关信号
def create_system_notification(recipient, title, message, notification_type='system', 
                             content_object=None, action_url=None):
    """创建系统通知的辅助函数"""
    try:
        notification = Notification.objects.create(
            recipient=recipient,
            sender=None,  # 系统通知没有发送者
            notification_type=notification_type,
            title=title,
            message=message,
            content_object=content_object,
            action_url=action_url
        )
        
        logger.info(f'创建系统通知给用户 {recipient.username}: {title}')
        return notification
        
    except Exception as e:
        logger.error(f'创建系统通知失败: {e}')
        return None


# 用户相关事件的通知
from django.contrib.auth import get_user_model
User = get_user_model()


@receiver(post_save, sender=User)
def handle_user_created(sender, instance, created, **kwargs):
    """处理用户注册事件"""
    if created:
        # 创建欢迎通知
        create_system_notification(
            recipient=instance,
            title='欢迎加入社交系统！',
            message='欢迎来到我们的社交平台！开始探索和分享你的精彩内容吧。',
            notification_type='welcome'
        )
        
        logger.info(f'为新用户 {instance.username} 创建欢迎通知')


# 内容审核相关通知
def create_moderation_notification(user, content_type, action, reason=None):
    """创建内容审核通知"""
    action_map = {
        'approved': '已通过审核',
        'rejected': '未通过审核',
        'flagged': '被标记需要审核',
        'removed': '已被移除'
    }
    
    title = f'您的{content_type}{action_map.get(action, action)}'
    message = f'您的{content_type}{action_map.get(action, action)}'
    
    if reason:
        message += f'，原因：{reason}'
    
    create_system_notification(
        recipient=user,
        title=title,
        message=message,
        notification_type='moderation'
    )


# 安全相关通知
def create_security_notification(user, event_type, details=None):
    """创建安全相关通知"""
    event_map = {
        'login_new_device': '新设备登录',
        'password_changed': '密码已更改',
        'email_changed': '邮箱已更改',
        'suspicious_activity': '检测到可疑活动'
    }
    
    title = f'安全提醒：{event_map.get(event_type, event_type)}'
    message = f'您的账户{event_map.get(event_type, event_type)}'
    
    if details:
        message += f'，详情：{details}'
    
    create_system_notification(
        recipient=user,
        title=title,
        message=message,
        notification_type='security'
    )