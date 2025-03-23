from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import quicke
from apps import rainer
from apps.rainer import get_file_path
from apps.rainer.gpt import get_gpt
from apps.rainer.instructions import build_file_ref, build_refactor_instructions, unpack_file_ref


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
    "body_type": "RainerFile & {content?: string}",
    "response_type": "void",
    "imports": [("./models", "RainerFile")]
})
def create_file(request):
    data = json.loads(request.body)
    branch = data["branch"]
    path = data["path"]
    content = data.get("content", "")

    rainer.create_file(branch, path, content)
    return JsonResponse({}, status=201)


@csrf_exempt
@quicke.endpoint("rainer/file/update", {
    "method": "PUT",
    "body_type": "UpdateRainerFile",
    "response_type": "void",
    "imports": [("./types", "UpdateRainerFile")]
})
def update_file(request):
    refactor = json.loads(request.body)

    reference_definitions = [
        build_file_ref(ref)
        for ref in refactor["file_references"]
    ]
    instructions = build_refactor_instructions(refactor)

    print(reference_definitions + instructions)

    output_instruction = """
>OUTPUT ONLY THE FULL, UPDATED FILE CODE
>OUTPUT AS PLAINTEXT WITHOUT MARKDOWN ANNOTATIONS"""

    response = get_gpt().send_instructions(reference_definitions + instructions + [output_instruction])

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
