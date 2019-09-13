import { Reflector } from '@davinci/reflector';
import find from 'lodash/find';

/**
 * Decorate a parameter as context
 */
export const context = (): Function => {
	return function(target: Object, methodName: string | symbol, index) {
		const contextParameters = Reflector.getMetadata('davinci:context', target.constructor) || [];
		const isAlreadySet = !!find(contextParameters, { methodName, index });
		if (isAlreadySet) return;

		contextParameters.unshift({
			methodName,
			index,
			handler: target[methodName],
			type: 'context'
		});

		Reflector.defineMetadata('davinci:context', contextParameters, target.constructor);
	};
};
