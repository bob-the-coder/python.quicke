// Auto-generated TypeScript API functions

import { fetchJSON } from '../../fetchJSON';

import { Demo, DemoBasic } from './models';

export async function endpoint_create_demo(
	body: RainerFile
): Promise<Demo> {
	return fetchJSON('demo', {
		method: "POST",
		body: JSON.stringify(body)
	});
}

export async function endpoint_delete_demo(
	params: { id: string }
): Promise<void> {
	return fetchJSON(`demo/${params.id} ` , {
		method: "DELETE"
	});
}

export async function endpoint_demo_basic(): Promise<DemoBasic> {
	return fetchJSON('demo-basic', {
		method: "GET"
	});
}

export async function endpoint_list_demo(): Promise<Demo[]> {
	return fetchJSON('demo', {
		method: "GET"
	});
}

export async function endpoint_retrieve_demo(
	params: { id: string },
	query?: { name?: string, sort?: string }
): Promise<Demo> {
	return fetchJSON(`demo/${params.id} `  + (query ? '?' + new URLSearchParams(query).toString() : ''), {
		method: "GET"
	});
}

export async function endpoint_update_demo(
	params: { id: string },
	body: Demo
): Promise<Demo> {
	return fetchJSON(`demo/${params.id} ` , {
		method: "PUT",
		body: JSON.stringify(body)
	});
}
