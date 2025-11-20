from django.urls import path
from . import views
from uuid import UUID

app_name = 'finance'

urlpatterns = [
    # URLs pour les Locataires (Tenants)
    path('tenants/', views.tenant_list_create_view, name='tenant-list-create'),
    path('tenants/<uuid:tenant_id>/', views.tenant_detail_view, name='tenant-detail'),

    # URLs pour les Contrats
    path('contrats/', views.contrat_create_view, name='contrat-create'),
    path('contrats/<uuid:contrat_id>/', views.contrat_detail_view, name='contrat-detail'),

    # URLs pour les Paiements (Payments)
    path('payments/', views.payment_create_view, name='payment-create'),
    path('contrats/<uuid:contrat_id>/payments/', views.payment_list_for_contrat_view, name='payment-list-for-contrat'),
    path('payments/<uuid:payment_id>/', views.payment_detail_view, name='payment-detail'),
]
