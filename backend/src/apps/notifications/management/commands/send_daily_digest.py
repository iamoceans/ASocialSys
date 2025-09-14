from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import logging

from apps.notifications.models import Notification, NotificationSettings
from apps.notifications.tasks import send_digest_email

User = get_user_model()
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = '发送每日通知摘要邮件'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--date',
            type=str,
            help='指定日期（格式：YYYY-MM-DD），默认为昨天'
        )
        
        parser.add_argument(
            '--user-id',
            type=int,
            help='只为指定用户发送摘要'
        )
        
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='只显示将要发送的摘要数量，不实际发送'
        )
        
        parser.add_argument(
            '--force',
            action='store_true',
            help='强制发送，忽略用户设置'
        )
    
    def handle(self, *args, **options):
        date_str = options.get('date')
        user_id = options.get('user_id')
        dry_run = options['dry_run']
        force = options['force']
        
        # 确定日期范围
        if date_str:
            try:
                target_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                self.stdout.write(
                    self.style.ERROR('日期格式错误，请使用 YYYY-MM-DD 格式')
                )
                return
        else:
            target_date = (timezone.now() - timedelta(days=1)).date()
        
        start_of_day = timezone.datetime.combine(
            target_date, timezone.datetime.min.time()
        ).replace(tzinfo=timezone.get_current_timezone())
        
        end_of_day = timezone.datetime.combine(
            target_date, timezone.datetime.max.time()
        ).replace(tzinfo=timezone.get_current_timezone())
        
        self.stdout.write(
            f'处理日期：{target_date.strftime("%Y-%m-%d")}'
        )
        
        # 获取用户列表
        if user_id:
            try:
                users = [User.objects.get(id=user_id)]
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'用户 ID {user_id} 不存在')
                )
                return
        else:
            # 获取在指定日期有未读通知的用户
            users = User.objects.filter(
                notifications__created_at__range=(start_of_day, end_of_day),
                notifications__is_read=False
            ).distinct()
        
        total_users = users.count()
        sent_count = 0
        skipped_count = 0
        
        self.stdout.write(
            f'找到 {total_users} 个用户需要处理'
        )
        
        for user in users:
            try:
                # 检查用户设置
                if not force:
                    settings_obj, _ = NotificationSettings.objects.get_or_create(
                        user=user
                    )
                    
                    if not settings_obj.email_system:
                        self.stdout.write(
                            f'跳过用户 {user.username}：已禁用系统邮件通知'
                        )
                        skipped_count += 1
                        continue
                
                # 获取用户在指定日期的未读通知
                notifications = Notification.objects.filter(
                    recipient=user,
                    created_at__range=(start_of_day, end_of_day),
                    is_read=False
                ).order_by('-created_at')
                
                if not notifications.exists():
                    self.stdout.write(
                        f'跳过用户 {user.username}：没有未读通知'
                    )
                    skipped_count += 1
                    continue
                
                notification_count = notifications.count()
                
                if dry_run:
                    self.stdout.write(
                        f'将为用户 {user.username} 发送包含 {notification_count} 条通知的摘要'
                    )
                else:
                    # 发送摘要邮件
                    notification_ids = list(notifications.values_list('id', flat=True))
                    send_digest_email.delay(user.id, notification_ids)
                    
                    self.stdout.write(
                        f'为用户 {user.username} 发送了包含 {notification_count} 条通知的摘要'
                    )
                
                sent_count += 1
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'处理用户 {user.username} 时出错：{e}'
                    )
                )
                continue
        
        # 输出统计信息
        if dry_run:
            self.stdout.write(
                self.style.SUCCESS(
                    f'预览完成：将发送 {sent_count} 份摘要，跳过 {skipped_count} 个用户'
                )
            )
            self.stdout.write(
                self.style.WARNING(
                    '这是预览模式，没有实际发送任何邮件。'
                    '要执行发送，请移除 --dry-run 参数。'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'摘要发送完成：发送了 {sent_count} 份摘要，跳过 {skipped_count} 个用户'
                )
            )
        
        # 记录日志
        logger.info(
            f'每日摘要任务完成 - 日期：{target_date} - '
            f'发送：{sent_count} - 跳过：{skipped_count}'
        )