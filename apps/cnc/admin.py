from django.contrib import admin

from apps.cnc.models import CommandTemplate, CommandTemplateItem, Instruction

admin.site.register([CommandTemplate, CommandTemplateItem, Instruction])