import _ from 'lodash';
import { Reflector } from '@davinci/reflector';
import {
	ReturnTypeFunc,
	ReturnTypeFuncValue,
	ITypeDecoratorOptions,
	IFieldDecoratorOptions,
	IFieldDecoratorMetadata,
	FieldDecoratorOptionsFactory,
	IFieldDecoratorOptionsFactoryArgs,
	ClassType,
	IResolverDecoratorMetadata
} from '../types';

/**
 * It annotates a variable as schema prop
 * @param options
 */
export function type(options?: ITypeDecoratorOptions) {
	return function(target: Function): void {
		const metadata: ITypeDecoratorOptions = options;
		Reflector.defineMetadata('davinci:graphql:types', metadata, target);
	};
}

// for future use
const DEFAULT_FIELD_OPTIONS = {};

/**
 * It annotates a variable as schema prop
 * @param opts
 */
export function field(opts?: IFieldDecoratorOptions | FieldDecoratorOptionsFactory) {
	return function(prototype: Object, key: string | symbol): void {
		const optsFactory = (args: IFieldDecoratorOptionsFactoryArgs) => {
			const options = _.merge(
				{},
				DEFAULT_FIELD_OPTIONS,
				typeof opts === 'function' ? opts(args) : opts
			);
			if (!options.type && !options.typeFactory) {
				options.type = Reflector.getMetadata('design:type', prototype, key);
			}

			return options;
		};
		const metadata: IFieldDecoratorMetadata = { key, optsFactory };
		Reflector.pushMetadata('davinci:graphql:fields', metadata, prototype.constructor);
	};
}

/**
 * Decorator that annotate a query method
 * @param returnType - The return type or class of the resolver
 * @param name - Optional name
 */
export const query = (returnType: ReturnTypeFunc | ReturnTypeFuncValue, name?: string): Function => {
	return function(prototype: Object, methodName: string) {
		const metadata: IResolverDecoratorMetadata = {
			name,
			methodName,
			returnType,
			handler: prototype[methodName]
		};
		Reflector.pushMetadata('davinci:graphql:queries', metadata, prototype.constructor);
	};
};

/**
 * Decorator that annotate a mutation method
 * @param returnType - The return type or class of the resolver
 * @param name - Optional name
 */
export const mutation = (returnType: ReturnTypeFunc | ReturnTypeFuncValue, name?: string): Function => {
	return function(prototype: Object, methodName: string) {
		const metadata: IResolverDecoratorMetadata = {
			name,
			methodName,
			returnType,
			handler: prototype[methodName]
		};
		Reflector.pushMetadata('davinci:graphql:mutations', metadata, prototype.constructor);
	};
};

export interface IArgOptions {
	required?: boolean;
	enum?: { [key: string]: string };
}

/**
 * Decorator that annotate a method parameter
 * @param name
 * @param options
 */
export function arg(name?, options?: IArgOptions): Function {
	return function(prototype: Object, methodName: string, index) {
		// get the existing metadata props
		const methodParameters = Reflector.getMetadata('davinci:graphql:args', prototype.constructor) || [];
		const paramtypes = Reflector.getMetadata('design:paramtypes', prototype, methodName);
		const isAlreadySet = !!_.find(methodParameters, { methodName, index });
		if (isAlreadySet) return;

		methodParameters.unshift({
			methodName,
			index,
			name,
			opts: options,
			handler: prototype[methodName],
			type: paramtypes && paramtypes[index]
		});
		Reflector.defineMetadata('davinci:graphql:args', methodParameters, prototype.constructor);
	};
}

// resolverOf BookSchema,
// returnType [AuthorSchema]
export function fieldResolver<T = {}>(
	resolverOf: ClassType,
	fieldName: keyof T,
	returnType: ClassType | ClassType[]
): Function {
	return function(prototype: Object, methodName: string, index) {
		// get the existing metadata props
		const methodParameters =
			Reflector.getMetadata('davinci:graphql:field-resolvers', resolverOf.prototype.constructor) || [];
		const paramtypes = Reflector.getMetadata('design:paramtypes', prototype, methodName);
		const isAlreadySet = !!_.find(methodParameters, { methodName, index });
		if (isAlreadySet) return;

		methodParameters.unshift({
			prototype,
			methodName,
			resolverOf,
			index,
			fieldName,
			returnType,
			// name,
			// opts: options,
			handler: prototype[methodName],
			type: paramtypes && paramtypes[index]
		});
		Reflector.defineMetadata(
			'davinci:graphql:field-resolvers',
			methodParameters,
			resolverOf.prototype.constructor
		);
	};
}

export function info() {
	return function(prototype: Object, methodName: string, index) {
		// get the existing metadata props
		const methodParameters = Reflector.getMetadata('davinci:graphql:args', prototype.constructor) || [];
		const isAlreadySet = !!_.find(methodParameters, { methodName, index });
		if (isAlreadySet) return;

		methodParameters.unshift({
			methodName,
			index,
			handler: prototype[methodName],
			type: 'info'
		});
		Reflector.defineMetadata('davinci:graphql:args', methodParameters, prototype.constructor);
	};
}

export function selectionSet() {
	return function(prototype: Object, methodName: string, index) {
		// get the existing metadata props
		const methodParameters = Reflector.getMetadata('davinci:graphql:args', prototype.constructor) || [];
		const isAlreadySet = !!_.find(methodParameters, { methodName, index });
		if (isAlreadySet) return;

		methodParameters.unshift({
			methodName,
			index,
			handler: prototype[methodName],
			type: 'selectionSet'
		});
		Reflector.defineMetadata('davinci:graphql:args', methodParameters, prototype.constructor);
	};
}

export function parent() {
	return function(prototype: Object, methodName: string, index) {
		// get the existing metadata props
		const methodParameters = Reflector.getMetadata('davinci:graphql:args', prototype.constructor) || [];
		const isAlreadySet = !!_.find(methodParameters, { methodName, index });
		if (isAlreadySet) return;

		methodParameters.unshift({
			methodName,
			index,
			handler: prototype[methodName],
			type: 'parent'
		});
		Reflector.defineMetadata('davinci:graphql:args', methodParameters, prototype.constructor);
	};
}

export interface IResolverDecoratorArgs {
	excludedMethods?: string[];
	resourceSchema?: Function;
}

/**
 * Decorator that annotate a controller.
 * It allows setting the basepath, resourceSchema, etc
 * @param args
 */
export function resolver(args?: IResolverDecoratorArgs): Function {
	return function(target: Object) {
		// define new metadata props
		Reflector.defineMetadata('davinci:graphql:resolver', args, target);
	};
}