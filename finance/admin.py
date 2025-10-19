from django.contrib import admin
from .models import Tenant, Contract, Payment

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'email', 'phone')


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ('property', 'tenant', 'contract_number', 'status', 'monthly_rent')
    list_filter = ('status',)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('reference_number','contract', 'amount', 'due_date','status','amount', 'payment_date')
    list_filter = ('status', 'payment_method', )
