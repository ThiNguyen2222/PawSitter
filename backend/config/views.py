from django.http import HttpResponse

def index(request):
    return HttpResponse("PawSitter backend is running ✅")
