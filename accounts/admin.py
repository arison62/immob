from django.contrib import admin

from .models import ImmobUser, Workspace, UserPropertyPermission


@admin.register(ImmobUser)
class ImmobUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'role', 'created_by', 'created_at')
    search_fields = ('email', 'role', 'first_name', 'last_name')
    list_filter = ('role',)
    ordering = ('-created_at',)


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ('admin', 'company_name', 'tax_number', 'full_address')
    search_fields = ('company_name', 'tax_number', 'full_address')
    ordering = ('company_name',)

    def admin(self, obj):
        return obj.admin
    

@admin.register(UserPropertyPermission)
class UserPropertyPermissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'building', 'property', 'can_view', 'can_create', 'can_update', 'can_delete', 'granted_by', 'granted_at', 'expires_at')
    list_filter = ('can_view', 'can_create', 'can_update', 'can_delete', 'granted_by', 'granted_at', 'expires_at')
    ordering = ('-granted_at',)