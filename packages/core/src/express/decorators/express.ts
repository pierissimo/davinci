import { Reflector } from '@davinci/reflector';
import _ from 'lodash';

/**
 * Factory function that generates a `req` or `res` decorator
 * @param reqOrRes
 */
export const createReqResExpressDecorator = (reqOrRes: 'req' | 'res') => () => (
	prototype: Object,
	methodName: string,
	index
) => {
	// get the existing metadata props
	const methodParameters = Reflector.getMetadata('tsopenapi:method-parameters', prototype.constructor) || [];
	const isAlreadySet = !!_.find(methodParameters, { methodName, index });
	if (isAlreadySet) return;

	methodParameters.unshift({
		methodName,
		index,
		handler: prototype[methodName],
		type: reqOrRes
	});
	Reflector.defineMetadata('tsopenapi:method-parameters', methodParameters, prototype.constructor);
};

/**
 * Decorator that inject the `req` express object as controller method parameter
 */
export const req = createReqResExpressDecorator('req');

/**
 * Decorator that inject the `res` express object as controller method parameter
 */
export const res = createReqResExpressDecorator('res');

type Stage = 'before' | 'after';

/**
 * Decorator that allow to specify middlewares per controller or controller method basis
 * @param middlewareFunction
 * @param stage
 */
const middleware = (middlewareFunction, stage: Stage = 'before'): Function => {
	return function(target: Object | Function, methodName: string | symbol) {
		const args: { middlewareFunction: Function; stage: Stage; handler?: Function; isControllerMw?: boolean } = {
			middlewareFunction,
			stage
		};
		let realTarget = target;
		if (typeof target === 'object' && target[methodName]) {
			args.handler = target[methodName];
			realTarget = target.constructor;
		} else {
			args.isControllerMw = true;
		}

		// define new metadata methods
		Reflector.unshiftMetadata('tsexpress:method-middleware', args, realTarget);

		return target;
	};
};

/**
 * Decorator that allow to specify a `before` middlewares per controller method basis
 * @param middlewareFunction
 */
middleware.before = middlewareFunction => middleware(middlewareFunction, 'before');

/**
 * Decorator that allow to specify a `after` middlewares per controller method basis
 * @param middlewareFunction
 */
middleware.after = middlewareFunction => middleware(middlewareFunction, 'after');

export { middleware };

/**
 * Decorator that allow to set a response HTTP header
 * @param name
 * @param value
 */
export const header = (name: string, value: string) => {
	return function(prototype: Object, methodName: string | symbol) {
		const meta = { name, value, handler: prototype[methodName] };
		// define new metadata methods
		Reflector.unshiftMetadata('tsexpress:method-response-header', meta, prototype.constructor);
	};
};
