from django.contrib import admin
from .models import UserAccount, UserProfile, Favorite

@admin.register(UserAccount)
class UserAccountAdmin(admin.ModelAdmin):  # Changed class name to UserAccountAdmin
    list_display = ('id', 'email', 'name', 'is_active', 'is_staff')  # Removed username since it's None
    search_fields = ('email', 'name')  # Removed username since it's None
    list_filter = ('is_active', 'is_staff')
    ordering = ('-id',)
    list_per_page = 20

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'bio', 'location', 'birth_date')
    search_fields = ('user__email', 'location')

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'created_at')
    search_fields = ('user__email', 'product__title')
    list_filter = ('created_at',)
    ordering = ('-created_at',)
    list_per_page = 20