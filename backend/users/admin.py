from django.contrib import admin
from .models import User,OTP

@admin.register(User)#This connects the User model to admin panel
class UserAdmin(admin.ModelAdmin):#customizing how User appears in admin
    list_display = ('username','email','phone')#Controls what columns i see in admin table


@admin.register(OTP)#Registers OTP model to admin panel
class OTPAdmin(admin.ModelAdmin):#Customizes OTP display
    list_display = ('user','otp','created_at')
