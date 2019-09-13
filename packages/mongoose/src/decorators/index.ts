import { SchemaTypeOpts } from 'mongoose';
import { Reflector } from '@davinci/reflector';

/**
 * Decorate a props as mongoose schema property
 * @param opts
 */
export function prop(opts?: SchemaTypeOpts<any>) {
	return function(prototype: Object, key: string | symbol) {
		Reflector.pushMetadata('tsmongoose:props', { key, opts }, prototype.constructor);
	};
}

/**
 * Gives the ability to add compound indexes to a schema.
 * It decorates classes
 * @param index
 * @param options
 */
export function index(index, options?: any) {
	return function(target: Function) {
		Reflector.pushMetadata('tsmongoose:indexes', { index, options }, target);
	};
}

/**
 * Decorate a method as:
 * - mongoose static method is the class method is `static`
 * - mongoose method is the class method is a `prototype` method
 */
export function method() {
	return function(target: Function | Object, key: string) {
		const isPrototype = typeof target === 'object' && typeof target.constructor === 'function';
		const isStatic = typeof target === 'function' && typeof target.prototype === 'object';
		const realTarget = isPrototype ? target.constructor : target;
		const type = (isPrototype && 'prototype') || (isStatic && 'static');
		const handler = target[key];

		Reflector.pushMetadata(
			'tsmongoose:methods',
			{ name: key, type, handler, isStatic, isPrototype },
			realTarget
		);
	};
}

export interface IVirtualArgs {
	ref: string; // The model to use
	localField?: string; // Find people where `localField`
	foreignField: string; // is equal to `foreignField`
	// If `justOne` is true, 'members' will be a single doc as opposed to
	// an array. `justOne` is false by default.
	justOne?: boolean;
	options?: object;
}

/**
 * Decorator that annotates a field as localField
 * for a virtual property
 * Example:
 *   @populate({ name: 'file', opts: { ref: 'File', foreignField: '_id', justOne: true } })
 *   fileId: string
 *
 * will create a `file` property that will use `fileId` as localField
 *
 * @param name
 * @param opts
 */
export function populate({ name, opts }: { name: string; opts: IVirtualArgs }) {
	return function(target: Object, key: string) {
		const options = { ...opts, localField: key };
		Reflector.pushMetadata('tsmongoose:populates', { name, options }, target.constructor);
	};
}

/**
 * Decorator that annotate a method marking it as virtual.
 * The annotated method will be used as the `getter` of the virtual
 */
export function virtual() {
	return function(target: Object, key: string) {
		const handler = target[key];

		Reflector.pushMetadata('tsmongoose:virtuals', { name: key, handler }, target.constructor);
	};
}
