from django.contrib import admin
from .models import *


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
    list_display = ('title', 'seller', 'category', 'price', 'is_approved')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'description')
    list_filter = ('is_approved', 'category')
    ordering = ('-created_at',)
    raw_id_fields = ('seller',)
    autocomplete_fields = ('tags','category','seller')


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'created_at')
    search_fields = ('product__title', 'user__username')
    list_filter = ('rating',)
    ordering = ('-created_at',)
    raw_id_fields = ('product', 'user')
    autocomplete_fields = ('product','user')

@admin.register(ProductFlag)
class ProductFlagAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'reason', 'created_at')
    search_fields = ('product__title', 'user__username')
    list_filter = ('reason',)
    ordering = ('-created_at',)
    raw_id_fields = ('product', 'user')
    autocomplete_fields = ('product','user')
