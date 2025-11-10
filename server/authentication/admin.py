from __future__ import unicode_literals

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin 
from .models import *



class MyUserAdmin(UserAdmin):
	list_display =	('id','username','email')
# 	search_fields =	('username','email')
# 	# readonly_fields =	('username','email')



# 	filter_horizontal=()
# 	list_filter=()
	fieldsets=()
	

	fields = (
		'firstname',
		# 'profile_picture',
		'lastname',
		'username',
# 		'email',
# 		'gender',
		'is_admin',
# 		'date_of_birth',
     )



admin.site.register(User, MyUserAdmin)