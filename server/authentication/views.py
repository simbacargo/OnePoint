from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from .forms import SignupForm
from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template.loader import render_to_string
# from core.tokens import account_activation_token
from django.core.mail import EmailMessage
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth import (
    authenticate, get_user_model, password_validation,
)
User = get_user_model()


@csrf_exempt
def signup_api(request):
    if request.method == 'POST':
        body_unicode  = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        username:str = body['name']
        email:str = body['email']
        mobile:int = body['phonenumber']
        password:str = body['password']
        user=User.objects.create_user(
            username=username,
            email=email,
            # is_active = 1,
            mobile=mobile,
            password=password,)
        user.save()
        return HttpResponse({'0':'k'})
    else:
        return KeyError



from django.http import JsonResponse, HttpResponse
import random
def is_htmx_request(request):
    return 'HX-Request' in request.headers

def signup(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            new_password = form.cleaned_data.get('password1')  # Use 'password1' as it’s the field for the password
            user.set_password(new_password)
            user.save()

            # Sending email
            current_site = get_current_site(request)
            account_activation_token = random.randint(1000,9999)
            message = render_to_string('authentication/acc_active_email.html', {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                # 'token': account_activation_token.make_token(user),
                'token': account_activation_token,
            })
            mail_subject = 'Activate your account In Bin Suleiman Systems.'
            to_email = form.cleaned_data.get('email')
            email = EmailMessage(mail_subject, message, to=[to_email])
            # email.send()

            if is_htmx_request(request):
                return JsonResponse({'message': 'Please confirm your email address to complete the registration'}, status=200)
            else:
                return HttpResponse('Please confirm your email address to complete the registration')

        else:
            if is_htmx_request(request):
                # Convert form errors to a format suitable for JSON response
                errors = form.errors.get_json_data()
                return JsonResponse({'errors': errors}, status=400)
            else:
                # Render form with errors for non-HTMX requests
                return render(request, 'registration/signup.html', {'form': form})

    else:
        form = SignupForm()

    return render(request, 'registration/signup.html', {'form': form})
    
from django.urls import reverse
def activate(request, uidb64, token: str):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()
        login(request, user)
        # return redirect('home')
        # return redirect(reverse('payment:process'))
        return render(request, 'authentication/thanx.html')
    else:
        return render(request, 'authentication/thanx.html')





from rest_framework import serializers
 
class userSerializers(serializers.ModelSerializer):
 
    class Meta:
        model = User
        fields =  '__all__'


from rest_framework import viewsets
 
 
class userviewsets(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = userSerializers