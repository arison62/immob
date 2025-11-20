import json
from uuid import UUID
from django.http import JsonResponse, HttpRequest
from django.views.decorators.http import require_http_methods
from django.forms.models import model_to_dict
from pydantic import ValidationError

from core.utils import format_pydantic_errors
from finance.services.tenant_service import tenant_service
from finance.services.contrat_service import contrat_service
from finance.services.payment_service import payment_service
from .services.dtos import TenantCreateDTO, TenantUpdateDTO, ContratCreateDTO, ContratUpdateDTO, PaymentUpdateDTO, PaymentCreateDTO

# ============================================================================
# VUES LOCATAIRE (TENANT)
# ============================================================================

@require_http_methods(["GET", "POST"])
def tenant_list_create_view(request: HttpRequest):
    acting_user = request.user

    if request.method == "POST":
        try:
            data = json.loads(request.body)
            tenant_dto = TenantCreateDTO(**data)
            tenant = tenant_service.create_tenant(acting_user, tenant_dto, request)
            return JsonResponse({"id": tenant.id, "message": "Locataire créé avec succès."}, status=201)
        except (ValidationError, json.JSONDecodeError) as e:
            errors = format_pydantic_errors(e.errors()) if isinstance(e, ValidationError) else {"error": str(e)}
            return JsonResponse({"errors": errors}, status=400)
        except PermissionError as e:
            return JsonResponse({"errors": str(e)}, status=403)

    tenants = tenant_service.list_tenants_for_workspace(acting_user)
    return JsonResponse(list(tenants), safe=False)

@require_http_methods(["GET", "PUT", "DELETE"])
def tenant_detail_view(request: HttpRequest, tenant_id: UUID):
    acting_user = request.user

    try:
        if request.method == "GET":
            tenant_details = tenant_service.get_tenant_details(acting_user, tenant_id, request)
            return JsonResponse(tenant_details)

        if request.method == "PUT":
            data = json.loads(request.body)
            tenant_dto = TenantUpdateDTO(**data)
            tenant_service.update_tenant(acting_user, tenant_id, tenant_dto, request)
            return JsonResponse({"message": "Locataire mis à jour avec succès."})

        if request.method == "DELETE":
            tenant_service.delete_tenant(acting_user, tenant_id, request)
            return JsonResponse({}, status=204)

    except (ValidationError, json.JSONDecodeError, ValueError) as e:
        errors = format_pydantic_errors(e.errors()) if isinstance(e, ValidationError) else {"error": str(e)}
        return JsonResponse({"errors": errors}, status=400)
    except PermissionError as e:
        return JsonResponse({"errors": str(e)}, status=403)

@require_http_methods(["POST"])
def payment_create_view(request: HttpRequest):
    acting_user = request.user
    try:
        data = json.loads(request.body)
        payment_dto = PaymentCreateDTO(**data)
        payment = payment_service.create_payment(acting_user, payment_dto, request)
        return JsonResponse({"id": payment.id, "message": "Paiement créé avec succès."}, status=201)
    except (ValidationError, json.JSONDecodeError, ValueError) as e:
        errors = format_pydantic_errors(e.errors()) if isinstance(e, ValidationError) else {"error": str(e)}
        return JsonResponse({"errors": errors}, status=400)
    except PermissionError as e:
        return JsonResponse({"errors": str(e)}, status=403)

# ============================================================================
# VUES CONTRAT
# ============================================================================

@require_http_methods(["POST"])
def contrat_create_view(request: HttpRequest):
    acting_user = request.user
    try:
        data = json.loads(request.body)
        contrat_dto = ContratCreateDTO(**data)
        contrat = contrat_service.create_contrat(acting_user, contrat_dto, request)
        return JsonResponse({"id": contrat.id, "message": "Contrat créé avec succès."}, status=201)
    except (ValidationError, json.JSONDecodeError, ValueError) as e:
        errors = format_pydantic_errors(e.errors()) if isinstance(e, ValidationError) else {"error": str(e)}
        return JsonResponse({"errors": errors}, status=400)
    except PermissionError as e:
        return JsonResponse({"errors": str(e)}, status=403)

@require_http_methods(["GET", "PUT", "DELETE"])
def contrat_detail_view(request: HttpRequest, contrat_id: UUID):
    acting_user = request.user
    try:
        if request.method == "GET":
            contrat = contrat_service.get_contrat_details(acting_user, contrat_id, request)
            return JsonResponse(model_to_dict(contrat))

        if request.method == "PUT":
            data = json.loads(request.body)
            contrat_dto = ContratUpdateDTO(**data)
            contrat_service.update_contrat(acting_user, contrat_id, contrat_dto, request)
            return JsonResponse({"message": "Contrat mis à jour."})

        if request.method == "DELETE":
            contrat_service.delete_contrat(acting_user, contrat_id, request)
            return JsonResponse({}, status=204)

    except (ValidationError, json.JSONDecodeError, ValueError) as e:
        errors = format_pydantic_errors(e.errors()) if isinstance(e, ValidationError) else {"error": str(e)}
        return JsonResponse({"errors": errors}, status=400)
    except PermissionError as e:
        return JsonResponse({"errors": str(e)}, status=403)

# ============================================================================
# VUES PAIEMENT
# ============================================================================

@require_http_methods(["GET"])
def payment_list_for_contrat_view(request: HttpRequest, contrat_id: UUID):
    acting_user = request.user
    try:
        payments = payment_service.list_payments_for_contrat(acting_user, contrat_id, request)
        return JsonResponse(list(payments), safe=False)
    except PermissionError as e:
        return JsonResponse({"errors": str(e)}, status=403)

@require_http_methods(["GET", "PUT", "DELETE"])
def payment_detail_view(request: HttpRequest, payment_id: UUID):
    acting_user = request.user
    try:
        if request.method == "GET":
            payment = payment_service.get_payment_details(acting_user, payment_id, request)
            return JsonResponse(model_to_dict(payment))

        if request.method == "PUT":
            data = json.loads(request.body)
            payment_dto = PaymentUpdateDTO(**data)
            payment_service.update_payment_status(acting_user, payment_id, payment_dto, request)
            return JsonResponse({"message": "Paiement mis à jour."})

        if request.method == "DELETE":
            payment_service.delete_payment(acting_user, payment_id, request)
            return JsonResponse({}, status=204)

    except (ValidationError, json.JSONDecodeError, ValueError) as e:
        errors = format_pydantic_errors(e.errors()) if isinstance(e, ValidationError) else {"error": str(e)}
        return JsonResponse({"errors": errors}, status=400)
    except PermissionError as e:
        return JsonResponse({"errors": str(e)}, status=403)
