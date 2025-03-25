from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import quicke
from apps import rainer
from apps.rainer.gpt.gpt import get_gpt
from .instructions import build_refactor_instructions, unpack_file_ref, get_file_ref_definitions
from .models import CodeGenerationData, RainerFile
from django.db import models

# 🌳 Endpoint to get the Rainer tree structure
@quicke.endpoint("rainer/tree", {
    "response_type": "RainerTree",
    "imports": [("./types", "RainerTree")]
})
def get_rainer_tree(request):
    return JsonResponse(rainer.trees, safe=False)

# 📁 Endpoint to get the contents of a specific file
@quicke.endpoint("rainer/file", {
    "response_type": "string",
    "query_params": ["branch", "path"]
})
def get_file_contents(request):
    branch = request.GET.get("branch", "")
    path = request.GET.get("path", "")
    return JsonResponse(rainer.get_file_contents(branch, path), safe=False)

# ✍️ Endpoint to create a new file
@csrf_exempt
@quicke.endpoint("rainer/file/new", {
    "method": "POST",
    "body_type": "RefactorRainerFile",
    "response_type": "RainerFile",
    "imports": [("./types", "RefactorRainerFile"), ("./models", "RainerFile")]
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

    CodeGenerationData.objects.create(
        llm_model="gpt-4o-mini",
        instructions=instructions,
        response=response,
        rainer_branch=branch,
        rainer_path=path,
        drop_number=CodeGenerationData.create_drop_number()
    )

    return JsonResponse({"branch": branch, "path": path}, status=201)

# 🔄 Endpoint to update an existing file
@csrf_exempt
@quicke.endpoint("rainer/file/update", {
    "method": "PUT",
    "body_type": "RefactorRainerFile",
    "response_type": "RainerFile",
    "imports": [("./types", "RefactorRainerFile"), ("./models", "RainerFile")]
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

    CodeGenerationData.objects.create(
        llm_model="gpt-4o-mini",
        instructions=instructions,
        response=response,
        rainer_branch=branch,
        rainer_path=path,
        drop_number=CodeGenerationData.create_drop_number()
    )

    return JsonResponse({"branch": branch, "path": path}, status=200)

# 🗑️ Endpoint to delete a file
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

# 📁 Endpoint to create a new directory
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

# 🗑️ Endpoint to delete a directory
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


# 📊 Endpoint to get file drops based on RainerFile
@csrf_exempt
@quicke.endpoint("rainer/file/drops", {
    "method": "POST",
    "body_type": "RainerFile",
    "response_type": "FileDrops",
    "imports": [("./types", "FileDrops"), ("./models", "RainerFile")]
})
def get_file_drops(request):
    rainer_file = RainerFile.from_dict(json.loads(request.body))
    drops = CodeGenerationData.objects.filter(rainer_branch=rainer_file.branch, rainer_path=rainer_file.path).values('drop_number').annotate(count=models.Count('id'))
    drop_dict = {str(drop['drop_number']): drop['count'] for drop in drops}
    return JsonResponse(drop_dict, safe=False)
