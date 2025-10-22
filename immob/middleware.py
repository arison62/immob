from django.contrib.messages import get_messages
from inertia import share


class DataShareMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        messages = []
        for message in get_messages(request):
            message = {
                "message": message.message,
                "level": message.level,
                "tags": message.tags,
                "extra_tags": message.extra_tags,
                "level_tag": message.level_tag,
            }
            messages.append(message)
        share(request, messages=messages,)

        response = self.get_response(request)

        return response

class UserAuthMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = dict()
        if request.user.is_authenticated:
            user = {
                "id": request.user.id,
                "name": request.user.get_full_name(),
                "username": request.user.username,
                "email": request.user.email,
                "role": request.user.role
            }
        share(request, auth={"user": user})
        response = self.get_response(request)
        return response
