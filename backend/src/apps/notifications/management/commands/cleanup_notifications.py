from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import logging

from apps.notifications.models import Notification

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = '清理旧的通知记录'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--read-days',
            type=int,
            default=30,
            help='删除多少天前的已读通知（默认30天）'
        )
        
        parser.add_argument(
            '--all-days',
            type=int,
            default=90,
            help='删除多少天前的所有通知（默认90天）'
        )
        
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='只显示将要删除的数量，不实际删除'
        )
        
        parser.add_argument(
            '--batch-size',
            type=int,
            default=1000,
            help='批量删除的大小（默认1000）'
        )
    
    def handle(self, *args, **options):
        read_days = options['read_days']
        all_days = options['all_days']
        dry_run = options['dry_run']
        batch_size = options['batch_size']
        
        self.stdout.write(
            self.style.SUCCESS(f'开始清理通知记录...')
        )
        
        # 清理已读通知
        read_cutoff = timezone.now() - timedelta(days=read_days)
        read_notifications = Notification.objects.filter(
            is_read=True,
            created_at__lt=read_cutoff
        )
        
        read_count = read_notifications.count()
        
        if dry_run:
            self.stdout.write(
                f'将删除 {read_count} 条 {read_days} 天前的已读通知'
            )
        else:
            deleted_read = 0
            while read_notifications.exists():
                batch_ids = list(
                    read_notifications.values_list('id', flat=True)[:batch_size]
                )
                batch_deleted = Notification.objects.filter(
                    id__in=batch_ids
                ).delete()[0]
                deleted_read += batch_deleted
                
                self.stdout.write(
                    f'已删除 {deleted_read}/{read_count} 条已读通知'
                )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'成功删除 {deleted_read} 条 {read_days} 天前的已读通知'
                )
            )
        
        # 清理所有旧通知
        all_cutoff = timezone.now() - timedelta(days=all_days)
        all_notifications = Notification.objects.filter(
            created_at__lt=all_cutoff
        )
        
        all_count = all_notifications.count()
        
        if dry_run:
            self.stdout.write(
                f'将删除 {all_count} 条 {all_days} 天前的所有通知'
            )
        else:
            deleted_all = 0
            while all_notifications.exists():
                batch_ids = list(
                    all_notifications.values_list('id', flat=True)[:batch_size]
                )
                batch_deleted = Notification.objects.filter(
                    id__in=batch_ids
                ).delete()[0]
                deleted_all += batch_deleted
                
                self.stdout.write(
                    f'已删除 {deleted_all}/{all_count} 条旧通知'
                )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'成功删除 {deleted_all} 条 {all_days} 天前的所有通知'
                )
            )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    '这是预览模式，没有实际删除任何数据。'
                    '要执行删除，请移除 --dry-run 参数。'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('通知清理完成！')
            )