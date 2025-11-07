from django.contrib import admin
from .models import Property, Building, PropertyPhoto, MaintenanceLog

@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = ('name', 'workspace', 'floor_count')


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('building', 'workspace', 'reference_code', 'type', 'status')
    list_filter = ('type', 'status')


@admin.register(PropertyPhoto)
class PropertyPhotoAdmin(admin.ModelAdmin):
    pass

@admin.register(MaintenanceLog)
class MaintenanceLogAdmin(admin.ModelAdmin):
    list_display = ('property', 'building', 'type', 'status', 'scheduled_date')
    list_filter = ('type', 'status')

