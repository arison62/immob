from inertia import render as render_inertia
from django.shortcuts import render
from django.http.response import JsonResponse, HttpResponse


def home(request):
    return render_inertia(request, "Index")
