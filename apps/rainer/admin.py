from django.contrib import admin
from .models import CodeGenerationData

@admin.register(CodeGenerationData)
class CodeGenerationDataAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'rainer_branch', 'rainer_path', 'llm_model', "drop_number")
    search_fields = ('llm_model',)
    list_filter = ('llm_model',)
