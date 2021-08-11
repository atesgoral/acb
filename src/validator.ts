import Ajv, {JTDSchemaType} from 'ajv/dist/jtd';

import {ColorBook} from './types';

const schema: JTDSchemaType<ColorBook> = {
  properties: {
    id: {type: 'uint16'},
    title: {type: 'string'},
    colorNamePrefix: {type: 'string'},
    colorNameSuffix: {type: 'string'},
    description: {type: 'string'},
    pageSize: {type: 'uint16'},
    pageMidPoint: {type: 'uint16'},
    colorSpace: {enum: ['RGB', 'CMYK', 'Lab']},
    colors: {
      elements: {
        properties: {
          name: {type: 'string'},
          code: {type: 'string'},
          components: {
            elements: {type: 'int16'},
          },
        },
      },
    },
    isSpot: {type: 'boolean'},
  },
};

const ajv = new Ajv();
const validate = ajv.compile(schema);

export default validate;
