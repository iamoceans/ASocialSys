from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = _('用户资料')


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """用户管理"""
    
    inlines = (UserProfileInline,)
    
    list_display = (
        'username', 'email', 'full_name', 'is_verified',
        'followers_count', 'following_count', 'posts_count',
        'is_active', 'date_joined'
    )
    
    list_filter = (
        'is_active', 'is_staff', 'is_superuser', 'is_verified',
        'is_private', 'date_joined'
    )
    
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    ordering = ('-date_joined',)
    
    readonly_fields = (
        'date_joined', 'last_login', 'followers_count',
        'following_count', 'posts_count'
    )
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('个人信息'), {
            'fields': (
                'first_name', 'last_name', 'email', 'avatar',
                'bio', 'location', 'website', 'birth_date'
            )
        }),
        (_('权限'), {
            'fields': (
                'is_active', 'is_staff', 'is_superuser',
                'is_verified', 'is_private', 'groups', 'user_permissions'
            ),
        }),
        (_('统计信息'), {
            'fields': (
                'followers_count', 'following_count', 'posts_count'
            ),
            'classes': ('collapse',)
        }),
        (_('重要日期'), {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """用户资料管理"""
    
    list_display = (
        'user', 'theme', 'language', 'email_notifications',
        'push_notifications', 'created_at'
    )
    
    list_filter = (
        'theme', 'language', 'email_notifications',
        'push_notifications', 'created_at'
    )
    
    search_fields = ('user__username', 'user__email')
    
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('基本设置'), {
            'fields': ('user', 'theme', 'language')
        }),
        (_('隐私设置'), {
            'fields': (
                'show_email', 'show_birth_date', 'allow_messages'
            )
        }),
        (_('通知设置'), {
            'fields': (
                'email_notifications', 'push_notifications'
            )
        }),
        (_('时间信息'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )