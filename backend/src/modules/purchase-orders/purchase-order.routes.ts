import { Router } from 'express';
import * as c from './purchase-order.controller';
import { validate } from '../../middleware/validate';
import { poSchema, poApproveSchema } from './purchase-order.dto';
const r = Router();
r.get('/', c.list); r.post('/', validate(poSchema), c.create);
r.get('/:id', c.get); r.patch('/:id/approve', validate(poApproveSchema), c.approve); r.post('/:id/receive', c.receive);
export default r;
