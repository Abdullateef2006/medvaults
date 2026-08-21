from django.contrib.auth.backends import ModelBackend
from .models import Hospital

class HospitalBackend(ModelBackend):
    def authenticate(self, request, registration_num=None, password=None, **kwargs):
        try:
            hospital = Hospital.objects.get(verified_registration_num=registration_num)
            user = hospital.user
            if user.check_password(password):
                return user
        except Hospital.DoesNotExist:
            return None

    def get_user(self, user_id):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None