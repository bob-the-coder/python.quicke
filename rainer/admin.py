from django.contrib import admin
from .models import CodeGenerationData

@admin.register(CodeGenerationData)  # 📝 Registering the CodeGenerationData model with the admin site
class CodeGenerationDataAdmin(admin.ModelAdmin):
    # ⚙️ Configuration for displaying the model in the admin interface
    list_display = ('created_at', 'rainer_branch', 'rainer_path', 'llm_model', "drop_number")  # 👀 Fields to display in the list view
    search_fields = ('llm_model',)  # 🔍 Fields to search in the admin interface
    list_filter = ('llm_model',)  # 📊 Fields to filter the list view
