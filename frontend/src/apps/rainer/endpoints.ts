// Auto-generated TypeScript API functions

import { fetchJSON } from '../../fetchJSON';

import { RainerTree, RefactorRainerFile } from './types';

export async function endpoint_create_directory(
	body: {branch: string, path: string}
): Promise<void> {
	return fetchJSON('rainer/directory/new', {
		method: "POST",
		body: JSON.stringify(body)
	});
}

export async function endpoint_create_file(
	body: RefactorRainerFile
): Promise<void> {
	return fetchJSON('rainer/file/new', {
		method: "POST",
		body: JSON.stringify(body)
	});
}

export async function endpoint_delete_directory(
	query?: { branch?: string, path?: string }
): Promise<void> {
	return fetchJSON('rainer/directory/del' + (query ? '?' + new URLSearchParams(query).toString() : ''), {
		method: "DELETE"
	});
}

export async function endpoint_delete_file(
	query?: { branch?: string, path?: string }
): Promise<void> {
	return fetchJSON('rainer/file/del' + (query ? '?' + new URLSearchParams(query).toString() : ''), {
		method: "DELETE"
	});
}

export async function endpoint_get_file_contents(
	query?: { branch?: string, path?: string }
): Promise<string> {
	return fetchJSON('rainer/file' + (query ? '?' + new URLSearchParams(query).toString() : ''), {
		method: "GET"
	});
}

export async function endpoint_get_rainer_tree(): Promise<RainerTree> {
	return fetchJSON('rainer/tree', {
		method: "GET"
	});
}

export async function endpoint_update_file(
	body: RefactorRainerFile
): Promise<void> {
	return fetchJSON('rainer/file/update', {
		method: "PUT",
		body: JSON.stringify(body)
	});
}
