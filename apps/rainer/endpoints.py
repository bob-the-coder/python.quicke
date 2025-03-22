from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import quicke
from apps import rainer
from apps.rainer import get_file_path
from apps.rainer.gpt import get_gpt


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
    "body_type": "{branch: string, path: string, content?: string}",
    "response_type": "void"
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
    "body_type": "{branch: string, path: string, content: string}",
    "response_type": "void"
})
def update_file(request):
    data = json.loads(request.body)
    branch = data["branch"]
    path = data["path"]
    content = data["content"]

    file_contents = rainer.get_file_contents(branch, path)

    abs_path = get_file_path(branch, path)
    refactor_instructions = f"REFACTOR {branch} {path}\nFILE PATH {abs_path}\nREFACTOR INSTRUCTIONS\n```{content}```"
    output_instructions = "OUTPUT THE UPDATED FILE AS PLAINTEXT"
    response = get_gpt().send_instructions([file_contents, refactor_instructions, output_instructions])

    print(response)

    # rainer.update_file(branch, path, content)
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
