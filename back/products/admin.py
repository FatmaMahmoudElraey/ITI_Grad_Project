from django.contrib import admin
from .models import Category, Tag, Product, ProductReview, ProductFlag
from django.utils.html import format_html


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Product)   
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'seller', 'category', 'price', 'is_approved', 'photo_preview')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'description')
    list_filter = ('is_approved', 'category')
    ordering = ('-created_at',)
    raw_id_fields = ('seller',)
    autocomplete_fields = ('tags','category','seller')
    readonly_fields = ('photo_display',)
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'seller', 'category', 'tags')
        }),
        ('Media', {
            'fields': ('photo', 'photo_display', 'file', 'preview_video', 'live_demo_url')
        }),
        ('Pricing', {
            'fields': ('price', 'is_in_subscription')
        }),
        ('Status', {
            'fields': ('is_approved', 'is_featured')
        }),
    )
    
    def photo_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover;" />', obj.photo.url)
        return "No Photo"
    photo_preview.short_description = 'Photo'
    
    def photo_display(self, obj):
        if obj.photo:
            return format_html('<img src="{}" width="300" style="max-height: 300px; object-fit: contain;" />', obj.photo.url)
        return "No Photo Uploaded"
    photo_display.short_description = 'Photo Preview'


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'created_at')
    search_fields = ('product__title', 'user__name')
    list_filter = ('rating',)
    ordering = ('-created_at',)
    raw_id_fields = ('product', 'user')
    autocomplete_fields = ('product','user')

@admin.register(ProductFlag)
class ProductFlagAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'reason', 'created_at')
    search_fields = ('product__title', 'user__name')
    list_filter = ('reason',)
    ordering = ('-created_at',)
    raw_id_fields = ('product', 'user')
    autocomplete_fields = ('product','user')
