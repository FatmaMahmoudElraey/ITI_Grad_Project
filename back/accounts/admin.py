from django.contrib import admin
from .models import UserAccount

@admin.register(UserAccount)
class UserAccountAdmin(admin.ModelAdmin):  # Changed class name to UserAccountAdmin
    list_display = ('id', 'email', 'name', 'is_active', 'is_staff')  # Removed username since it's None
    search_fields = ('email', 'name')  # Removed username since it's None
    list_filter = ('is_active', 'is_staff')
    ordering = ('-id',)
    list_per_page = 20