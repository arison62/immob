from inertia import defer, render as render_inertia
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from pydantic import ValidationError
from accounts.dtos import UserCreateDTO, UserUpdateDTO
from accounts.services.team_service import team_service
from core.utils import format_pydantic_errors
import json

class TeamsView(LoginRequiredMixin, View):
    login_url = "/accounts/login"

    def get(self, request):
        # TODO: Implement pagination and filtering later
        # TODO: Implement search functionality later
        users = team_service.list_team_members(acting_user=request.user)

        return render_inertia(request, "dashboard/Teams", {
            "users": defer(lambda: users, merge=True)
        })
    
    def post(self, request):
        try:
            if not request.POST:
                user_data = json.loads(request.body)
            else:
                user_data = request.POST
            
       
            user_data = UserCreateDTO.model_validate(user_data)
            user_created = team_service.create_user(acting_user=request.user, user_data=user_data, request=request)
          
            messages.success(request, "Membre de l'équipe créé avec succès.")
            return render_inertia(request, "dashboard/Teams", {
                "user" : user_created
            })
        except ValidationError as ve:
            errors = format_pydantic_errors(ve.errors())
            return render_inertia(request, "dashboard/Teams", {
                "errors": errors
            })
        except Exception as e:
            messages.error(request, f"Erreur lors de la création du membre de l'équipe : {str(e)}")
            return render_inertia(request, "dashboard/Teams", {
                "users" : defer(lambda: [], merge=True),
                "errors": [{"msg": str(e)}]
            })
    
    def put(self, request):
        try:
            if not request.POST:
                user_data = json.loads(request.body)
            else:
                user_data = request.POST
            
            user_id = user_data.get("id")
            user_data = UserUpdateDTO.model_validate(user_data)
            
            user_updated = team_service.update_user(acting_user=request.user, user_id=user_id, user_data = user_data, request=request)
            messages.success(request, "Membre de l'équipe modifé avec succès.")
            return render_inertia(request, "dashboard/Teams", {
                "user": user_updated
            })
        except ValidationError as ve:
            
            errors = format_pydantic_errors(ve.errors())
            messages.error(request, f"Erreur lors de la Modification du membre de l'équipe")
            return render_inertia(request, "dashboard/Teams", {
                "errors": errors
            })
        except Exception as e:
            print(e)
            messages.error(request, f"Erreur lors de la Modification du membre de l'équipe : {str(e)}")
            return render_inertia(request, "dashboard/Teams", {
                "errors": [{"msg": str(e)}]
            })        
       

