from rest_framework import serializers
from django.contrib.auth import get_user_model


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'profile_picture', 'password', 'password2')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        profile_picture = validated_data.pop('profile_picture', None)
        user = User.objects.create_user(**validated_data)
        if profile_picture:
            user.profile_picture = profile_picture
            user.save()
        return user
    

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        if username and password:
            user = authenticate(request=self.context.get('request'), username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid username or password. Please try again.")
            if not user.is_active:
                raise serializers.ValidationError("This account is inactive. Please contact support.")
        else:
            raise serializers.ValidationError("Both username and password are required.")

        data = super().validate(attrs)
        return data
    


# serializers.py
from rest_framework import serializers
from .models import EmergencyProfile

class EmergencyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyProfile
        exclude = ['user']  # we'll set it from the request.user in the view
