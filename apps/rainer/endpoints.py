from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import quicke
from apps import rainer
from apps.rainer.gpt import get_gpt
from apps.rainer.instructions import build_refactor_instructions, unpack_file_ref, get_file_ref_definitions


@quicke.endpoint("rainer/tree", {
    "response_type": "RainerTree",
    "imports": [("./types", "RainerTree")]
})
def get_rainer_tree(request):
    return JsonResponse(rainer.trees, safe=False)


@quicke.endpoint("rainer/file", {
    "response_type": "string",
    "query_params": ["branch", "path"]
})
def get_file_contents(request):
    branch = request.GET.get("branch", "")
    path = request.GET.get("path", "")
    return JsonResponse(rainer.get_file_contents(branch, path), safe=False)


@csrf_exempt
@quicke.endpoint("rainer/file/new", {
    "method": "POST",
    "body_type": "RefactorRainerFile",
    "response_type": "void",
    "imports": [("./types", "RefactorRainerFile")]
})
def create_file(request):
    refactor = json.loads(request.body)
    if not refactor.get("content", ""):
        return JsonResponse({}, status=201)

    reference_definitions = get_file_ref_definitions(refactor.get("file_references", []))
    instructions = build_refactor_instructions(refactor, "create")

    response = get_gpt().send_instructions(reference_definitions + instructions)

    branch, path = unpack_file_ref(refactor)
    rainer.create_file(branch, path, f"{response}\n")

    return JsonResponse({}, status=201)


@csrf_exempt
@quicke.endpoint("rainer/file/update", {
    "method": "PUT",
    "body_type": "RefactorRainerFile",
    "response_type": "void",
    "imports": [("./types", "RefactorRainerFile")]
})
def update_file(request):
    refactor = json.loads(request.body)
    if not refactor.get("content", ""):
        return JsonResponse({}, status=201)

    reference_definitions = get_file_ref_definitions(refactor.get("file_references", []))
    instructions = build_refactor_instructions(refactor, "update")

    response = get_gpt().send_instructions(reference_definitions + instructions)

    branch, path = unpack_file_ref(refactor)
    rainer.update_file(branch, path, f"{response}\n")

    return JsonResponse({}, status=200)


@csrf_exempt
@quicke.endpoint("rainer/file/del", {
    "method": "DELETE",
    "query_params": ["branch", "path"],
    "response_type": "void"
})
def delete_file(request):
    branch = request.GET.get("branch", "")
    path = request.GET.get("path", "")
    rainer.delete_file(branch, path)
    return JsonResponse({}, status=204)


@csrf_exempt
@quicke.endpoint("rainer/directory/new", {
    "method": "POST",
    "body_type": "{branch: string, path: string}",
    "response_type": "void"
})
def create_directory(request):
    data = json.loads(request.body)
    branch = data["branch"]
    path = data["path"]
    rainer.create_directory(branch, path)
    return JsonResponse({}, status=201)


@csrf_exempt
@quicke.endpoint("rainer/directory/del", {
    "method": "DELETE",
    "query_params": ["branch", "path"],
    "response_type": "void"
})
def delete_directory(request):
    branch = request.GET.get("branch", "")
    path = request.GET.get("path", "")
    rainer.delete_directory(branch, path)
    return JsonResponse({}, status=204)
