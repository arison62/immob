from django.contrib import admin

from .models import ImmobUser, Owner, UserPropertyPermission


@admin.register(ImmobUser)
class ImmobUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'role', 'created_by', 'created_at')
    search_fields = ('email', 'role', 'first_name', 'last_name')
    list_filter = ('role',)
    ordering = ('-created_at',)


@admin.register(Owner)
class OwnerAdmin(admin.ModelAdmin):
    list_display = ('get_user', 'company_name', 'tax_number', 'full_address')
    search_fields = ('company_name', 'tax_number', 'full_address')
    ordering = ('company_name',)

    def get_user(self, obj):
        return obj.user
    

@admin.register(UserPropertyPermission)
class UserPropertyPermissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'building', 'property', 'can_view', 'can_create', 'can_update', 'can_delete', 'granted_by', 'granted_at', 'expires_at')
    list_filter = ('can_view', 'can_create', 'can_update', 'can_delete', 'granted_by', 'granted_at', 'expires_at')
    ordering = ('-granted_at',)