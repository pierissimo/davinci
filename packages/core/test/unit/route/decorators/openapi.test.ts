import should from 'should';
import { openapi } from '../../../../src/route';

describe('openapi decorators', () => {
	describe('@openapi.prop()', () => {
		it('should define metadata correctly', () => {
			class Customer {
				@openapi.prop({ required: false })
				firstname: string;
			}

			const propsMetadata = Reflect.getMetadata('davinci:openapi:props', Customer);
			should(propsMetadata[0])
				.have.property('key')
				.equal('firstname');
			should(propsMetadata[0])
				.have.property('optsFactory')
				.type('function');

			should(propsMetadata[0].optsFactory()).match({ required: false });
		});
	});

	describe('@openapi.definition()', () => {
		it('should define metadata correctly', () => {
			@openapi.definition({ title: 'MyCustomer' })
			class Customer {}

			const definitionMetadata = Reflect.getMetadata('davinci:openapi:definition', Customer);

			should(definitionMetadata).match({ title: 'MyCustomer' });
		});
	});
});
