from inertia import render as render_inertia
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from holdings.services.building_service import building_service
from holdings.services.property_service import property_service


class PropertiesView(LoginRequiredMixin, View):
    login_url = "/accounts/login"

    def get(self, request):
        list_buildings = building_service.list_buildings_for_user(request.user)
        list_properties = property_service.list_all_properties_for_user(request.user)
        print(list_properties)
        return render_inertia(request, "dashboard/Properties", {
            "buildings": list_buildings
        })

