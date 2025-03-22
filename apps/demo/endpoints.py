from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import quicke
from apps.demo.models import Demo


@quicke.endpoint("demo-basic", {
    "response_type": "DemoBasic",
    "imports": [("./models", "DemoBasic")]
})
def demo_basic():
    return JsonResponse(list(Demo.objects.all().values()), safe=False)


@quicke.endpoint("demo", {
    "response_type": "Demo[]",
    "imports": [("./models", "Demo")]
})
def list_demo():
    return JsonResponse(list(Demo.objects.all().values()), safe=False)


@quicke.endpoint("demo/<uuid:id>", {
    "response_type": "Demo",
    "imports": [("./models", "Demo")],
    "query_params": ["name", "sort"]
})
def retrieve_demo(id: int):
    try:
        demo = Demo.objects.get(id=id)
        return JsonResponse(demo.to_dict())  # Assuming `to_dict` is implemented
    except Demo.DoesNotExist:
        return JsonResponse({"error": "Not found"}, status=404)


@csrf_exempt
@quicke.endpoint("demo", {
    "method": "POST",
    "body_type": "Demo",
    "response_type": "Demo",
    "imports": [("./models", "Demo")]
})
def create_demo(request):
    data = json.loads(request.body)
    demo = Demo.objects.create(**data)
    return JsonResponse(demo.to_dict(), status=201)


@csrf_exempt
@quicke.endpoint("demo/<uuid:id>", {
    "method": "PUT",
    "body_type": "Demo",
    "response_type": "Demo",
    "imports": [("./models", "Demo")]
})
def update_demo(request, id: int):
    try:
        data = json.loads(request.body)
        demo = Demo.objects.get(id=id)
        for key, value in data.items():
            setattr(demo, key, value)
        demo.save()
        return JsonResponse(demo.to_dict())
    except Demo.DoesNotExist:
        return JsonResponse({"error": "Not found"}, status=404)


@csrf_exempt
@quicke.endpoint("demo/<uuid:id>", {
    "method": "DELETE",
    "response_type": "void",
    "imports": [("./models", "Demo")]
})
def delete_demo(id: int):
    try:
        demo = Demo.objects.get(id=id)
        demo.delete()
        return JsonResponse({}, status=204)
    except Demo.DoesNotExist:
        return JsonResponse({"error": "Not found"}, status=404)
