from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import quicke
from apps import rainer
from .gpt import get_gpt
from .instructions import build_refactor_instructions, unpack_file_ref, get_file_ref_definitions
from .models import CodeGenerationData

# 🌳 Endpoint to get the Rainer tree structure
@quicke.endpoint("rainer/tree", {
    "response_type": "RainerTree",
    "imports": [("./types", "RainerTree")]
})
def get_rainer_tree(request):
    # Returns the tree structure for Rainer
    return JsonResponse(rainer.trees, safe=False)

# 📁 Endpoint to get the contents of a specific file
@quicke.endpoint("rainer/file", {
    "response_type": "string",
    "query_params": ["branch", "path"]
})
def get_file_contents(request):
    branch = request.GET.get("branch", "")  # Get the branch from the query parameter
    path = request.GET.get("path", "")      # Get the file path from the query parameter
    # Return the contents of the requested file
    return JsonResponse(rainer.get_file_contents(branch, path), safe=False)

# ✍️ Endpoint to create a new file
@csrf_exempt
@quicke.endpoint("rainer/file/new", {
    "method": "POST",
    "body_type": "RefactorRainerFile",
    "response_type": "RainerFile",
    "imports": [("./types", "RefactorRainerFile"), ("./types", "RainerFile")]
})
def create_file(request):
    refactor = json.loads(request.body)  # Parse the incoming JSON payload
    if not refactor.get("content", ""):  # Check if content is provided
        return JsonResponse({}, status=201)

    # 🎯 Get file reference definitions and build instructions for creation
    reference_definitions = get_file_ref_definitions(refactor.get("file_references", []))
    instructions = build_refactor_instructions(refactor, "create")

    # 📩 Send instructions to the GPT model and get the response
    response = get_gpt().send_instructions(reference_definitions + instructions)

    # 🗂️ Unpack the branch and path from the refactor
    branch, path = unpack_file_ref(refactor)
    rainer.create_file(branch, path, f"{response}\n")  # Create the file with the GPT response

    # 📜 Log the operation in the CodeGenerationData model
    CodeGenerationData.objects.create(
        llm_model="YourLLMModel",  # replace with the actual model name
        instructions=instructions,
        response=response,
        rainer_file={"branch": branch, "path": path}
    )

    # ✅ Return the branch and path of the newly created file
    return JsonResponse({"branch": branch, "path": path}, status=201)

# 🔄 Endpoint to update an existing file
@csrf_exempt
@quicke.endpoint("rainer/file/update", {
    "method": "PUT",
    "body_type": "RefactorRainerFile",
    "response_type": "RainerFile",
    "imports": [("./types", "RefactorRainerFile"), ("./types", "RainerFile")]
})
def update_file(request):
    refactor = json.loads(request.body)  # Parse the incoming JSON payload
    if not refactor.get("content", ""):  # Check if content is provided
        return JsonResponse({}, status=201)

    # 🎯 Get file reference definitions and build instructions for updating
    reference_definitions = get_file_ref_definitions(refactor.get("file_references", []))
    instructions = build_refactor_instructions(refactor, "update")

    # 📩 Send instructions to the GPT model and get the response
    response = get_gpt().send_instructions(reference_definitions + instructions)

    # 🗂️ Unpack the branch and path from the refactor
    branch, path = unpack_file_ref(refactor)
    rainer.update_file(branch, path, f"{response}\n")  # Update the file with the GPT response

    # 📜 Log the operation in the CodeGenerationData model
    CodeGenerationData.objects.create(
        llm_model="YourLLMModel",  # replace with the actual model name
        instructions=instructions,
        response=response,
        rainer_file={"branch": branch, "path": path}
    )

    # ✅ Return the branch and path of the updated file
    return JsonResponse({"branch": branch, "path": path}, status=200)

# 🗑️ Endpoint to delete a file
@csrf_exempt
@quicke.endpoint("rainer/file/del", {
    "method": "DELETE",
    "query_params": ["branch", "path"],
    "response_type": "void"
})
def delete_file(request):
    branch = request.GET.get("branch", "")  # Get the branch from the query parameter
    path = request.GET.get("path", "")      # Get the file path from the query parameter
    rainer.delete_file(branch, path)  # Delete the specified file
    return JsonResponse({}, status=204)  # Return a success status

# 📁 Endpoint to create a new directory
@csrf_exempt
@quicke.endpoint("rainer/directory/new", {
    "method": "POST",
    "body_type": "{branch: string, path: string}",
    "response_type": "void"
})
def create_directory(request):
    data = json.loads(request.body)  # Parse the incoming JSON payload
    branch = data["branch"]  # Extract the branch from the data
    path = data["path"]      # Extract the path from the data
    rainer.create_directory(branch, path)  # Create the new directory
    return JsonResponse({}, status=201)  # Return a success status

# 🗑️ Endpoint to delete a directory
@csrf_exempt
@quicke.endpoint("rainer/directory/del", {
    "method": "DELETE",
    "query_params": ["branch", "path"],
    "response_type": "void"
})
def delete_directory(request):
    branch = request.GET.get("branch", "")  # Get the branch from the query parameter
    path = request.GET.get("path", "")      # Get the directory path from the query parameter
    rainer.delete_directory(branch, path)  # Delete the specified directory
    return JsonResponse({}, status=204)  # Return a success status
