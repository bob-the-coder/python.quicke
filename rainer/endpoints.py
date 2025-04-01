import json
import mimetypes
import os

from django.db import models
from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt

import quicke
from rainer.models import CodeGenerationData
from rainer.types import RainerFile
from .fileapi import (
    get_rainer_file_contents, project_trees, update_rainer_file, unpack_file_ref,
    create_rainer_directory, create_rainer_file, delete_rainer_file, delete_rainer_directory,
    get_file_path
)
from .settings import DEFAULT_GPT_MODEL


# 🌳 Endpoint to get the Rainer tree structure
@quicke.endpoint("rainer/tree", {
    "response_type": "RainerTree",
    "imports": [("./types", "RainerTree")]
})
def get_rainer_tree(_):
    return JsonResponse(project_trees, safe=False)


# Ensure `.webp` and other formats are recognized
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("image/png", ".png")
mimetypes.add_type("image/jpeg", ".jpg")
mimetypes.add_type("image/jpeg", ".jpeg")
mimetypes.add_type("image/gif", ".gif")


# 📁 Endpoint to get the contents of a specific file
@quicke.endpoint("rainer/file", {
    "response_type": "string",
    "query_params": ["project", "path"]
})
def get_file_contents(request):
    project = request.GET.get("project", "")
    path = request.GET.get("path", "")
    file_path = get_file_path(project, path).replace("\\", "/")

    mime_type, _ = mimetypes.guess_type(file_path)
    print(file_path, mime_type)

    if not os.path.isfile(file_path):
        return JsonResponse({"error": "File not found"}, status=404)

    if mime_type and mime_type.startswith("image/"):
        return FileResponse(open(file_path, "rb"), content_type=mime_type)

    return JsonResponse(get_rainer_file_contents(project, path), safe=False)


# ✍️ Endpoint to create a new file
@csrf_exempt
@quicke.endpoint("rainer/file/new", {
    "method": "POST",
    "body_type": "RefactorRainerFile",
    "response_type": "RainerFile",
    "imports": [("./types", "RefactorRainerFile"), ("./models", "RainerFile")]
})
def create_file(request):
    refactor_file = json.loads(request.body)
    project, path = unpack_file_ref(refactor_file)

    from rainer.operations import makefile_op
    response = makefile_op.execute(refactor_file)
    if not response.strip() or response.strip().startswith("FAILED"):
        print("failed")
        return JsonResponse({"project": project, "path": path}, status=200)

    create_rainer_file(project, path, f"{response}\n")

    CodeGenerationData.objects.create(
        llm_model=DEFAULT_GPT_MODEL,
        instructions=[],
        response=response,
        rainer_project=project,
        rainer_path=path,
        drop_number=CodeGenerationData.create_drop_number()
    )

    return JsonResponse({"project": project, "path": path}, status=201)


# 🔄 Endpoint to update an existing file
@csrf_exempt
@quicke.endpoint("rainer/file/update", {
    "method": "PUT",
    "body_type": "RefactorRainerFile",
    "response_type": "RainerFile",
    "imports": [("./types", "RefactorRainerFile"), ("./models", "RainerFile")]
})
def update_file(request):
    refactor_file = json.loads(request.body)
    project, path = unpack_file_ref(refactor_file)

    from rainer.operations import refactor_op_new
    response = refactor_op_new.execute(refactor_file)
    if not response.strip() or response.strip().startswith("FAILED"):
        print("failed")
        return JsonResponse({"project": project, "path": path}, status=200)

    update_rainer_file(project, path, f"{response}\n")

    CodeGenerationData.objects.create(
        llm_model=DEFAULT_GPT_MODEL,
        instructions=[],
        response=response,
        rainer_project=project,
        rainer_path=path,
        drop_number=CodeGenerationData.create_drop_number()
    )

    return JsonResponse({"project": project, "path": path}, status=200)


# 🗑️ Endpoint to delete a file
@csrf_exempt
@quicke.endpoint("rainer/file/del", {
    "method": "DELETE",
    "query_params": ["project", "path"],
    "response_type": "void"
})
def delete_file(request):
    project = request.GET.get("project", "")
    path = request.GET.get("path", "")
    delete_rainer_file(project, path)
    return JsonResponse({}, status=204)


# 📁 Endpoint to create a new directory
@csrf_exempt
@quicke.endpoint("rainer/directory/new", {
    "method": "POST",
    "body_type": "{project: string, path: string}",
    "response_type": "void"
})
def create_directory(request):
    data = json.loads(request.body)
    project = data["project"]
    path = data["path"]
    create_rainer_directory(project, path)
    return JsonResponse({}, status=201)


# 🗑️ Endpoint to delete a directory
@csrf_exempt
@quicke.endpoint("rainer/directory/del", {
    "method": "DELETE",
    "query_params": ["project", "path"],
    "response_type": "void"
})
def delete_directory(request):
    project = request.GET.get("project", "")
    path = request.GET.get("path", "")
    delete_rainer_directory(project, path)
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
    drops = CodeGenerationData.objects.filter(rainer_project=rainer_file.project, rainer_path=rainer_file.path).values(
        'drop_number').annotate(count=models.Count('id'))
    drop_dict = {str(drop['drop_number']): drop['count'] for drop in drops}
    return JsonResponse(drop_dict, safe=False)
