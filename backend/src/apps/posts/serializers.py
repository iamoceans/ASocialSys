from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Post, Comment, Like, CommentLike, Hashtag, PostImage
from apps.users.serializers import UserListSerializer

User = get_user_model()


class PostImageSerializer(serializers.ModelSerializer):
    """帖子图片序列化器"""
    
    class Meta:
        model = PostImage
        fields = ('id', 'image', 'alt_text', 'order')
        read_only_fields = ('id',)


class HashtagSerializer(serializers.ModelSerializer):
    """话题标签序列化器"""
    
    class Meta:
        model = Hashtag
        fields = ('id', 'name', 'posts_count')
        read_only_fields = ('id', 'posts_count')


class CommentSerializer(serializers.ModelSerializer):
    """评论序列化器"""
    
    author = UserListSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = (
            'id', 'author', 'content', 'likes_count', 'replies_count',
            'is_deleted', 'created_at', 'updated_at', 'is_liked', 'replies'
        )
        read_only_fields = (
            'id', 'author', 'likes_count', 'replies_count', 'created_at', 'updated_at'
        )
    
    def get_is_liked(self, obj):
        """检查当前用户是否点赞了该评论"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return CommentLike.objects.filter(
                user=request.user, comment=obj
            ).exists()
        return False
    
    def get_replies(self, obj):
        """获取评论的回复（只显示前3条）"""
        if obj.replies.exists():
            replies = obj.replies.filter(is_deleted=False)[:3]
            return CommentSerializer(replies, many=True, context=self.context).data
        return []


class PostSerializer(serializers.ModelSerializer):
    """帖子序列化器"""
    
    author = UserListSerializer(read_only=True)
    images = PostImageSerializer(source='post_images', many=True, read_only=True)
    hashtags = HashtagSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    original_post = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = (
            'id', 'author', 'content', 'images', 'video', 'hashtags',
            'likes_count', 'comments_count', 'shares_count', 'views_count',
            'is_pinned', 'is_deleted', 'parent', 'original_post',
            'created_at', 'updated_at', 'is_liked', 'comments'
        )
        read_only_fields = (
            'id', 'author', 'likes_count', 'comments_count', 'shares_count',
            'views_count', 'created_at', 'updated_at'
        )
    
    def get_is_liked(self, obj):
        """检查当前用户是否点赞了该帖子"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False
    
    def get_comments(self, obj):
        """获取帖子的评论（只显示前5条）"""
        comments = obj.post_comments.filter(
            is_deleted=False, parent__isnull=True
        )[:5]
        return CommentSerializer(comments, many=True, context=self.context).data
    
    def get_original_post(self, obj):
        """获取转发的原帖信息"""
        if obj.original_post:
            return PostSerializer(obj.original_post, context=self.context).data
        return None
    
    def create(self, validated_data):
        """创建帖子"""
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class PostCreateSerializer(serializers.ModelSerializer):
    """帖子创建序列化器"""
    
    images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        max_length=4
    )
    hashtag_names = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False
    )
    
    class Meta:
        model = Post
        fields = ('content', 'video', 'parent', 'original_post', 'images', 'hashtag_names')
    
    def create(self, validated_data):
        """创建帖子并处理图片和标签"""
        images_data = validated_data.pop('images', [])
        hashtag_names = validated_data.pop('hashtag_names', [])
        
        validated_data['author'] = self.context['request'].user
        post = super().create(validated_data)
        
        # 处理图片
        for i, image in enumerate(images_data):
            PostImage.objects.create(
                post=post,
                image=image,
                order=i
            )
        
        # 处理标签
        for name in hashtag_names:
            hashtag, created = Hashtag.objects.get_or_create(name=name)
            post.hashtags.create(hashtag=hashtag)
            if created:
                hashtag.posts_count = 1
            else:
                hashtag.posts_count += 1
            hashtag.save()
        
        return post


class CommentCreateSerializer(serializers.ModelSerializer):
    """评论创建序列化器"""
    
    class Meta:
        model = Comment
        fields = ('content', 'parent')
    
    def create(self, validated_data):
        """创建评论"""
        validated_data['author'] = self.context['request'].user
        validated_data['post_id'] = self.context['post_id']
        return super().create(validated_data)


class PostListSerializer(serializers.ModelSerializer):
    """帖子列表序列化器（简化版）"""
    
    author = UserListSerializer(read_only=True)
    images = PostImageSerializer(source='post_images', many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = (
            'id', 'author', 'content', 'images', 'likes_count',
            'comments_count', 'shares_count', 'created_at', 'is_liked'
        )
    
    def get_is_liked(self, obj):
        """检查当前用户是否点赞了该帖子"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False