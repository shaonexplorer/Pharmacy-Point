import { Router } from 'express';
import * as c from './supplier.controller';
import { validate } from '../../middleware/validate';
import { supplierSchema } from './supplier.dto';
const r = Router();
r.get('/', c.list); r.post('/', validate(supplierSchema), c.create);
r.get('/:id', c.get); r.put('/:id', validate(supplierSchema), c.update); r.delete('/:id', c.remove);
export default r;
