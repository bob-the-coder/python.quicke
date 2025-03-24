// Auto-generated TypeScript API functions

import { fetchJSON } from '../../fetchJSON.ts';

import { CommandTemplate, CommandTemplateItem, Instruction } from './models';
import { CommandListItem, CommandPreview, CustomInstructionInput, DeleteResponse, InstructionInput, MoveItemInput, MoveItemResponse, UpdateCustomInstructionInput, UpdateInstructionInput } from './types';

export async function endpoint_add_custom_instruction(
	params: { command_id: string },
	body: CustomInstructionInput
): Promise<CommandTemplateItem> {
	return fetchJSON(`commands/${params.command_id}/items/custom/` , {
		method: "POST",
		body: JSON.stringify(body)
	});
}

export async function endpoint_add_instruction_to_template(
	params: { command_id: string },
	body: InstructionInput
): Promise<CommandTemplateItem> {
	return fetchJSON(`commands/${params.command_id}/items/instruction/` , {
		method: "POST",
		body: JSON.stringify(body)
	});
}

export async function endpoint_create_command_template(): Promise<CommandTemplate> {
	return fetchJSON('commands/create', {
		method: "POST"
	});
}

export async function endpoint_delete_command_template(
	params: { command_id: string }
): Promise<DeleteResponse> {
	return fetchJSON(`commands/${params.command_id}/delete` , {
		method: "POST"
	});
}

export async function endpoint_delete_command_template_item(
	params: { command_id: string, item_id: string }
): Promise<DeleteResponse> {
	return fetchJSON(`commands/${params.command_id}/items/${params.item_id}/delete/` , {
		method: "POST"
	});
}

export async function endpoint_get_command(
	params: { command_id: string }
): Promise<CommandTemplate> {
	return fetchJSON(`commands/${params.command_id}` , {
		method: "GET"
	});
}

export async function endpoint_get_command_preview(
	params: { command_id: string }
): Promise<CommandPreview> {
	return fetchJSON(`commands/${params.command_id}/preview` , {
		method: "GET"
	});
}

export async function endpoint_list_commands(): Promise<CommandListItem[]> {
	return fetchJSON('commands/list', {
		method: "GET"
	});
}

export async function endpoint_list_instructions(): Promise<Instruction[]> {
	return fetchJSON('instructions', {
		method: "GET"
	});
}

export async function endpoint_move_command_template_item(
	params: { command_id: string, item_id: string },
	body: MoveItemInput
): Promise<MoveItemResponse> {
	return fetchJSON(`commands/${params.command_id}/items/${params.item_id}/move/` , {
		method: "POST",
		body: JSON.stringify(body)
	});
}

export async function endpoint_update_custom_instruction(
	params: { command_id: string, item_id: string },
	body: UpdateCustomInstructionInput
): Promise<CommandTemplateItem> {
	return fetchJSON(`commands/${params.command_id}/items/${params.item_id}/custom/` , {
		method: "POST",
		body: JSON.stringify(body)
	});
}

export async function endpoint_update_instruction_in_template(
	params: { command_id: string, item_id: string },
	body: UpdateInstructionInput
): Promise<CommandTemplateItem> {
	return fetchJSON(`commands/${params.command_id}/items/${params.item_id}/instruction/` , {
		method: "POST",
		body: JSON.stringify(body)
	});
}
