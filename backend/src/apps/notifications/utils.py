from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from datetime import timedelta
import logging

from .models import Notification, NotificationSettings
from .tasks import send_notification_email, send_push_notification

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationManager:
    """通知管理器"""
    
    @staticmethod
    def create_notification(recipient, title, message, notification_type='system',
                          sender=None, content_object=None, action_url=None,
                          send_email=True, send_push=True):
        """创建通知
        
        Args:
            recipient: 接收者用户对象
            title: 通知标题
            message: 通知内容
            notification_type: 通知类型
            sender: 发送者用户对象（可选）
            content_object: 关联的内容对象（可选）
            action_url: 操作链接（可选）
            send_email: 是否发送邮件通知
            send_push: 是否发送推送通知
            
        Returns:
            Notification对象或None
        """
        try:
            # 检查是否需要创建通知
            if not NotificationManager._should_create_notification(
                recipient, sender, notification_type
            ):
                return None
            
            # 创建通知
            notification = Notification.objects.create(
                recipient=recipient,
                sender=sender,
                notification_type=notification_type,
                title=title,
                message=message,
                content_object=content_object,
                action_url=action_url
            )
            
            # 异步发送邮件和推送
            if send_email:
                send_notification_email.delay(notification.id)
            
            if send_push:
                send_push_notification.delay(notification.id)
            
            logger.info(
                f'创建通知成功: {notification_type} - '
                f'接收者: {recipient.username} - '
                f'发送者: {sender.username if sender else "系统"}'
            )
            
            return notification
            
        except Exception as e:
            logger.error(f'创建通知失败: {e}')
            return None
    
    @staticmethod
    def _should_create_notification(recipient, sender, notification_type):
        """检查是否应该创建通知"""
        # 不给自己发通知
        if sender and sender == recipient:
            return False
        
        # 检查用户通知设置
        try:
            settings_obj = NotificationSettings.objects.get(user=recipient)
            
            # 检查是否启用该类型的通知
            if not getattr(settings_obj, f'in_app_{notification_type}', True):
                return False
            
            # 检查免打扰时间
            if settings_obj.is_in_do_not_disturb_period():
                return False
                
        except NotificationSettings.DoesNotExist:
            # 如果没有设置，默认允许
            pass
        
        return True
    
    @staticmethod
    def mark_as_read(notification_ids, user):
        """批量标记通知为已读
        
        Args:
            notification_ids: 通知ID列表
            user: 用户对象
            
        Returns:
            更新的通知数量
        """
        try:
            updated_count = Notification.objects.filter(
                id__in=notification_ids,
                recipient=user,
                is_read=False
            ).update(
                is_read=True,
                read_at=timezone.now()
            )
            
            logger.info(f'用户 {user.username} 标记了 {updated_count} 条通知为已读')
            return updated_count
            
        except Exception as e:
            logger.error(f'标记通知为已读失败: {e}')
            return 0
    
    @staticmethod
    def mark_all_as_read(user):
        """标记用户所有通知为已读
        
        Args:
            user: 用户对象
            
        Returns:
            更新的通知数量
        """
        try:
            updated_count = Notification.objects.filter(
                recipient=user,
                is_read=False
            ).update(
                is_read=True,
                read_at=timezone.now()
            )
            
            logger.info(f'用户 {user.username} 标记了所有 {updated_count} 条通知为已读')
            return updated_count
            
        except Exception as e:
            logger.error(f'标记所有通知为已读失败: {e}')
            return 0
    
    @staticmethod
    def delete_notifications(notification_ids, user):
        """批量删除通知
        
        Args:
            notification_ids: 通知ID列表
            user: 用户对象
            
        Returns:
            删除的通知数量
        """
        try:
            deleted_count = Notification.objects.filter(
                id__in=notification_ids,
                recipient=user
            ).delete()[0]
            
            logger.info(f'用户 {user.username} 删除了 {deleted_count} 条通知')
            return deleted_count
            
        except Exception as e:
            logger.error(f'删除通知失败: {e}')
            return 0
    
    @staticmethod
    def get_unread_count(user):
        """获取用户未读通知数量
        
        Args:
            user: 用户对象
            
        Returns:
            未读通知数量
        """
        try:
            return Notification.objects.filter(
                recipient=user,
                is_read=False
            ).count()
            
        except Exception as e:
            logger.error(f'获取未读通知数量失败: {e}')
            return 0
    
    @staticmethod
    def get_notifications_by_type(user, notification_type, limit=20):
        """按类型获取用户通知
        
        Args:
            user: 用户对象
            notification_type: 通知类型
            limit: 限制数量
            
        Returns:
            通知查询集
        """
        return Notification.objects.filter(
            recipient=user,
            notification_type=notification_type
        ).order_by('-created_at')[:limit]
    
    @staticmethod
    def get_recent_notifications(user, days=7, limit=50):
        """获取用户最近的通知
        
        Args:
            user: 用户对象
            days: 天数
            limit: 限制数量
            
        Returns:
            通知查询集
        """
        since_date = timezone.now() - timedelta(days=days)
        
        return Notification.objects.filter(
            recipient=user,
            created_at__gte=since_date
        ).order_by('-created_at')[:limit]


class NotificationStatsManager:
    """通知统计管理器"""
    
    @staticmethod
    def get_user_stats(user):
        """获取用户通知统计
        
        Args:
            user: 用户对象
            
        Returns:
            统计数据字典
        """
        try:
            notifications = Notification.objects.filter(recipient=user)
            
            stats = {
                'total': notifications.count(),
                'unread': notifications.filter(is_read=False).count(),
                'read': notifications.filter(is_read=True).count(),
                'today': notifications.filter(
                    created_at__date=timezone.now().date()
                ).count(),
                'this_week': notifications.filter(
                    created_at__gte=timezone.now() - timedelta(days=7)
                ).count(),
                'by_type': {}
            }
            
            # 按类型统计
            type_stats = notifications.values('notification_type').annotate(
                count=models.Count('id')
            )
            
            for item in type_stats:
                stats['by_type'][item['notification_type']] = item['count']
            
            return stats
            
        except Exception as e:
            logger.error(f'获取用户通知统计失败: {e}')
            return {}
    
    @staticmethod
    def get_system_stats():
        """获取系统通知统计
        
        Returns:
            系统统计数据字典
        """
        try:
            from django.db import models
            
            today = timezone.now().date()
            week_ago = timezone.now() - timedelta(days=7)
            
            stats = {
                'total_notifications': Notification.objects.count(),
                'today_notifications': Notification.objects.filter(
                    created_at__date=today
                ).count(),
                'week_notifications': Notification.objects.filter(
                    created_at__gte=week_ago
                ).count(),
                'unread_notifications': Notification.objects.filter(
                    is_read=False
                ).count(),
                'by_type': {},
                'active_users': User.objects.filter(
                    notifications__created_at__gte=week_ago
                ).distinct().count()
            }
            
            # 按类型统计
            type_stats = Notification.objects.values('notification_type').annotate(
                count=models.Count('id')
            )
            
            for item in type_stats:
                stats['by_type'][item['notification_type']] = item['count']
            
            return stats
            
        except Exception as e:
            logger.error(f'获取系统通知统计失败: {e}')
            return {}


class NotificationTemplateManager:
    """通知模板管理器"""
    
    # 预定义的通知模板
    TEMPLATES = {
        'like': {
            'title': '新的点赞',
            'message': '{sender} 点赞了你的{content_type}'
        },
        'comment': {
            'title': '新的评论',
            'message': '{sender} 评论了你的{content_type}：{content_preview}'
        },
        'follow': {
            'title': '新的关注者',
            'message': '{sender} 关注了你'
        },
        'mention': {
            'title': '有人提及了你',
            'message': '{sender} 在{content_type}中提及了你'
        },
        'system': {
            'title': '系统通知',
            'message': '{message}'
        },
        'welcome': {
            'title': '欢迎加入！',
            'message': '欢迎来到我们的社交平台！开始探索和分享你的精彩内容吧。'
        },
        'security': {
            'title': '安全提醒',
            'message': '您的账户{event}，如非本人操作请及时修改密码。'
        },
        'moderation': {
            'title': '内容审核通知',
            'message': '您的{content_type}{action}，{reason}'
        }
    }
    
    @classmethod
    def render_template(cls, template_type, **kwargs):
        """渲染通知模板
        
        Args:
            template_type: 模板类型
            **kwargs: 模板变量
            
        Returns:
            渲染后的标题和消息
        """
        template = cls.TEMPLATES.get(template_type, cls.TEMPLATES['system'])
        
        try:
            title = template['title'].format(**kwargs)
            message = template['message'].format(**kwargs)
            return title, message
            
        except KeyError as e:
            logger.error(f'渲染通知模板失败，缺少变量: {e}')
            return template['title'], template['message']
        except Exception as e:
            logger.error(f'渲染通知模板失败: {e}')
            return '通知', '您有一条新通知'
    
    @classmethod
    def create_templated_notification(cls, recipient, template_type, 
                                    sender=None, content_object=None, **kwargs):
        """使用模板创建通知
        
        Args:
            recipient: 接收者
            template_type: 模板类型
            sender: 发送者
            content_object: 关联对象
            **kwargs: 模板变量
            
        Returns:
            创建的通知对象
        """
        title, message = cls.render_template(template_type, **kwargs)
        
        return NotificationManager.create_notification(
            recipient=recipient,
            title=title,
            message=message,
            notification_type=template_type,
            sender=sender,
            content_object=content_object
        )


# 便捷函数
def notify_user(recipient, title, message, **kwargs):
    """发送通知给用户的便捷函数"""
    return NotificationManager.create_notification(
        recipient=recipient,
        title=title,
        message=message,
        **kwargs
    )


def notify_users(recipients, title, message, **kwargs):
    """批量发送通知给多个用户"""
    notifications = []
    for recipient in recipients:
        notification = NotificationManager.create_notification(
            recipient=recipient,
            title=title,
            message=message,
            **kwargs
        )
        if notification:
            notifications.append(notification)
    
    return notifications


def create_like_notification_helper(like_obj):
    """创建点赞通知的辅助函数"""
    if like_obj.user == like_obj.post.author:
        return None
    
    return NotificationTemplateManager.create_templated_notification(
        recipient=like_obj.post.author,
        template_type='like',
        sender=like_obj.user,
        content_object=like_obj.post,
        sender=like_obj.user.username,
        content_type='帖子'
    )


def create_comment_notification_helper(comment_obj):
    """创建评论通知的辅助函数"""
    if comment_obj.author == comment_obj.post.author:
        return None
    
    content_preview = comment_obj.content[:50] + '...' if len(comment_obj.content) > 50 else comment_obj.content
    
    return NotificationTemplateManager.create_templated_notification(
        recipient=comment_obj.post.author,
        template_type='comment',
        sender=comment_obj.author,
        content_object=comment_obj,
        sender=comment_obj.author.username,
        content_type='帖子',
        content_preview=content_preview
    )


def create_follow_notification_helper(follow_obj):
    """创建关注通知的辅助函数"""
    return NotificationTemplateManager.create_templated_notification(
        recipient=follow_obj.following,
        template_type='follow',
        sender=follow_obj.follower,
        content_object=follow_obj.follower,
        sender=follow_obj.follower.username
    )