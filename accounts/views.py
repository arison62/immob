from django.views import View
from django.contrib.auth import login
from inertia import render as render_inertia
from django.views import View
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.shortcuts import redirect
from inertia import render as render_inertia 
from .auth_backends import AccountLockedError 

SUCCESS_URL = '/dashboard' # Mettez votre URL de tableau de bord
LOGIN_URL = '/accounts/login' # Mettez votre URL de connexion

class LoginView(View):
    def get(self, request):
        return render_inertia(request, "Login")
    
    def post(self, request):
        
        email = request.POST.get("email")
        password = request.POST.get("password")
        
        # 1. Vérification des données
        if not email or not password:
            # Erreur de données manquantes (soumission de formulaire invalide)
            # Retourner les erreurs spécifiques pour le formulaire Inertia

            messages.error(request, "Le champ email et le champ mot de passe sont requis.")

            return render_inertia(request, "Login", props={
                "errors": {
                    "email": "Le champ email est requis.",
                    "password": "Le champ mot de passe est requis."
                }
            })

        # 2. Tentative d'authentification et gestion des erreurs
        try:
            # L'appel à authenticate() va déclencher votre LockoutAuthBackend
            user = authenticate(request, username=email, password=password)
            
            if user is not None:
                # Authentification réussie
                login(request, user)
                # Utiliser Inertia pour la redirection après succès (réponse 302)
                messages.success(request, "Connexion reussie !")
                return redirect(SUCCESS_URL) 
            else:
                # Authentification échouée (Mot de passe incorrect ou utilisateur inexistant)
                messages.error(request, "Identifiant ou mot de passe incorrect.")
                return render_inertia(request, "Login", props={
                    "errors": {
                        "email": "Identifiant ou mot de passe incorrect."
                    }
                })
                
        except AccountLockedError as e:
            # Le compte est bloqué ! (Exception levée par le LockoutAuthBackend)
            # Retourner le message d'erreur pour le composant Inertia
            messages.add_message(request, messages.ERROR, str(e))
            return render_inertia(request, "Login", props={
                "errors":{
                    "globalError": str(e) + " Veuillez contacter un administrateur."
                }
            })
            