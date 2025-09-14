from celery import shared_task
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import logging

from .models import Notification, NotificationSettings, PushDevice
from apps.posts.models import Post, Comment, Like
from apps.social.models import Follow

User = get_user_model()
logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_notification_email(self, notification_id):
    """发送通知邮件"""
    try:
        notification = Notification.objects.get(id=notification_id)
        user = notification.recipient
        
        # 检查用户是否启用邮件通知
        settings_obj, _ = NotificationSettings.objects.get_or_create(user=user)
        
        notification_type = notification.notification_type
        email_enabled = getattr(settings_obj, f'email_{notification_type}', True)
        
        if not email_enabled:
            logger.info(f'用户 {user.username} 已禁用 {notification_type} 类型的邮件通知')
            return
        
        # 检查免打扰时间
        if settings_obj.is_in_do_not_disturb_period():
            logger.info(f'用户 {user.username} 当前处于免打扰时间段')
            return
        
        # 准备邮件内容
        subject = f'[社交系统] {notification.title}'
        
        context = {
            'user': user,
            'notification': notification,
            'site_name': '社交系统',
            'site_url': settings.FRONTEND_URL,
        }
        
        # 渲染邮件模板
        html_message = render_to_string(
            f'notifications/email/{notification_type}.html',
            context
        )
        plain_message = render_to_string(
            f'notifications/email/{notification_type}.txt',
            context
        )
        
        # 发送邮件
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False
        )
        
        logger.info(f'成功发送通知邮件给用户 {user.username}')
        
    except Notification.DoesNotExist:
        logger.error(f'通知 {notification_id} 不存在')
    except Exception as exc:
        logger.error(f'发送通知邮件失败: {exc}')
        # 重试任务
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


@shared_task(bind=True, max_retries=3)
def send_push_notification(self, notification_id):
    """发送推送通知"""
    try:
        notification = Notification.objects.get(id=notification_id)
        user = notification.recipient
        
        # 检查用户是否启用推送通知
        settings_obj, _ = NotificationSettings.objects.get_or_create(user=user)
        
        notification_type = notification.notification_type
        push_enabled = getattr(settings_obj, f'push_{notification_type}', True)
        
        if not push_enabled:
            logger.info(f'用户 {user.username} 已禁用 {notification_type} 类型的推送通知')
            return
        
        # 检查免打扰时间
        if settings_obj.is_in_do_not_disturb_period():
            logger.info(f'用户 {user.username} 当前处于免打扰时间段')
            return
        
        # 获取用户的活跃设备
        devices = PushDevice.objects.filter(
            user=user,
            is_active=True
        )
        
        if not devices.exists():
            logger.info(f'用户 {user.username} 没有活跃的推送设备')
            return
        
        # 准备推送内容
        push_data = {
            'title': notification.title,
            'body': notification.message,
            'data': {
                'notification_id': notification.id,
                'type': notification.notification_type,
                'url': f'/notifications/{notification.id}'
            }
        }
        
        # 发送推送到各个设备
        for device in devices:
            try:
                if device.device_type == 'web':
                    # Web推送
                    send_web_push(device.device_token, push_data)
                elif device.device_type == 'ios':
                    # iOS推送
                    send_ios_push(device.device_token, push_data)
                elif device.device_type == 'android':
                    # Android推送
                    send_android_push(device.device_token, push_data)
                
                # 更新设备最后使用时间
                device.last_used = timezone.now()
                device.save(update_fields=['last_used'])
                
            except Exception as e:
                logger.error(f'向设备 {device.device_id} 发送推送失败: {e}')
                # 如果推送失败多次，可以考虑停用设备
                continue
        
        logger.info(f'成功发送推送通知给用户 {user.username}')
        
    except Notification.DoesNotExist:
        logger.error(f'通知 {notification_id} 不存在')
    except Exception as exc:
        logger.error(f'发送推送通知失败: {exc}')
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


def send_web_push(token, data):
    """发送Web推送"""
    # 这里实现Web推送逻辑
    # 可以使用pywebpush库
    pass


def send_ios_push(token, data):
    """发送iOS推送"""
    # 这里实现iOS推送逻辑
    # 可以使用APNs
    pass


def send_android_push(token, data):
    """发送Android推送"""
    # 这里实现Android推送逻辑
    # 可以使用FCM
    pass


@shared_task
def create_like_notification(like_id):
    """创建点赞通知"""
    try:
        like = Like.objects.select_related('user', 'post__author').get(id=like_id)
        
        # 不给自己发通知
        if like.user == like.post.author:
            return
        
        # 检查是否已存在相同通知
        existing = Notification.objects.filter(
            recipient=like.post.author,
            sender=like.user,
            notification_type='like',
            content_type__model='post',
            object_id=like.post.id,
            created_at__gte=timezone.now() - timedelta(hours=1)
        ).exists()
        
        if existing:
            return
        
        # 创建通知
        notification = Notification.objects.create(
            recipient=like.post.author,
            sender=like.user,
            notification_type='like',
            title='新的点赞',
            message=f'{like.user.username} 点赞了你的帖子',
            content_object=like.post
        )
        
        # 异步发送邮件和推送
        send_notification_email.delay(notification.id)
        send_push_notification.delay(notification.id)
        
    except Like.DoesNotExist:
        logger.error(f'点赞 {like_id} 不存在')
    except Exception as e:
        logger.error(f'创建点赞通知失败: {e}')


@shared_task
def create_comment_notification(comment_id):
    """创建评论通知"""
    try:
        comment = Comment.objects.select_related(
            'author', 'post__author'
        ).get(id=comment_id)
        
        # 不给自己发通知
        if comment.author == comment.post.author:
            return
        
        # 创建通知
        notification = Notification.objects.create(
            recipient=comment.post.author,
            sender=comment.author,
            notification_type='comment',
            title='新的评论',
            message=f'{comment.author.username} 评论了你的帖子: {comment.content[:50]}...',
            content_object=comment
        )
        
        # 异步发送邮件和推送
        send_notification_email.delay(notification.id)
        send_push_notification.delay(notification.id)
        
    except Comment.DoesNotExist:
        logger.error(f'评论 {comment_id} 不存在')
    except Exception as e:
        logger.error(f'创建评论通知失败: {e}')


@shared_task
def create_follow_notification(follow_id):
    """创建关注通知"""
    try:
        follow = Follow.objects.select_related(
            'follower', 'following'
        ).get(id=follow_id)
        
        # 创建通知
        notification = Notification.objects.create(
            recipient=follow.following,
            sender=follow.follower,
            notification_type='follow',
            title='新的关注者',
            message=f'{follow.follower.username} 关注了你',
            content_object=follow.follower
        )
        
        # 异步发送邮件和推送
        send_notification_email.delay(notification.id)
        send_push_notification.delay(notification.id)
        
    except Follow.DoesNotExist:
        logger.error(f'关注关系 {follow_id} 不存在')
    except Exception as e:
        logger.error(f'创建关注通知失败: {e}')


@shared_task
def create_mention_notification(post_id, mentioned_usernames):
    """创建提及通知"""
    try:
        post = Post.objects.select_related('author').get(id=post_id)
        
        for username in mentioned_usernames:
            try:
                mentioned_user = User.objects.get(username=username)
                
                # 不给自己发通知
                if mentioned_user == post.author:
                    continue
                
                # 创建通知
                notification = Notification.objects.create(
                    recipient=mentioned_user,
                    sender=post.author,
                    notification_type='mention',
                    title='有人提及了你',
                    message=f'{post.author.username} 在帖子中提及了你',
                    content_object=post
                )
                
                # 异步发送邮件和推送
                send_notification_email.delay(notification.id)
                send_push_notification.delay(notification.id)
                
            except User.DoesNotExist:
                logger.warning(f'用户 {username} 不存在')
                continue
        
    except Post.DoesNotExist:
        logger.error(f'帖子 {post_id} 不存在')
    except Exception as e:
        logger.error(f'创建提及通知失败: {e}')


@shared_task
def cleanup_old_notifications():
    """清理旧通知"""
    try:
        # 删除30天前的已读通知
        thirty_days_ago = timezone.now() - timedelta(days=30)
        deleted_count = Notification.objects.filter(
            is_read=True,
            created_at__lt=thirty_days_ago
        ).delete()[0]
        
        logger.info(f'清理了 {deleted_count} 条旧通知')
        
        # 删除90天前的所有通知
        ninety_days_ago = timezone.now() - timedelta(days=90)
        deleted_count = Notification.objects.filter(
            created_at__lt=ninety_days_ago
        ).delete()[0]
        
        logger.info(f'清理了 {deleted_count} 条过期通知')
        
    except Exception as e:
        logger.error(f'清理旧通知失败: {e}')


@shared_task
def send_daily_digest():
    """发送每日摘要"""
    try:
        # 获取昨天的时间范围
        yesterday = timezone.now() - timedelta(days=1)
        start_of_yesterday = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_yesterday = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        # 获取有未读通知的用户
        users_with_notifications = User.objects.filter(
            notifications__created_at__range=(start_of_yesterday, end_of_yesterday),
            notifications__is_read=False
        ).distinct()
        
        for user in users_with_notifications:
            # 检查用户是否启用每日摘要
            settings_obj, _ = NotificationSettings.objects.get_or_create(user=user)
            if not settings_obj.email_system:
                continue
            
            # 获取用户昨天的未读通知
            notifications = Notification.objects.filter(
                recipient=user,
                created_at__range=(start_of_yesterday, end_of_yesterday),
                is_read=False
            ).order_by('-created_at')
            
            if notifications.exists():
                # 发送摘要邮件
                send_digest_email.delay(user.id, list(notifications.values_list('id', flat=True)))
        
        logger.info('每日摘要任务完成')
        
    except Exception as e:
        logger.error(f'发送每日摘要失败: {e}')


@shared_task
def send_digest_email(user_id, notification_ids):
    """发送摘要邮件"""
    try:
        user = User.objects.get(id=user_id)
        notifications = Notification.objects.filter(
            id__in=notification_ids
        ).order_by('-created_at')
        
        subject = f'[社交系统] 您有 {notifications.count()} 条未读通知'
        
        context = {
            'user': user,
            'notifications': notifications,
            'site_name': '社交系统',
            'site_url': settings.FRONTEND_URL,
        }
        
        html_message = render_to_string(
            'notifications/email/daily_digest.html',
            context
        )
        plain_message = render_to_string(
            'notifications/email/daily_digest.txt',
            context
        )
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False
        )
        
        logger.info(f'成功发送每日摘要邮件给用户 {user.username}')
        
    except User.DoesNotExist:
        logger.error(f'用户 {user_id} 不存在')
    except Exception as e:
        logger.error(f'发送摘要邮件失败: {e}')