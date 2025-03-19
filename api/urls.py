import logging

from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
router = routers.DefaultRouter()

logger = logging.getLogger(__name__)
#
#
# from backend.agents.models import ModeratorAgent
# from backend.assertions.models import AssertionSet, Assertion, AssertionParsing
# from backend.evaluations.models import Evaluation, EvaluationTarget, BulkEvaluation
#
# models_for_admin = [
#     AssertionSet, Assertion, AssertionParsing,
#     Evaluation, BulkEvaluation, EvaluationTarget,
#     ModeratorAgent,
# ]
#
# for model in models_for_admin:
#     try:
#         admin.site.register(model)
#     except admin.sites.AlreadyRegistered:
#         logger.warning(f"{model.__name__} is already registered in admin site.")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(router.urls)),
    path('', include("quicke.urls")),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
