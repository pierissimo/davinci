export type SwaggerDefinition = {
	title?: string;
	type?: string;
	description?: string;
	format?: string;
	properties?: { [key: string]: SwaggerDefinition };
	items?: SwaggerDefinition;
	required?: string[];
	$ref?: string;
};

export type SwaggerDefinitions = {
	[key: string]: SwaggerDefinition;
};

export type Schema = { $ref?: string; type?: string; [key: string]: any };

export interface MethodParameterBase {
	name: string;
	description?: string;
	required?: boolean;
	schema?: Schema;
	responses?: {
		[key: number]: {
			description?: string;
			schema?: Schema;
		};
	};
}

export interface MethodParameter extends MethodParameterBase {
	in: 'body' | 'path' | 'query';
}

export type Verb = 'get' | 'post' | 'put' | 'patch' | 'head' | 'delete';

export type PathsDefinition = {
	[key: string]: {
		[key in Verb]: {
			summary: string;
			operationId: string;
			parameters: MethodParameter[];
			consumes: string[];
			produces: string[];
			tags: string[];
			responses?: {
				[key: number]: {
					description: string;
				};
			};
		}
	};
};