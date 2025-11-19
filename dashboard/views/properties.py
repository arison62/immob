from inertia import render as render_inertia, defer
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from holdings.services.building_service import building_service
from holdings.services.property_service import property_service
from pydantic import ValidationError
from core.utils import format_pydantic_errors
from django.contrib import messages
from holdings.services.dtos import (BuildingCreateDTO, PropertyCreateDTO,
                                    AddressDTO, PropertyUpdateDTO, 
                                    BuildingUpdateDTO)
import json

class PropertiesView(LoginRequiredMixin, View):
    login_url = "/accounts/login"

    def get(self, request):
        list_buildings = building_service.list_buildings_for_user(request.user)
        list_properties = property_service.list_all_properties_for_user(request.user)
        
        return render_inertia(request, "dashboard/Properties", {
            "buildings": defer(list_buildings, merge=True),
            "properties": defer(list_properties, merge=True),
        })
    
    def _parse_request_data(self, request):
        """Helper pour extraire les donnee JSON ou POST standard"""
        if not request.POST:
            return json.loads(request.body)
        else:
            return request.POST
    
    
    def post(self, request):
        try:
            data = self._parse_request_data(request)
            form_type = data.get("formType")
            if form_type == "building":
                building_dto = BuildingCreateDTO.model_validate(data)
                new_building = building_service.create_building(
                    acting_user=request.user,
                    building_data=building_dto,
                    request=request
                )
                messages.success(request, f"Batiment {new_building.name} crée avec успex")
                return render_inertia(request, "dashboard/Properties", {
                    "building": new_building
                })
                
            elif form_type == "property":
                property_dto = PropertyCreateDTO.model_validate(data)
               
                new_property = property_service.create_property(
                    acting_user=request.user,
                    property_data=property_dto,
                    request=request
                )
                print("Property : ", new_property)
                messages.success(request, f"Propriété {new_property.name} crée avec успex")
                return render_inertia(request, "dashboard/Properties", {
                    "property": new_property
                })
            else:
                raise ValueError("Type de formulaire non supporté")
            
        except ValidationError as ve:
            errors = format_pydantic_errors(ve.errors())
            return render_inertia(request, "dashboard/Properties", {
                "errors": errors
            })
        except Exception as e:
            messages.error(request, f"Erreur lors de la création de la propriétaire : {str(e)}")
            return render_inertia(request, "dashboard/Properties", {
                "errors": [{"msg": str(e)}]
            })


    def put(self, request):
        try:
            data = self._parse_request_data(request)
            form_type = data.get('formType')
            entity_id = data.get('id')

            if not entity_id:
                raise ValueError("ID manquant pour la modification.")

            # --- CAS 1 : MISE À JOUR D'UN IMMEUBLE ---
            if form_type == 'building':
                building_dto = BuildingUpdateDTO.model_validate(data)
                
                updated_building = building_service.update_building(
                    acting_user=request.user, 
                    building_id=entity_id, 
                    building_data=building_dto, 
                    request=request
                )
                
                messages.success(request, "Immeuble mis à jour avec succès.")
                return render_inertia(request, "dashboard/Properties", {
                    "building": updated_building
                })

            # --- CAS 2 : MISE À JOUR D'UNE PROPRIÉTÉ ---
            elif form_type == 'property':
                property_dto = PropertyUpdateDTO.model_validate(data)
                
                updated_property = property_service.update_property(
                    acting_user=request.user, 
                    property_id=entity_id, 
                    property_data=property_dto, 
                    request=request
                )

                messages.success(request, "Propriété mise à jour avec succès.")
                return render_inertia(request, "dashboard/Properties", {
                    "property": updated_property
                })

            else:
                raise ValueError("Type de formulaire inconnu pour la modification.")

        except ValidationError as ve:
            errors = format_pydantic_errors(ve.errors())
            return render_inertia(request, "dashboard/Properties", {
                "errors": errors
            })
        except Exception as e:
            messages.error(request, f"Erreur lors de la modification : {str(e)}")
            return render_inertia(request, "dashboard/Properties", {
                "errors": [{"msg": str(e)}]
            })
        