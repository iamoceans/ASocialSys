from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core import mail
from unittest.mock import patch, MagicMock
from datetime import timedelta

from .models import Notification, NotificationSettings, PushDevice
from .utils import NotificationManager, NotificationTemplateManager
from .tasks import (
    send_notification_email,
    send_push_notification,
    create_like_notification,
    cleanup_old_notifications
)
from apps.posts.models import Post, Like, Comment
from apps.social.models import Follow

User = get_user_model()


class NotificationModelTest(TestCase):
    """通知模型测试"""
    
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@test.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@test.com',
            password='testpass123'
        )
    
    def test_create_notification(self):
        """测试创建通知"""
        notification = Notification.objects.create(
            recipient=self.user1,
            sender=self.user2,
            notification_type='like',
            title='新的点赞',
            message='user2 点赞了你的帖子'
        )
        
        self.assertEqual(notification.recipient, self.user1)
        self.assertEqual(notification.sender, self.user2)
        self.assertEqual(notification.notification_type, 'like')
        self.assertFalse(notification.is_read)
        self.assertIsNone(notification.read_at)
    
    def test_mark_as_read(self):
        """测试标记为已读"""
        notification = Notification.objects.create(
            recipient=self.user1,
            sender=self.user2,
            notification_type='like',
            title='新的点赞',
            message='user2 点赞了你的帖子'
        )
        
        notification.mark_as_read()
        
        self.assertTrue(notification.is_read)
        self.assertIsNotNone(notification.read_at)
    
    def test_notification_str(self):
        """测试通知字符串表示"""
        notification = Notification.objects.create(
            recipient=self.user1,
            sender=self.user2,
            notification_type='like',
            title='新的点赞',
            message='user2 点赞了你的帖子'
        )
        
        expected = f'[like] user2 -> user1: 新的点赞'
        self.assertEqual(str(notification), expected)


class NotificationSettingsTest(TestCase):
    """通知设置测试"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
    
    def test_default_settings(self):
        """测试默认设置"""
        settings = NotificationSettings.objects.create(user=self.user)
        
        # 默认应该启用所有通知
        self.assertTrue(settings.in_app_like)
        self.assertTrue(settings.email_like)
        self.assertTrue(settings.push_like)
    
    def test_do_not_disturb_period(self):
        """测试免打扰时间段"""
        settings = NotificationSettings.objects.create(
            user=self.user,
            do_not_disturb_start='22:00',
            do_not_disturb_end='08:00'
        )
        
        # 模拟不同时间
        with patch('django.utils.timezone.now') as mock_now:
            # 晚上10点30分（免打扰时间）
            mock_now.return_value = timezone.now().replace(
                hour=22, minute=30, second=0, microsecond=0
            )
            self.assertTrue(settings.is_in_do_not_disturb_period())
            
            # 早上6点（免打扰时间）
            mock_now.return_value = timezone.now().replace(
                hour=6, minute=0, second=0, microsecond=0
            )
            self.assertTrue(settings.is_in_do_not_disturb_period())
            
            # 下午2点（非免打扰时间）
            mock_now.return_value = timezone.now().replace(
                hour=14, minute=0, second=0, microsecond=0
            )
            self.assertFalse(settings.is_in_do_not_disturb_period())


class NotificationManagerTest(TestCase):
    """通知管理器测试"""
    
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@test.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@test.com',
            password='testpass123'
        )
    
    @patch('apps.notifications.tasks.send_notification_email.delay')
    @patch('apps.notifications.tasks.send_push_notification.delay')
    def test_create_notification(self, mock_push, mock_email):
        """测试创建通知"""
        notification = NotificationManager.create_notification(
            recipient=self.user1,
            title='测试通知',
            message='这是一条测试通知',
            notification_type='system',
            sender=self.user2
        )
        
        self.assertIsNotNone(notification)
        self.assertEqual(notification.recipient, self.user1)
        self.assertEqual(notification.sender, self.user2)
        self.assertEqual(notification.title, '测试通知')
        
        # 验证异步任务被调用
        mock_email.assert_called_once_with(notification.id)
        mock_push.assert_called_once_with(notification.id)
    
    def test_should_not_create_self_notification(self):
        """测试不应该给自己发通知"""
        notification = NotificationManager.create_notification(
            recipient=self.user1,
            title='测试通知',
            message='这是一条测试通知',
            sender=self.user1  # 发送者和接收者是同一人
        )
        
        self.assertIsNone(notification)
    
    def test_mark_as_read(self):
        """测试批量标记为已读"""
        # 创建多个通知
        notifications = []
        for i in range(3):
            notification = Notification.objects.create(
                recipient=self.user1,
                sender=self.user2,
                notification_type='like',
                title=f'通知 {i}',
                message=f'消息 {i}'
            )
            notifications.append(notification)
        
        notification_ids = [n.id for n in notifications]
        
        # 标记为已读
        updated_count = NotificationManager.mark_as_read(
            notification_ids, self.user1
        )
        
        self.assertEqual(updated_count, 3)
        
        # 验证所有通知都被标记为已读
        for notification in notifications:
            notification.refresh_from_db()
            self.assertTrue(notification.is_read)
    
    def test_get_unread_count(self):
        """测试获取未读数量"""
        # 创建通知
        Notification.objects.create(
            recipient=self.user1,
            sender=self.user2,
            notification_type='like',
            title='通知1',
            message='消息1'
        )
        
        read_notification = Notification.objects.create(
            recipient=self.user1,
            sender=self.user2,
            notification_type='comment',
            title='通知2',
            message='消息2',
            is_read=True
        )
        
        unread_count = NotificationManager.get_unread_count(self.user1)
        self.assertEqual(unread_count, 1)


class NotificationTemplateManagerTest(TestCase):
    """通知模板管理器测试"""
    
    def test_render_template(self):
        """测试渲染模板"""
        title, message = NotificationTemplateManager.render_template(
            'like',
            sender='testuser',
            content_type='帖子'
        )
        
        self.assertEqual(title, '新的点赞')
        self.assertEqual(message, 'testuser 点赞了你的帖子')
    
    def test_render_template_with_missing_variable(self):
        """测试缺少变量时的模板渲染"""
        title, message = NotificationTemplateManager.render_template(
            'like',
            sender='testuser'
            # 缺少 content_type 变量
        )
        
        # 应该返回原始模板
        self.assertEqual(title, '新的点赞')
        self.assertIn('{content_type}', message)


class NotificationTaskTest(TestCase):
    """通知任务测试"""
    
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@test.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@test.com',
            password='testpass123'
        )
    
    def test_send_notification_email(self):
        """测试发送通知邮件"""
        notification = Notification.objects.create(
            recipient=self.user1,
            sender=self.user2,
            notification_type='like',
            title='新的点赞',
            message='user2 点赞了你的帖子'
        )
        
        # 清空邮件
        mail.outbox = []
        
        # 执行任务
        with patch('apps.notifications.tasks.render_to_string') as mock_render:
            mock_render.return_value = '测试邮件内容'
            
            send_notification_email(notification.id)
        
        # 验证邮件被发送
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.user1.email])
        self.assertIn('新的点赞', mail.outbox[0].subject)
    
    def test_cleanup_old_notifications(self):
        """测试清理旧通知"""
        # 创建旧的已读通知
        old_read_notification = Notification.objects.create(
            recipient=self.user1,
            sender=self.user2,
            notification_type='like',
            title='旧通知',
            message='旧消息',
            is_read=True
        )
        
        # 手动设置创建时间为31天前
        old_read_notification.created_at = timezone.now() - timedelta(days=31)
        old_read_notification.save()
        
        # 创建新通知
        new_notification = Notification.objects.create(
            recipient=self.user1,
            sender=self.user2,
            notification_type='comment',
            title='新通知',
            message='新消息'
        )
        
        # 执行清理任务
        cleanup_old_notifications()
        
        # 验证旧通知被删除，新通知保留
        self.assertFalse(
            Notification.objects.filter(id=old_read_notification.id).exists()
        )
        self.assertTrue(
            Notification.objects.filter(id=new_notification.id).exists()
        )


class NotificationSignalTest(TestCase):
    """通知信号测试"""
    
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@test.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@test.com',
            password='testpass123'
        )
        
        # 创建用户资料
        from apps.users.models import UserProfile
        UserProfile.objects.create(user=self.user1)
        UserProfile.objects.create(user=self.user2)
    
    @patch('apps.notifications.tasks.create_like_notification.delay')
    def test_like_signal(self, mock_task):
        """测试点赞信号"""
        # 创建帖子
        post = Post.objects.create(
            author=self.user1,
            content='测试帖子'
        )
        
        # 创建点赞
        like = Like.objects.create(
            user=self.user2,
            post=post
        )
        
        # 验证任务被调用
        mock_task.assert_called_once_with(like.id)
    
    @patch('apps.notifications.tasks.create_follow_notification.delay')
    def test_follow_signal(self, mock_task):
        """测试关注信号"""
        # 创建关注关系
        follow = Follow.objects.create(
            follower=self.user2,
            following=self.user1
        )
        
        # 验证任务被调用
        mock_task.assert_called_once_with(follow.id)


class PushDeviceTest(TestCase):
    """推送设备测试"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
    
    def test_create_push_device(self):
        """测试创建推送设备"""
        device = PushDevice.objects.create(
            user=self.user,
            device_type='web',
            device_token='test_token_123',
            device_id='device_123'
        )
        
        self.assertEqual(device.user, self.user)
        self.assertEqual(device.device_type, 'web')
        self.assertTrue(device.is_active)
    
    def test_device_str(self):
        """测试设备字符串表示"""
        device = PushDevice.objects.create(
            user=self.user,
            device_type='ios',
            device_token='test_token_123',
            device_id='device_123'
        )
        
        expected = f'testuser - ios (device_123)'
        self.assertEqual(str(device), expected)


class NotificationAPITest(TestCase):
    """通知API测试"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        
        # 创建用户资料
        from apps.users.models import UserProfile
        UserProfile.objects.create(user=self.user)
        
        self.client.force_login(self.user)
    
    def test_get_notifications(self):
        """测试获取通知列表"""
        # 创建通知
        Notification.objects.create(
            recipient=self.user,
            notification_type='system',
            title='测试通知',
            message='测试消息'
        )
        
        response = self.client.get('/api/v1/notifications/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['results']), 1)
        self.assertEqual(data['results'][0]['title'], '测试通知')
    
    def test_mark_notification_as_read(self):
        """测试标记通知为已读"""
        notification = Notification.objects.create(
            recipient=self.user,
            notification_type='system',
            title='测试通知',
            message='测试消息'
        )
        
        response = self.client.post(
            f'/api/v1/notifications/{notification.id}/mark_read/'
        )
        
        self.assertEqual(response.status_code, 200)
        
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)
    
    def test_get_unread_count(self):
        """测试获取未读数量"""
        # 创建未读通知
        Notification.objects.create(
            recipient=self.user,
            notification_type='system',
            title='未读通知',
            message='未读消息'
        )
        
        response = self.client.get('/api/v1/notifications/unread_count/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['count'], 1)