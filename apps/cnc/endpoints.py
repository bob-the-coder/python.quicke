import json

from django.db.models.aggregates import Max
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET

import quicke
from apps.cnc.models import Instruction, CommandTemplate, CommandTemplateItem
from django.db.models import Count, Q



@require_GET
@quicke.endpoint("instructions",{
    "method": "GET",
    "response_type": "Instruction[]",
    "imports": [("./models", "Instruction")]
})
def list_instructions(request):
    """List all commands with optional filtering by name or group."""
    name = request.GET.get("name", "")
    group = request.GET.get("group", "")

    instructions = Instruction.objects.all()
    if name:
        instructions = instructions.filter(text__icontains=name)
    if group:
        instructions = instructions.filter(group__icontains=group)

    return JsonResponse([{
        "id": i.id,
        "name": i.name,
        "text": i.text,
        "group": i.group,
        "instruction_type": i.instruction_type
    } for i in instructions], safe=False)


@csrf_exempt
@require_POST
@quicke.endpoint("commands/create", {
    "method": "POST",
    "response_type": "CommandTemplate",
    "imports": [("./models", "CommandTemplate")]
})
def create_command_template(request):
    """Create a new command template."""
    command = CommandTemplate.objects.create(name="Untitled Command")
    return JsonResponse({"id": command.id, "name": command.name})


@require_GET
@quicke.endpoint("commands/<uuid:command_id>", {
    "method": "GET",
    "response_type": "CommandTemplate",
    "imports": [("./models", ["CommandTemplate", "CommandTemplateItem", "Instruction"])]
})
def get_command(request, command_id):
    """Fetch a specific command template by ID, including full instruction details if available."""
    try:
        command = CommandTemplate.objects.get(id=command_id)
    except CommandTemplate.DoesNotExist:
        return JsonResponse({"error": "Command not found"}, status=404)

    # Fetch related command items with full instruction details if available
    items = CommandTemplateItem.objects.filter(template=command).select_related("instruction")

    serialized_items = []
    for item in items:
        serialized_item = {
            "id": item.id,
            "order": item.order,
            "custom_text": item.custom_text,
            "instruction": None
        }
        if item.instruction:
            serialized_item["instruction"] = {
                "id": item.instruction.id,
                "name": item.instruction.name,
                "text": item.instruction.text,
                "group": item.instruction.group,
                "instruction_type": item.instruction.instruction_type
            }
        serialized_items.append(serialized_item)

    return JsonResponse({
        "id": command.id,
        "name": command.name,
        "updated_at": command.updated_at,
        "items": serialized_items,
        "arguments": command.arguments,
    })


@require_GET
@quicke.endpoint("commands/list", {
    "method": "GET",
    "response_type": "CommandListItem[]",
    "imports": [("./types", "CommandListItem")]
})
def list_commands(request):
    """List all command templates with optional filtering by name."""
    name = request.GET.get("name", "")

    commands = CommandTemplate.objects.annotate(
        total_items=Count("items"),
        total_custom=Count("items", filter=Q(items__instruction=None))
    )

    if name:
        commands = commands.filter(name__icontains=name)

    return JsonResponse([
        {
            "id": cmd.id,
            "name": cmd.name,
            "updated_at": cmd.updated_at,
            "total_items": cmd.total_items,
            "total_custom": cmd.total_custom,
        }
        for cmd in commands
    ], safe=False)


@csrf_exempt
@require_POST
@quicke.endpoint("commands/<uuid:command_id>/delete", {
    "method": "POST",
    "response_type": "DeleteResponse",
    "imports": [("./types", "DeleteResponse")]
})
def delete_command_template(request, command_id):
    """Delete a command template (hard delete)."""
    command = CommandTemplate.objects.get(id=command_id)
    command.delete()
    return JsonResponse({"status": "deleted", "id": command_id})


@csrf_exempt
@require_POST
@quicke.endpoint("commands/<command_id>/items/instruction/", {
    "method": "POST",
    "body_type": "InstructionInput",
    "response_type": "CommandTemplateItem",
    "imports": [("./models", "CommandTemplateItem"), ("./types", "InstructionInput")]
})
def add_instruction_to_template(request, command_id):
    """Add an instruction (either predefined or custom) to a command template."""
    command = CommandTemplate.objects.get(id=command_id)
    data = json.loads(request.body)

    instruction_id = data.get("instruction_id")
    custom_text = data.get("custom_text")

    if not instruction_id and not custom_text:
        return JsonResponse({"error": "Must provide either instruction_id or custom_text"}, status=400)

    max_order = command.items.aggregate(max_order=Max("order"))["max_order"] or 0
    order = max_order + 1

    item = CommandTemplateItem.objects.create(
        template=command,
        instruction_id=instruction_id,
        custom_text=custom_text,
        order=order
    )

    return JsonResponse({"id": item.id, "instruction_id": item.instruction_id, "custom_text": item.custom_text, "order": item.order})


@csrf_exempt
@require_POST
@quicke.endpoint("commands/<uuid:command_id>/items/<uuid:item_id>/instruction/", {
    "method": "POST",
    "body_type": "UpdateInstructionInput",
    "response_type": "CommandTemplateItem",
    "imports": [("./models", "CommandTemplateItem"), ("./types", "UpdateInstructionInput")]
})
def update_instruction_in_template(request, command_id, item_id):
    """Update an instruction reference inside a command template."""
    item = CommandTemplateItem.objects.get(id=item_id, template_id=command_id)
    data = json.loads(request.body)

    instruction_id = data.get("instruction_id")
    if not instruction_id:
        return JsonResponse({"error": "instruction_id is required"}, status=400)

    item.instruction_id = instruction_id
    item.save(update_fields=["instruction_id", "updated_at"])

    command = CommandTemplate.objects.get(id=command_id)
    command.save(update_fields=["updated_at"])

    return JsonResponse({"id": item.id, "instruction_id": item.instruction_id})


@csrf_exempt
@require_POST
@quicke.endpoint("commands/<uuid:command_id>/items/custom/", {
    "method": "POST",
    "body_type": "CustomInstructionInput",
    "response_type": "CommandTemplateItem",
    "imports": [("./models", "CommandTemplateItem"), ("./types", "CustomInstructionInput")]
})
def add_custom_instruction(request, command_id):
    """Add a custom instruction (user-defined text) to a command template."""
    command = CommandTemplate.objects.get(id=command_id)
    data = json.loads(request.body)

    custom_text = data.get("custom_text") or ""

    max_order = command.items.aggregate(max_order=Max("order"))["max_order"] or 0
    order = max_order + 1

    item = CommandTemplateItem.objects.create(
        template=command,
        custom_text=custom_text,
        order=order
    )

    return JsonResponse({"id": item.id, "custom_text": item.custom_text, "order": item.order})


@csrf_exempt
@require_POST
@quicke.endpoint("commands/<uuid:command_id>/items/<uuid:item_id>/custom/", {
    "method": "POST",
    "body_type": "UpdateCustomInstructionInput",
    "response_type": "CommandTemplateItem",
    "imports": [("./models", "CommandTemplateItem"), ("./types", "UpdateCustomInstructionInput")]
})
def update_custom_instruction(request, command_id, item_id):
    """Update the text of a custom instruction inside a command template."""
    item = CommandTemplateItem.objects.get(id=item_id, template_id=command_id)
    data = json.loads(request.body)

    custom_text = data.get("custom_text", "")

    item.custom_text = custom_text
    item.save(update_fields=["custom_text", "updated_at"])

    command = CommandTemplate.objects.get(id=command_id)
    command.save(update_fields=["updated_at"])

    return JsonResponse({"id": item.id, "custom_text": item.custom_text})


@csrf_exempt
@require_POST
@quicke.endpoint("commands/<uuid:command_id>/items/<uuid:item_id>/move/", {
    "method": "POST",
    "body_type": "MoveItemInput",
    "response_type": "MoveItemResponse",
    "imports": [("./models", "CommandTemplateItem"), ("./types", ["MoveItemInput", "MoveItemResponse"])]
})
def move_command_template_item(request, command_id, item_id):
    """Move a command template item up or down by swapping order values."""
    data = json.loads(request.body)
    direction = data.get("direction")

    if direction not in ["up", "down"]:
        return JsonResponse({"error": "Invalid direction, must be 'up' or 'down'"}, status=400)

    item = CommandTemplateItem.objects.get(id=item_id, template_id=command_id)

    swap_item = (
        CommandTemplateItem.objects.filter(
            template_id=command_id,
            order__lt=item.order if direction == "up" else item.order__gt,
        )
        .order_by("-order" if direction == "up" else "order")
        .first()
    )

    if not swap_item:
        return JsonResponse({"error": f"No item to move {direction}"}, status=400)

    # Swap order values
    item.order, swap_item.order = swap_item.order, item.order
    item.save(update_fields=["order"])
    swap_item.save(update_fields=["order"])

    return JsonResponse({
        "status": "success",
        "moved_item": {"id": item.id, "new_order": item.order},
        "swapped_item": {"id": swap_item.id, "new_order": swap_item.order}
    })


@require_GET
@quicke.endpoint("commands/<uuid:command_id>/preview", {
    "method": "GET",
    "response_type": "CommandPreview",
    "imports": [("./types", "CommandPreview")]
})
def get_command_preview(request, command_id):
    """Builds and returns a preview of the command by concatenating instruction texts and custom texts."""
    try:
        command = CommandTemplate.objects.get(id=command_id)
    except CommandTemplate.DoesNotExist:
        return JsonResponse({"error": "Command not found"}, status=404)

    return JsonResponse({"command_id": command.id, "preview": command.compile(True)})


@csrf_exempt
@require_POST
@quicke.endpoint("commands/<uuid:command_id>/items/<uuid:item_id>/delete/", {
    "method": "POST",
    "response_type": "DeleteResponse",
    "imports": [("./types", "DeleteResponse")]
})
def delete_command_template_item(request, command_id, item_id):
    """Delete a specific command template item (hard delete)."""
    try:
        item = CommandTemplateItem.objects.get(id=item_id, template_id=command_id)
    except CommandTemplateItem.DoesNotExist:
        return JsonResponse({"error": "Command template item not found"}, status=404)

    item.delete()
    return JsonResponse({"status": "deleted", "id": item_id})
